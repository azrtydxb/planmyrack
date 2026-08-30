import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { startServer } from '@planmyrack/server'
import { runStoreContract } from '../src/contract.ts'
import { StoreUnavailableError, createHttpStore, probeServer } from '../src/index.ts'

const tmpDb = () => join(mkdtempSync(join(tmpdir(), 'pmr-')), 'test.db')
const DEAD = 'http://127.0.0.1:1'

runStoreContract('http store', async () => {
  const server = await startServer({ port: 0, dbPath: tmpDb() })
  return { store: createHttpStore(server.url), dispose: () => server.close() }
})

describe('TestModeChooserAndHealthProbe', () => {
  it('reports ok and a version against a running server', async () => {
    const server = await startServer({ port: 0, dbPath: tmpDb() })
    try {
      const probe = await probeServer(server.url)
      expect(probe.ok).toBe(true)
      expect(probe.version).toBeTruthy()
    } finally {
      await server.close()
    }
  })

  it('reports a named failure against a dead address without throwing', async () => {
    const probe = await probeServer(DEAD)
    expect(probe.ok).toBe(false)
    expect(probe.reason).toBeTruthy()
  })

  it('rejects an address that answers but is not a PlanMyRack server', async () => {
    const notUs = async () => new Response(JSON.stringify({ hello: 'world' }), { status: 200 })
    const probe = await probeServer('http://example.test', notUs as unknown as typeof fetch)
    expect(probe.ok).toBe(false)
    expect(probe.reason).toContain('not a PlanMyRack server')
  })

  it('raises StoreUnavailableError from the store when the server is gone', async () => {
    await expect(createHttpStore(DEAD).list()).rejects.toThrow(StoreUnavailableError)
  })

  it('says the server is unreachable rather than blaming the layout on a 500', async () => {
    const broken = async () => new Response('boom', { status: 500 })
    const store = createHttpStore('http://example.test', broken as unknown as typeof fetch)
    await expect(store.list()).rejects.toThrow(/Can't reach the server/)
  })
})

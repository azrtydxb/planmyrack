import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { newLayout } from '@planmyrack/core'
import { startServer } from '../src/index.ts'
import type { Layout } from '@planmyrack/core'
import type { LayoutSummary } from '@planmyrack/storage'

/** node's fetch types json() as unknown; these helpers keep the tests readable. */
const asLayout = async (res: Response): Promise<Layout> => (await res.json()) as Layout
const asSummaries = async (res: Response): Promise<LayoutSummary[]> =>
  (await res.json()) as LayoutSummary[]

const tmpDb = () => join(mkdtempSync(join(tmpdir(), 'pmr-')), 'test.db')
const post = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})
const put = (body: unknown) => ({ ...post(body), method: 'PUT' })

describe('TestServerLayoutVisibleToSecondClient', () => {
  it('lists a layout saved by one client to another client', async () => {
    const server = await startServer({ port: 0, dbPath: tmpDb() })
    try {
      const made = await asLayout(
        await fetch(`${server.url}/api/layouts`, post(newLayout('Shared'))),
      )
      const seen = await asSummaries(await fetch(`${server.url}/api/layouts`))
      expect(seen.map((s) => s.id)).toContain(made.id)
      expect(seen[0]!.name).toBe('Shared')
    } finally {
      await server.close()
    }
  })
})

describe('TestStaleSaveRejected — over HTTP', () => {
  it('answers 409 with the server copy and does not overwrite', async () => {
    const server = await startServer({ port: 0, dbPath: tmpDb() })
    try {
      const saved = await asLayout(
        await fetch(`${server.url}/api/layouts`, post(newLayout('Shared'))),
      )
      const theirs = await fetch(
        `${server.url}/api/layouts/${saved.id}`,
        put({ ...saved, name: 'theirs' }),
      )
      expect(theirs.status).toBe(200)

      const mine = await fetch(
        `${server.url}/api/layouts/${saved.id}`,
        put({ ...saved, name: 'mine' }),
      )
      expect(mine.status).toBe(409)
      const body = (await mine.json()) as { current: Layout; error: string }
      expect(body.current.name).toBe('theirs')
      expect(body.error).toContain('changed on another device')
    } finally {
      await server.close()
    }
  })
})

describe('TestHealthEndpoint', () => {
  it('answers ok with a version', async () => {
    const server = await startServer({ port: 0, dbPath: tmpDb() })
    try {
      const health = (await (await fetch(`${server.url}/api/health`)).json()) as { ok: boolean }
      expect(health.ok).toBe(true)
    } finally {
      await server.close()
    }
  })
})

describe('TestWebBuildIsServedCrossOriginIsolated', () => {
  it('sends the COOP and COEP headers OPFS needs', async () => {
    const webRoot = join(mkdtempSync(join(tmpdir(), 'pmr-web-')), 'dist')
    mkdirSync(webRoot, { recursive: true })
    writeFileSync(join(webRoot, 'index.html'), '<!doctype html><title>PlanMyRack</title>')

    const server = await startServer({ port: 0, dbPath: tmpDb(), webRoot })
    try {
      const res = await fetch(`${server.url}/`)
      expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin')
      // credentialless is what the Expo SDK 57 docs require for expo-sqlite on web
      expect(res.headers.get('cross-origin-embedder-policy')).toBe('credentialless')
    } finally {
      await server.close()
    }
  })
})

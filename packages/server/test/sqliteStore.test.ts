import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { newLayout } from '@planmyrack/core'
import { runStoreContract } from '@planmyrack/storage/contract'
import { createSqliteStore } from '../src/sqliteStore.ts'

const tmpDb = () => join(mkdtempSync(join(tmpdir(), 'pmr-')), 'test.db')

runStoreContract('sqlite store', async () => {
  const store = createSqliteStore(tmpDb())
  return { store, dispose: async () => store.close() }
})

describe('TestSqliteStoreSurvivesReopen', () => {
  it('still has the layout after the database is closed and opened again', async () => {
    const path = tmpDb()
    const first = createSqliteStore(path)
    const saved = await first.create(newLayout('Basement'))
    first.close()

    const second = createSqliteStore(path)
    expect((await second.get(saved.id!)).name).toBe('Basement')
    second.close()
  })
})

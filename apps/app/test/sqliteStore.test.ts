import { DatabaseSync } from 'node:sqlite'
import { runStoreContract } from '@planmyrack/storage/contract'
import { createStoreOn } from '../src/storage/sqliteStore'
import type { SqliteLike } from '../src/storage/sqliteStore'

/**
 * expo-sqlite's native module does not exist under jest, so the contract runs the app's store
 * code against a real SQLite database through node:sqlite instead. That proves the SQL and every
 * store semantic — revisions, pruning, not-found — but NOT expo-sqlite's own binding, which is
 * exercised when the app actually runs (Task 19's offline check).
 */
const nodeSqlite = (): SqliteLike => {
  const db = new DatabaseSync(':memory:')
  return {
    async execAsync(source) {
      db.exec(source)
    },
    async runAsync(source, ...params) {
      const result = db.prepare(source).run(...(params as never[]))
      return { changes: Number(result.changes) }
    },
    async getAllAsync<T>(source: string, ...params: unknown[]) {
      return db.prepare(source).all(...(params as never[])) as T[]
    },
    async getFirstAsync<T>(source: string, ...params: unknown[]) {
      return (db.prepare(source).get(...(params as never[])) ?? null) as T | null
    },
    async closeAsync() {
      db.close()
    },
  }
}

runStoreContract('app sqlite store (node:sqlite driver)', async () => {
  const store = await createStoreOn(nodeSqlite())
  return { store, dispose: () => store.close() }
})

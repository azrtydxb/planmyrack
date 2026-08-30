import * as SQLite from 'expo-sqlite'
import { newId } from '@planmyrack/core'
import { NotFoundError, StaleRevisionError } from '@planmyrack/storage'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore, LayoutSummary, Template } from '@planmyrack/storage'

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS layouts (
    id         TEXT    PRIMARY KEY,
    name       TEXT    NOT NULL,
    revision   INTEGER NOT NULL,
    doc        TEXT    NOT NULL,
    created_at TEXT    NOT NULL,
    updated_at TEXT    NOT NULL
  );
  CREATE TABLE IF NOT EXISTS templates (
    id  TEXT PRIMARY KEY,
    doc TEXT NOT NULL
  );
`

interface LayoutRow {
  id: string
  name: string
  revision: number
  doc: string
  created_at: string
  updated_at: string
}

/**
 * The slice of expo-sqlite this store uses. Declaring it lets the tests drive the very same store
 * code against a real SQLite database in Node — expo-sqlite's native module does not exist under
 * jest, so without this the adapter could only be tested against a mock of itself.
 */
export interface SqliteLike {
  execAsync(source: string): Promise<unknown>
  runAsync(source: string, ...params: unknown[]): Promise<{ changes: number }>
  getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>
  getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>
  closeAsync(): Promise<void>
}

/** The on-device store: same SQL and semantics as the server's node:sqlite store. */
export async function createExpoSqliteStore(
  dbName = 'planmyrack.db',
): Promise<LayoutStore & { close(): Promise<void> }> {
  return createStoreOn((await SQLite.openDatabaseAsync(dbName)) as unknown as SqliteLike)
}

export async function createStoreOn(
  db: SqliteLike,
): Promise<LayoutStore & { close(): Promise<void> }> {
  await db.execAsync(SCHEMA)

  const readRow = async (id: string): Promise<LayoutRow> => {
    const row = await db.getFirstAsync<LayoutRow>('SELECT * FROM layouts WHERE id = ?', id)
    if (!row) throw new NotFoundError(id)
    return row
  }
  const toLayout = (row: LayoutRow): Layout => ({
    ...(JSON.parse(row.doc) as Layout),
    id: row.id,
    name: row.name,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })

  return {
    async list(): Promise<LayoutSummary[]> {
      const rows = await db.getAllAsync<Omit<LayoutRow, 'doc'>>(
        'SELECT id, name, revision, created_at, updated_at FROM layouts ORDER BY updated_at DESC',
      )
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        revision: r.revision,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }))
    },
    async get(id) {
      return toLayout(await readRow(id))
    },
    async create(layout) {
      const now = new Date().toISOString()
      const stored: Layout = {
        ...layout,
        id: newId(),
        revision: 1,
        createdAt: layout.createdAt ?? now,
        updatedAt: now,
      }
      await db.runAsync(
        'INSERT INTO layouts (id, name, revision, doc, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        stored.id!,
        stored.name,
        1,
        JSON.stringify(stored),
        stored.createdAt,
        now,
      )
      return stored
    },
    async update(layout) {
      if (!layout.id) throw new NotFoundError('(no id)')
      const row = await readRow(layout.id)
      if (row.revision !== layout.revision) throw new StaleRevisionError(toLayout(row))
      const next: Layout = {
        ...layout,
        revision: row.revision + 1,
        createdAt: row.created_at,
        updatedAt: new Date().toISOString(),
      }
      await db.runAsync(
        'UPDATE layouts SET name = ?, revision = ?, doc = ?, updated_at = ? WHERE id = ?',
        next.name,
        next.revision,
        JSON.stringify(next),
        next.updatedAt,
        next.id!,
      )
      return next
    },
    async remove(id) {
      const result = await db.runAsync('DELETE FROM layouts WHERE id = ?', id)
      if (result.changes === 0) throw new NotFoundError(id)
    },
    async listTemplates() {
      const rows = await db.getAllAsync<{ doc: string }>('SELECT doc FROM templates')
      return rows.map((r) => JSON.parse(r.doc) as Template)
    },
    async saveTemplate(template) {
      const stored = { ...template, id: template.id || newId() }
      await db.runAsync(
        'INSERT OR REPLACE INTO templates (id, doc) VALUES (?, ?)',
        stored.id,
        JSON.stringify(stored),
      )
      return stored
    },
    async removeTemplate(id) {
      await db.runAsync('DELETE FROM templates WHERE id = ?', id)
    },
    async close() {
      await db.closeAsync()
    },
  }
}

import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { newId } from '@planmyrack/core'
import { NotFoundError, SCHEMA, SQL, StaleRevisionError } from '@planmyrack/storage'
import type { Layout } from '@planmyrack/core'
import type { LayoutRow, LayoutStore, LayoutSummary, Template } from '@planmyrack/storage'

/** The server's store: the shared schema and statements, run through node:sqlite. */
export function createSqliteStore(dbPath: string): LayoutStore & { close(): void } {
  if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)
  db.exec(SCHEMA)

  const q = {
    list: db.prepare(SQL.list),
    get: db.prepare(SQL.get),
    insert: db.prepare(SQL.insert),
    update: db.prepare(SQL.update),
    remove: db.prepare(SQL.remove),
    templates: db.prepare(SQL.templates),
    saveTemplate: db.prepare(SQL.saveTemplate),
    removeTemplate: db.prepare(SQL.removeTemplate),
  }

  const readRow = (id: string): LayoutRow => {
    const row = q.get.get(id) as LayoutRow | undefined
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
      return (q.list.all() as Omit<LayoutRow, 'doc'>[]).map((r) => ({
        id: r.id,
        name: r.name,
        revision: r.revision,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }))
    },
    async get(id) {
      return toLayout(readRow(id))
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
      q.insert.run(stored.id!, stored.name, 1, JSON.stringify(stored), stored.createdAt, now)
      return stored
    },
    async update(layout) {
      if (!layout.id) throw new NotFoundError('(no id)')
      const row = readRow(layout.id)
      if (row.revision !== layout.revision) throw new StaleRevisionError(toLayout(row))
      const next: Layout = {
        ...layout,
        revision: row.revision + 1,
        createdAt: row.created_at,
        updatedAt: new Date().toISOString(),
      }
      q.update.run(next.name, next.revision, JSON.stringify(next), next.updatedAt, next.id!)
      return next
    },
    async remove(id) {
      if (q.remove.run(id).changes === 0) throw new NotFoundError(id)
    },
    async listTemplates() {
      return (q.templates.all() as { doc: string }[]).map((r) => JSON.parse(r.doc) as Template)
    },
    async saveTemplate(template) {
      const stored = { ...template, id: template.id || newId() }
      q.saveTemplate.run(stored.id, JSON.stringify(stored))
      return stored
    },
    async removeTemplate(id) {
      q.removeTemplate.run(id)
    },
    close() {
      db.close()
    },
  }
}

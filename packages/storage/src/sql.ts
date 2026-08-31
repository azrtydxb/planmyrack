/**
 * The SQL both SQLite adapters run: node:sqlite on the server, expo-sqlite on the device. The
 * drivers differ (one is synchronous, one is not) but the schema and the statements must not —
 * a layout written on the server has to be readable on a phone. Keeping the strings here makes
 * a divergence a compile error rather than something the contract suite catches later.
 *
 * The layout document is stored whole in `doc`; name and revision are mirrored into columns so
 * listing never has to parse JSON. Racks, devices and cables are always read, written and undone
 * together, so splitting them into tables would buy a join and nothing else.
 */
export const SCHEMA = `
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

export const SQL = {
  list: 'SELECT id, name, revision, created_at, updated_at FROM layouts ORDER BY updated_at DESC',
  get: 'SELECT * FROM layouts WHERE id = ?',
  insert:
    'INSERT INTO layouts (id, name, revision, doc, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  update: 'UPDATE layouts SET name = ?, revision = ?, doc = ?, updated_at = ? WHERE id = ?',
  remove: 'DELETE FROM layouts WHERE id = ?',
  templates: 'SELECT doc FROM templates',
  saveTemplate: 'INSERT OR REPLACE INTO templates (id, doc) VALUES (?, ?)',
  removeTemplate: 'DELETE FROM templates WHERE id = ?',
} as const

/** One row of `layouts`, as both drivers return it. */
export interface LayoutRow {
  id: string
  name: string
  revision: number
  doc: string
  created_at: string
  updated_at: string
}

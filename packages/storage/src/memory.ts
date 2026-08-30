import { newId } from '@planmyrack/core'
import { NotFoundError, StaleRevisionError } from './types.ts'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore, LayoutSummary, Template } from './types.ts'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const summarise = (l: Layout): LayoutSummary => ({
  id: l.id!,
  name: l.name,
  revision: l.revision,
  createdAt: l.createdAt,
  updatedAt: l.updatedAt,
})

/** Reference implementation of LayoutStore, and the baseline the contract suite is written against. */
export function createMemoryStore(): LayoutStore {
  const layouts = new Map<string, Layout>()
  const templates = new Map<string, Template>()

  const read = (id: string): Layout => {
    const found = layouts.get(id)
    if (!found) throw new NotFoundError(id)
    return found
  }

  return {
    async list() {
      return [...layouts.values()]
        .map(summarise)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    async get(id) {
      return clone(read(id))
    },
    async create(layout) {
      const now = new Date().toISOString()
      const stored: Layout = {
        ...clone(layout),
        id: newId(),
        revision: 1,
        createdAt: layout.createdAt ?? now,
        updatedAt: now,
      }
      layouts.set(stored.id!, stored)
      return clone(stored)
    },
    async update(layout) {
      if (!layout.id) throw new NotFoundError('(no id)')
      const stored = read(layout.id)
      if (stored.revision !== layout.revision) throw new StaleRevisionError(clone(stored))
      const next: Layout = {
        ...clone(layout),
        revision: stored.revision + 1,
        createdAt: stored.createdAt,
        updatedAt: new Date().toISOString(),
      }
      layouts.set(next.id!, next)
      return clone(next)
    },
    async remove(id) {
      if (!layouts.delete(id)) throw new NotFoundError(id)
    },
    async listTemplates() {
      return [...templates.values()].map(clone)
    },
    async saveTemplate(template) {
      const stored = { ...clone(template), id: template.id || newId() }
      templates.set(stored.id, stored)
      return clone(stored)
    },
    async removeTemplate(id) {
      templates.delete(id)
    },
  }
}

import { newDevice } from '@planmyrack/core'
import { BUNDLED_CATALOG } from './bundled.js'
import type { CatalogEntry } from './types.js'
import type { Device, Face } from '@planmyrack/core'

export * from './types.js'
export { BUNDLED_CATALOG } from './bundled.js'

export function catalogByVendor(
  entries: CatalogEntry[] = BUNDLED_CATALOG,
): Map<string, CatalogEntry[]> {
  const grouped = new Map<string, CatalogEntry[]>()
  for (const entry of entries) {
    const list = grouped.get(entry.vendor) ?? []
    list.push(entry)
    grouped.set(entry.vendor, list)
  }
  return grouped
}

export function deviceFromCatalog(
  entry: CatalogEntry,
  at: { rackId: string; face: Face; posU: number },
): Device {
  return newDevice({
    ...at,
    heightU: entry.heightU,
    type: entry.type,
    name: entry.vendor === 'Generic' ? entry.model : `${entry.vendor} ${entry.model}`,
    ports: entry.ports,
    outlets: entry.outlets,
    watts: entry.watts,
    colour: entry.colour,
  })
}

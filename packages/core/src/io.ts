import { ImportError } from './errors.js'
import { layoutSchema } from './schema.js'
import { SCHEMA_VERSION } from './types.js'
import type { Layout } from './types.js'

export function exportJson(layout: Layout): string {
  const { schemaVersion, ...rest } = layout
  return JSON.stringify({ schemaVersion: schemaVersion ?? SCHEMA_VERSION, ...rest }, null, 2)
}

const duplicates = (ids: string[]): string[] => {
  const seen = new Set<string>()
  return ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)))
}

/**
 * Reads an exported layout. The id and revision are dropped so an import can never overwrite a
 * stored layout — it always arrives as a new document.
 */
export function importJson(text: string): Layout {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new ImportError('it is not valid JSON')
  }

  const version = (raw as { schemaVersion?: unknown })?.schemaVersion
  if (typeof version === 'number' && version > SCHEMA_VERSION) {
    throw new ImportError(
      `it was written by a newer version (schemaVersion ${version}, this app reads ${SCHEMA_VERSION})`,
    )
  }

  const parsed = layoutSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]!
    throw new ImportError(
      `${issue.path.join('.') || 'the document'} ${issue.message.toLowerCase()}`,
    )
  }
  const doc = parsed.data

  const dupes = duplicates([
    ...doc.racks.map((r) => r.id),
    ...doc.devices.map((d) => d.id),
    ...doc.links.map((l) => l.id),
  ])
  if (dupes.length > 0) throw new ImportError(`it reuses the id ${dupes[0]}`)

  const rackIds = new Set(doc.racks.map((r) => r.id))
  const stray = doc.devices.find((d) => !rackIds.has(d.rackId))
  if (stray) throw new ImportError(`device ${stray.name} names a rack that is not in the file`)

  const deviceIds = new Set(doc.devices.map((d) => d.id))
  const dangling = doc.links.find(
    (l) => !deviceIds.has(l.a.deviceId) || !deviceIds.has(l.b.deviceId),
  )
  if (dangling) throw new ImportError('a cable points at a device that is not in the file')

  const now = new Date().toISOString()
  return {
    schemaVersion: SCHEMA_VERSION,
    id: null,
    name: doc.name,
    revision: 0,
    createdAt: doc.createdAt ?? now,
    updatedAt: now,
    racks: doc.racks,
    devices: doc.devices,
    links: doc.links,
  }
}

const cell = (value: string | number): string => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const csv = (header: string[], rows: (string | number)[][]): string =>
  [header.join(','), ...rows.map((r) => r.map(cell).join(','))].join('\n') + '\n'

export const PARTS_CSV_HEADER = [
  'rack',
  'face',
  'position_u',
  'height_u',
  'name',
  'type',
  'ports',
  'watts',
  'weight_kg',
  'depth_mm',
  'notes',
]

export const CABLES_CSV_HEADER = [
  'from_device',
  'from_port',
  'to_device',
  'to_port',
  'label',
  'type',
  'colour',
]

export function partsCsv(layout: Layout): string {
  const rackName = (id: string) => layout.racks.find((r) => r.id === id)?.name ?? ''
  return csv(
    PARTS_CSV_HEADER,
    layout.devices.map((d) => [
      rackName(d.rackId),
      d.face,
      d.posU,
      d.heightU,
      d.name,
      d.type,
      d.ports,
      d.watts,
      d.weightKg,
      d.depthMm,
      d.notes,
    ]),
  )
}

export function cablesCsv(layout: Layout): string {
  const name = (id: string) => layout.devices.find((d) => d.id === id)?.name ?? id
  return csv(
    CABLES_CSV_HEADER,
    layout.links.map((l) => [
      name(l.a.deviceId),
      l.a.port + 1,
      name(l.b.deviceId),
      l.b.port + 1,
      l.label,
      l.cableType,
      l.colour,
    ]),
  )
}

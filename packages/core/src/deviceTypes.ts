import type { DeviceType } from './types.ts'
import { UNIT_SIZES } from './types.ts'

export interface DeviceTypeSpec {
  type: DeviceType
  label: string
  /** Heights this type can be placed at. */
  sizes: number[]
  defaultPorts: number
  maxPorts: number
  /** Power outlets this type can supply to other devices. */
  defaultOutlets: number
  maxOutlets: number
  /**
   * Whether this type has a power inlet at all. A shelf or a blanking plate does not, so it
   * can never appear on the drawing end of a power link.
   */
  drawsPower: boolean
  defaultColour: string
}

const spec = (
  type: DeviceType,
  label: string,
  sizes: number[],
  [defaultPorts, maxPorts]: [number, number],
  [defaultOutlets, maxOutlets]: [number, number],
  drawsPower: boolean,
  defaultColour: string,
): DeviceTypeSpec => ({
  type,
  label,
  sizes,
  defaultPorts,
  maxPorts,
  defaultOutlets,
  maxOutlets,
  drawsPower,
  defaultColour,
})

export const DEVICE_TYPES: Record<DeviceType, DeviceTypeSpec> = {
  equipment: spec('equipment', 'Equipment', [...UNIT_SIZES], [0, 8], [0, 0], true, '#3b82f6'),
  server: spec('server', 'Server', [1, 2, 4], [2, 8], [0, 0], true, '#22c55e'),
  // A router or gateway carries a switch's worth of ports on the front, which is more than the
  // eight a piece of generic equipment is allowed.
  gateway: spec('gateway', 'Gateway', [1, 2], [8, 32], [0, 0], true, '#6366f1'),
  // 52 rather than 48: a 48-port switch carries its uplink cages on top of the copper, and those
  // cages are ports like any other.
  switch: spec('switch', 'Switch', [1, 2], [24, 52], [0, 0], true, '#a855f7'),
  patch: spec('patch', 'Patch panel', [1, 2], [24, 48], [0, 0], false, '#64748b'),
  pdu: spec('pdu', 'PDU', [1, 2], [0, 2], [8, 24], false, '#ef4444'),
  ups: spec('ups', 'UPS', [2, 3, 4], [1, 2], [0, 8], true, '#f97316'),
  shelf: spec('shelf', 'Shelf', [1, 2], [0, 0], [0, 0], false, '#78716c'),
  blank: spec('blank', 'Blank panel', [0.5, 1, 2], [0, 0], [0, 0], false, '#3f3f46'),
  hooks: spec('hooks', 'Cable mgmt (hooks)', [0.5, 1], [0, 0], [0, 0], false, '#0ea5e9'),
  brush: spec('brush', 'Cable mgmt (brush)', [0.5, 1], [0, 0], [0, 0], false, '#0d9488'),
}

export const sizeLabel = (heightU: number): string => (heightU === 0.5 ? '½U' : `${heightU}U`)

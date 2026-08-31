import { newId } from './ids.ts'
import { DEVICE_TYPES, sizeLabel } from './deviceTypes.ts'
import { SCHEMA_VERSION } from './types.ts'
import type { Device, DeviceType, Face, Layout, Rack } from './types.ts'

export function newRack(input: Partial<Rack> = {}): Rack {
  const width = input.width ?? 19
  return {
    id: input.id ?? newId(),
    name: input.name ?? 'Rack A',
    width,
    units: input.units ?? 12,
    depthMm: input.depthMm ?? 450,
  }
}

export function newLayout(name = 'Untitled layout', racks?: Rack[]): Layout {
  const now = new Date().toISOString()
  return {
    schemaVersion: SCHEMA_VERSION,
    id: null,
    name,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    racks: racks ?? [newRack()],
    devices: [],
    links: [],
  }
}

export interface NewDeviceInput extends Partial<Device> {
  rackId: string
  face: Face
  posU: number
  heightU: number
  type: DeviceType
}

export function newDevice(input: NewDeviceInput): Device {
  const spec = DEVICE_TYPES[input.type]
  return {
    id: input.id ?? newId(),
    rackId: input.rackId,
    face: input.face,
    posU: input.posU,
    heightU: input.heightU,
    type: input.type,
    name: input.name ?? `${spec.label} ${sizeLabel(input.heightU)}`,
    colour: input.colour ?? spec.defaultColour,
    ports: input.ports ?? spec.defaultPorts,
    outlets: input.outlets ?? spec.defaultOutlets,
    watts: input.watts ?? 0,
    weightKg: input.weightKg ?? 0,
    depthMm: input.depthMm ?? 0,
    notes: input.notes ?? '',
    ...(input.faceplate ? { faceplate: input.faceplate } : {}),
    ...(input.bays === undefined ? {} : { bays: input.bays }),
    ...(input.sfp === undefined ? {} : { sfp: input.sfp }),
    ...(input.slots === undefined ? {} : { slots: input.slots }),
    ...(input.host ? { host: input.host } : {}),
    ...(input.width === undefined ? {} : { width: input.width }),
    ...(input.column === undefined ? {} : { column: input.column }),
    ...(input.portSpeed ? { portSpeed: input.portSpeed } : {}),
    ...(input.sfpSpeed ? { sfpSpeed: input.sfpSpeed } : {}),
  }
}

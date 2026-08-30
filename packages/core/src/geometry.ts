import type { Device, Face, Layout, Rack } from './types.js'

/** Positions live on a half-unit grid; everything that comes from a pointer goes through here. */
export const snapHalfU = (u: number): number => Math.round(u * 2) / 2

export interface Probe {
  /** The device being moved, if any — it never collides with itself. */
  id?: string
  rackId: string
  face: Face
  posU: number
  heightU: number
}

/** Two devices clash when they share a rack face and their unit ranges overlap. */
export function collides(devices: Device[], probe: Probe): boolean {
  return devices.some(
    (d) =>
      d.id !== probe.id &&
      d.rackId === probe.rackId &&
      d.face === probe.face &&
      probe.posU < d.posU + d.heightU &&
      d.posU < probe.posU + probe.heightU,
  )
}

/**
 * The nearest free position to `probe.posU`, searched outward in half-unit steps.
 * Returns null when the face cannot hold the device anywhere — the caller refuses the drop.
 */
export function findFreeSlot(
  devices: Device[],
  rack: Rack,
  probe: Omit<Probe, 'rackId'> & { rackId?: string },
): number | null {
  const rackId = probe.rackId ?? rack.id
  const highest = rack.units - probe.heightU
  if (highest < 0) return null

  const wanted = Math.min(Math.max(snapHalfU(probe.posU), 0), highest)
  const steps = Math.ceil(rack.units * 2)
  for (let step = 0; step <= steps; step++) {
    for (const candidate of step === 0 ? [wanted] : [wanted + step / 2, wanted - step / 2]) {
      if (candidate < 0 || candidate > highest) continue
      if (!collides(devices, { ...probe, rackId, posU: candidate })) return snapHalfU(candidate)
    }
  }
  return null
}

export interface RackStats {
  unitsUsedFront: number
  unitsUsedRear: number
  unitsFree: number
  watts: number
  weightKg: number
  deviceCount: number
  linkCount: number
}

export function rackStats(layout: Layout, rackId: string): RackStats {
  const rack = layout.racks.find((r) => r.id === rackId)
  const devices = layout.devices.filter((d) => d.rackId === rackId)
  const used = (face: Face) =>
    devices.filter((d) => d.face === face).reduce((sum, d) => sum + d.heightU, 0)
  const ids = new Set(devices.map((d) => d.id))

  const unitsUsedFront = used('front')
  const unitsUsedRear = used('rear')
  return {
    unitsUsedFront,
    unitsUsedRear,
    // A rack is only as free as its fuller face: a rear PDU does not free up front space.
    unitsFree: (rack?.units ?? 0) - Math.max(unitsUsedFront, unitsUsedRear),
    watts: devices.reduce((sum, d) => sum + d.watts, 0),
    weightKg: devices.reduce((sum, d) => sum + d.weightKg, 0),
    deviceCount: devices.length,
    linkCount: layout.links.filter((l) => ids.has(l.a.deviceId) || ids.has(l.b.deviceId)).length,
  }
}

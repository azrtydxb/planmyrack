import { PlacementError } from './errors.js'
import { DEVICE_TYPES } from './deviceTypes.js'
import { findFreeSlot } from './geometry.js'
import { pruneLinks } from './links.js'
import type { Device, Face, Layout, Rack } from './types.js'

const rackOf = (layout: Layout, rackId: string): Rack => {
  const rack = layout.racks.find((r) => r.id === rackId)
  if (!rack) throw new PlacementError('no-such-rack', `no rack ${rackId} in this layout`)
  return rack
}

const deviceOf = (layout: Layout, deviceId: string): Device => {
  const device = layout.devices.find((d) => d.id === deviceId)
  if (!device) throw new PlacementError('no-such-device', `no device ${deviceId} in this layout`)
  return device
}

const touched = (layout: Layout, patch: Partial<Layout>): Layout => ({
  ...layout,
  ...patch,
  updatedAt: new Date().toISOString(),
})

/** Places a device at the nearest free slot, or throws when the face cannot hold it. */
export function addDevice(layout: Layout, device: Device): Layout {
  const rack = rackOf(layout, device.rackId)
  const posU = findFreeSlot(layout.devices, rack, device)
  if (posU === null) {
    throw new PlacementError(
      'no-room',
      `${rack.name} has no free ${device.heightU}U slot on the ${device.face}`,
    )
  }
  return touched(layout, { devices: [...layout.devices, { ...device, posU }] })
}

export function moveDevice(
  layout: Layout,
  deviceId: string,
  target: { rackId: string; face: Face; posU: number },
): Layout {
  const device = deviceOf(layout, deviceId)
  const rack = rackOf(layout, target.rackId)
  const posU = findFreeSlot(layout.devices, rack, { ...device, ...target })
  if (posU === null) {
    throw new PlacementError(
      'no-room',
      `${rack.name} has no free ${device.heightU}U slot on the ${target.face}`,
    )
  }
  return touched(layout, {
    devices: layout.devices.map((d) => (d.id === deviceId ? { ...d, ...target, posU } : d)),
  })
}

/** Applies a patch, clamping ports/outlets to what the (possibly new) type allows, then prunes. */
export function updateDevice(layout: Layout, deviceId: string, patch: Partial<Device>): Layout {
  const device = deviceOf(layout, deviceId)
  const next = { ...device, ...patch, id: device.id }
  const spec = DEVICE_TYPES[next.type]
  next.ports = Math.max(0, Math.min(next.ports, spec.maxPorts))
  next.outlets = Math.max(0, Math.min(next.outlets, spec.maxOutlets))

  if (patch.heightU !== undefined || patch.posU !== undefined || patch.face !== undefined) {
    const rack = rackOf(layout, next.rackId)
    const posU = findFreeSlot(layout.devices, rack, next)
    if (posU === null) {
      throw new PlacementError('no-room', `${rack.name} has no free ${next.heightU}U slot`)
    }
    next.posU = posU
  }

  return pruneLinks(
    touched(layout, { devices: layout.devices.map((d) => (d.id === deviceId ? next : d)) }),
  )
}

export function removeDevice(layout: Layout, deviceId: string): Layout {
  return pruneLinks(touched(layout, { devices: layout.devices.filter((d) => d.id !== deviceId) }))
}

export function addRack(layout: Layout, rack: Rack): Layout {
  return touched(layout, { racks: [...layout.racks, rack] })
}

/** Rejects a resize that would leave a device hanging off the top of the rack. */
export function updateRack(layout: Layout, rackId: string, patch: Partial<Rack>): Layout {
  const rack = rackOf(layout, rackId)
  const next = { ...rack, ...patch, id: rack.id }
  const stranded = layout.devices.filter(
    (d) => d.rackId === rackId && d.posU + d.heightU > next.units,
  )
  if (stranded.length > 0) {
    throw new PlacementError(
      'would-strand',
      `${stranded.length} device(s) sit above ${next.units}U in ${rack.name} — move them first`,
    )
  }
  return touched(layout, { racks: layout.racks.map((r) => (r.id === rackId ? next : r)) })
}

export function removeRack(layout: Layout, rackId: string): Layout {
  return pruneLinks(
    touched(layout, {
      racks: layout.racks.filter((r) => r.id !== rackId),
      devices: layout.devices.filter((d) => d.rackId !== rackId),
    }),
  )
}

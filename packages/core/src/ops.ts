import { PlacementError } from './errors.ts'
import { DEVICE_TYPES } from './deviceTypes.ts'
import { findFreeSlot, fitsRack } from './geometry.ts'
import { pruneLinks } from './links.ts'
import type { Device, Face, Layout, Rack } from './types.ts'

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

/**
 * 19" gear does not go in a 10" rack — there is nowhere for the ears to land. The other way round
 * is fine: 10" gear sits in a 19" rack on extended mounts, often two across one unit.
 */
function refuseWrongWidth(device: Device, rack: Rack): void {
  if (!fitsRack(device.width, rack)) {
    throw new PlacementError(
      'wrong-width',
      `${device.name} is ${device.width}" gear and ${rack.name} is a ${rack.width}" rack`,
    )
  }
}

/**
 * A board has no rack ears. It goes into a mount tray's cut-out or nowhere, so a drop anywhere
 * else is refused rather than quietly screwed to the rails.
 */
function refuseUnmounted(device: Device): void {
  if (DEVICE_TYPES[device.type].needsMount && !device.host) {
    throw new PlacementError(
      'needs-mount',
      `${device.name} bolts into a mount tray — drop it on one of its cut-outs`,
    )
  }
}

const touched = (layout: Layout, patch: Partial<Layout>): Layout => ({
  ...layout,
  ...patch,
  updatedAt: new Date().toISOString(),
})

/**
 * Bolts a board into one of a mount's cut-outs. The board takes no rack units of its own — it
 * rides in the mount's — so it is placed by slot rather than by position.
 */
export function addToMount(layout: Layout, host: Device, slot: number, device: Device): Layout {
  const slots = host.slots ?? 0
  if (!Number.isInteger(slot) || slot < 0 || slot >= slots) {
    throw new PlacementError('no-such-slot', `${host.name} has no slot ${slot + 1}`)
  }
  const taken = layout.devices.find((d) => d.host?.deviceId === host.id && d.host.slot === slot)
  if (taken) {
    throw new PlacementError('slot-taken', `${taken.name} is already in slot ${slot + 1}`)
  }
  const guest: Device = {
    ...device,
    rackId: host.rackId,
    face: host.face,
    posU: host.posU,
    heightU: host.heightU,
    host: { deviceId: host.id, slot },
  }
  return touched(layout, { devices: [...layout.devices, guest] })
}

/** The boards riding in a mount, in slot order. */
export const guestsOf = (layout: Layout, hostId: string): Device[] =>
  layout.devices
    .filter((d) => d.host?.deviceId === hostId)
    .sort((a, b) => (a.host?.slot ?? 0) - (b.host?.slot ?? 0))

/** The first cut-out with nothing in it, or null when the mount is full. */
export function freeSlot(layout: Layout, host: Device): number | null {
  const taken = new Set(guestsOf(layout, host.id).map((d) => d.host!.slot))
  for (let slot = 0; slot < (host.slots ?? 0); slot++) if (!taken.has(slot)) return slot
  return null
}

/** Places a device at the nearest free slot, or throws when the face cannot hold it. */
export function addDevice(layout: Layout, device: Device): Layout {
  const rack = rackOf(layout, device.rackId)
  refuseWrongWidth(device, rack)
  refuseUnmounted(device)
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
  target: { rackId: string; face: Face; posU: number; column?: 0 | 1 },
): Layout {
  const device = deviceOf(layout, deviceId)
  const rack = rackOf(layout, target.rackId)
  refuseWrongWidth(device, rack)
  // moving a board out of its tray would leave it screwed to nothing
  refuseUnmounted({ ...device, host: undefined })
  const posU = findFreeSlot(layout.devices, rack, { ...device, ...target })
  if (posU === null) {
    throw new PlacementError(
      'no-room',
      `${rack.name} has no free ${device.heightU}U slot on the ${target.face}`,
    )
  }
  return touched(layout, {
    devices: layout.devices.map((d) =>
      d.id === deviceId
        ? { ...d, ...target, posU }
        : // the boards ride along: they have no position apart from their mount's
          d.host?.deviceId === deviceId
          ? { ...d, ...target, posU }
          : d,
    ),
  })
}

/** Applies a patch, clamping ports/outlets to what the (possibly new) type allows, then prunes. */
export function updateDevice(layout: Layout, deviceId: string, patch: Partial<Device>): Layout {
  const device = deviceOf(layout, deviceId)
  const next = { ...device, ...patch, id: device.id }
  const spec = DEVICE_TYPES[next.type]
  next.ports = Math.max(0, Math.min(next.ports, spec.maxPorts))
  next.outlets = Math.max(0, Math.min(next.outlets, spec.maxOutlets))

  // A patch that only moves the device to another rack still has to land somewhere free there.
  if (
    patch.heightU !== undefined ||
    patch.posU !== undefined ||
    patch.face !== undefined ||
    patch.rackId !== undefined
  ) {
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

/** Removing a mount takes the boards bolted to it: they have nowhere to be without it. */
export function removeDevice(layout: Layout, deviceId: string): Layout {
  return pruneLinks(
    touched(layout, {
      devices: layout.devices.filter((d) => d.id !== deviceId && d.host?.deviceId !== deviceId),
    }),
  )
}

/** The layout's own name. Nothing points at it — devices and cables key off ids. */
export function renameLayout(layout: Layout, name: string): Layout {
  const trimmed = name.trim()
  return trimmed.length === 0 ? layout : touched(layout, { name: trimmed })
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

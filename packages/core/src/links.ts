import { DEVICE_TYPES } from './deviceTypes.ts'
import { PlacementError, PortBusyError } from './errors.ts'
import { newId } from './ids.ts'
import type { CableType, Device, Layout, Link, LinkEnd, LinkKind } from './types.ts'

/**
 * How many ports of `kind` this device offers.
 *
 * Network is simply the port count. Power has two roles: a PDU or UPS supplies `outlets`, while
 * anything that draws power has exactly one inlet — which is why a NAS with no outlets of its
 * own can still be the far end of a power cable, and a blanking plate never can.
 */
export function portCapacity(device: Device, kind: LinkKind, role: 'supply' | 'draw'): number {
  if (kind === 'network') return device.ports
  return role === 'supply' ? device.outlets : DEVICE_TYPES[device.type].drawsPower ? 1 : 0
}

/** True when this device can hand power to others. */
export const supplies = (device: Device): boolean => device.outlets > 0

export const otherEnd = (link: Link, end: LinkEnd): LinkEnd =>
  link.a.deviceId === end.deviceId && link.a.port === end.port ? link.b : link.a

export function portLink(layout: Layout, kind: LinkKind, end: LinkEnd): Link | undefined {
  return layout.links.find(
    (l) =>
      l.kind === kind &&
      ((l.a.deviceId === end.deviceId && l.a.port === end.port) ||
        (l.b.deviceId === end.deviceId && l.b.port === end.port)),
  )
}

/**
 * Drops links whose device is gone or whose port index no longer exists. Called after every
 * delete, type change and port-count change, so no cable can point at nothing.
 */
export function pruneLinks(layout: Layout): Layout {
  const byId = new Map(layout.devices.map((d) => [d.id, d]))
  const alive = (link: Link, end: LinkEnd): boolean => {
    const device = byId.get(end.deviceId)
    if (!device) return false
    const role = link.kind === 'power' && supplies(device) ? 'supply' : 'draw'
    return end.port < portCapacity(device, link.kind, role)
  }
  const links = layout.links.filter((l) => alive(l, l.a) && alive(l, l.b))
  return links.length === layout.links.length ? layout : { ...layout, links }
}

export interface CableMeta {
  label?: string
  colour?: string
  cableType?: CableType
}

/**
 * Wires two ports together. One cable per port is the rule, so a busy end is refused rather
 * than silently rewired — the caller offers disconnect instead.
 *
 * For power links the end that supplies (a PDU or UPS with outlets) is matched against its
 * outlet count and the other end against its single inlet.
 */
export function connect(
  layout: Layout,
  kind: LinkKind,
  a: LinkEnd,
  b: LinkEnd,
  meta: CableMeta = {},
): Layout {
  if (a.deviceId === b.deviceId && a.port === b.port) {
    throw new PlacementError('no-such-port', 'a port cannot be connected to itself')
  }

  const device = (end: LinkEnd): Device => {
    const found = layout.devices.find((d) => d.id === end.deviceId)
    if (!found) throw new PlacementError('no-such-device', `no device ${end.deviceId}`)
    return found
  }
  const deviceA = device(a)
  const deviceB = device(b)

  // Whichever end has outlets is the supplier; the other draws.
  const supplierIsA = kind === 'power' && supplies(deviceA)
  const roleOf = (isA: boolean): 'supply' | 'draw' =>
    kind === 'network' ? 'draw' : (isA ? supplierIsA : !supplierIsA) ? 'supply' : 'draw'

  for (const [end, dev, isA] of [
    [a, deviceA, true],
    [b, deviceB, false],
  ] as const) {
    const capacity = portCapacity(dev, kind, roleOf(isA))
    if (end.port < 0 || end.port >= capacity) {
      throw new PlacementError(
        'no-such-port',
        `${dev.name} has no ${kind} port ${end.port + 1} (it has ${capacity})`,
      )
    }
    const taken = portLink(layout, kind, end)
    if (taken) {
      throw new PortBusyError(`${dev.name} port ${end.port + 1} already carries a cable`, taken)
    }
  }

  const link: Link = {
    id: newId(),
    kind,
    a,
    b,
    label: meta.label ?? '',
    colour: meta.colour ?? (kind === 'power' ? '#ef4444' : '#3b82f6'),
    cableType: meta.cableType ?? (kind === 'power' ? 'power' : 'cat6'),
  }
  return { ...layout, links: [...layout.links, link], updatedAt: new Date().toISOString() }
}

export function disconnect(layout: Layout, linkId: string): Layout {
  return {
    ...layout,
    links: layout.links.filter((l) => l.id !== linkId),
    updatedAt: new Date().toISOString(),
  }
}

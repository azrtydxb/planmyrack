import { DEVICE_TYPES } from './deviceTypes.js'
import type { Device, Layout, Link, LinkEnd, LinkKind } from './types.js'

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

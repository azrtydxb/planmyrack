import { RACK_INNER_PX, U_PX, deviceRect, slotRects } from './metrics'
import type { Device, Face, Layout, RackWidth } from '@planmyrack/core'

export interface Origin {
  x: number
  y: number
}

/**
 * Where a rack's inner body sits inside the canvas.
 *
 * onLayout reports a view's position within its *parent*, so the body's own layout is relative to
 * its rack frame, and the frame's is relative to the canvas row. Cables need the sum; computing it
 * from padding and rail widths instead drifted whenever the surrounding layout changed — a rack
 * caption wider than its rack was enough to shift the frame and leave every cable ending beside
 * its port rather than in it.
 */
export function bodyOrigins(
  frames: Record<string, Origin>,
  bodies: Record<string, Origin>,
): Record<string, Origin> {
  const origins: Record<string, Origin> = {}
  for (const [rackId, body] of Object.entries(bodies)) {
    const frame = frames[rackId]
    if (!frame) continue
    origins[rackId] = { x: frame.x + body.x, y: frame.y + body.y }
  }
  return origins
}

/**
 * The rack body under a point in canvas space, or null between racks. Cables are drawn from the
 * same measured origins, so a drop lands where the pointer looks like it is.
 */
export function rackUnder<T extends { id: string; width: RackWidth; units: number }>(
  racks: T[],
  origins: Record<string, Origin>,
  point: Origin,
): { rack: T; topY: number } | null {
  for (const rack of racks) {
    const origin = origins[rack.id]
    if (!origin) continue
    const right = origin.x + RACK_INNER_PX[rack.width]
    const bottom = origin.y + rack.units * U_PX
    if (point.x >= origin.x && point.x <= right && point.y >= origin.y && point.y <= bottom) {
      return { rack, topY: origin.y }
    }
  }
  return null
}

/** Where the canvas is: measured stage origin, scroll offset, and the pinch transform on top. */
export interface CanvasView {
  origin: Origin
  scroll: Origin
  scale: number
  translate: Origin
}

/**
 * A point on screen in canvas coordinates. The stage is measured unscaled and unscrolled, so a
 * finger position has the scroll added, the pan subtracted, and the zoom divided out — in that
 * order. Getting this wrong puts every drop half a rack away from the pointer.
 */
export function canvasPoint(screen: Origin, view: CanvasView): Origin {
  return {
    x: (screen.x + view.scroll.x - view.origin.x - view.translate.x) / view.scale,
    y: (screen.y + view.scroll.y - view.origin.y - view.translate.y) / view.scale,
  }
}

/** A tray cut-out under the pointer, and whether anything is already bolted into it. */
export interface SlotHit {
  mount: Device
  slot: number
  taken: boolean
}

/**
 * The cut-out under a point in canvas space. Mount trays are drawn inside a rack, so their slots
 * live at the rack's origin plus the device's own rectangle.
 */
export function slotUnder(
  layout: Layout,
  face: Face,
  origins: Record<string, Origin>,
  point: Origin,
): SlotHit | null {
  for (const rack of layout.racks) {
    const origin = origins[rack.id]
    if (!origin) continue
    const mounts = layout.devices.filter(
      (d) => d.rackId === rack.id && d.face === face && !d.host && (d.slots ?? 0) > 0,
    )
    for (const mount of mounts) {
      const box = deviceRect(rack, mount)
      const local = { x: point.x - origin.x, y: point.y - origin.y - box.top }
      if (local.x < 0 || local.x > box.width || local.y < 0 || local.y > box.height) continue
      const slots = slotRects(mount, box.width, box.height)
      for (const [index, rect] of slots.entries()) {
        if (
          local.x >= rect.x &&
          local.x <= rect.x + rect.width &&
          local.y >= rect.y &&
          local.y <= rect.y + rect.height
        ) {
          const taken = layout.devices.some(
            (d) => d.host?.deviceId === mount.id && d.host.slot === index,
          )
          return { mount, slot: index, taken }
        }
      }
    }
  }
  return null
}

import { RACK_INNER_PX, U_PX } from './metrics'
import type { RackWidth } from '@planmyrack/core'

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
  scrollX: number
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
    x: (screen.x + view.scrollX - view.origin.x - view.translate.x) / view.scale,
    y: (screen.y - view.origin.y - view.translate.y) / view.scale,
  }
}

import type { Device, Rack, RackWidth } from '@planmyrack/core'

/** On-screen height of one rack unit, before canvas zoom. */
export const U_PX = 26

/** Inner width of the rack body per standard, in points. */
export const RACK_INNER_PX: Record<RackWidth, number> = { 19: 470, 10: 280 }

/** Width of the numbered U scale down each side of a rack. */
export const SCALE_PX = 28

const DEVICE_PAD = 4
const PORT_GAP = 2
const PORT_MAX = 14
const PORT_MIN = 4

export interface Rect {
  top: number
  height: number
  width: number
}

/** Rack units run bottom-up, the canvas runs top-down; this is the one place that flips. */
export function deviceRect(rack: Rack, device: Device): Rect {
  return {
    top: (rack.units - device.posU - device.heightU) * U_PX,
    height: device.heightU * U_PX,
    width: RACK_INNER_PX[rack.width],
  }
}

export interface PortRect {
  x: number
  y: number
  size: number
}

/**
 * Where each port square sits inside the device box. Ports shrink and wrap to a second row
 * rather than overflowing, so a 48-port switch in 1U still shows 48 ports inside its own box.
 * The touch target around each square is grown separately in PortGrid — squares this small are
 * to look at, not to hit.
 */
export function portRects(device: Device, boxWidth: number, boxHeight: number): PortRect[] {
  if (device.ports <= 0) return []

  const usableWidth = boxWidth - DEVICE_PAD * 2
  const usableHeight = boxHeight - DEVICE_PAD * 2
  const rows = device.heightU >= 2 && device.ports > 12 ? 2 : 1
  const cols = Math.ceil(device.ports / rows)

  const size = Math.max(
    PORT_MIN,
    Math.min(
      PORT_MAX,
      Math.floor((usableWidth - PORT_GAP * (cols - 1)) / cols),
      Math.floor((usableHeight - PORT_GAP * (rows - 1)) / rows),
    ),
  )

  const rects: PortRect[] = []
  for (let i = 0; i < device.ports; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    rects.push({
      x: DEVICE_PAD + col * (size + PORT_GAP),
      y: DEVICE_PAD + row * (size + PORT_GAP),
      size,
    })
  }
  return rects
}

/** Total canvas height for a rack, so the scroll area can be sized without measuring. */
export const rackHeightPx = (rack: Rack): number => rack.units * U_PX

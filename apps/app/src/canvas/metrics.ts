import type { Device, Rack, RackWidth } from '@planmyrack/core'

/** On-screen height of one rack unit (design: 34px per U). */
export const U_PX = 34

/** Width of the mounting rail down each side of the rack body. */
export const RAIL_PX = 14

/** Cap above the top rail. */
export const CAP_PX = 8

/** Inner width of the rack body per standard — 19" is the design's 292px body less its rails. */
export const RACK_INNER_PX: Record<RackWidth, number> = { 19: 264, 10: 139 }

/** Total width of a rack including both rails. */
export const rackBodyWidth = (rack: Rack): number => RACK_INNER_PX[rack.width] + RAIL_PX * 2

/** Width of the numbered U scale outside the rack. */
export const SCALE_PX = 16

const PORT_W = 8
const PORT_H = 12
const PORT_GAP = 2
const FACE_PAD = 6

/**
 * Space kept clear at the left of a faceplate for its name and meta line. Real gear names are
 * longer than the design's short codes (PP-01), so the gutter takes a bigger share of a wide
 * faceplate — ports still get the rest.
 */
export const labelGutter = (boxWidth: number): number => Math.min(118, Math.round(boxWidth * 0.42))

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
  width: number
  height: number
}

/**
 * Port strip along the right of the faceplate: fixed 8x12 slots as the design draws them,
 * shrinking and wrapping only when a dense device would otherwise overflow its own box.
 */
export function portRects(device: Device, boxWidth: number, boxHeight: number): PortRect[] {
  if (device.ports <= 0) return []

  const gutter = labelGutter(boxWidth)
  const usableWidth = boxWidth - gutter - FACE_PAD
  const usableHeight = boxHeight - FACE_PAD

  // The design's slot is 8x12. When a device is too dense for that at this rack width, prefer
  // wrapping to a second row over shrinking the slots into an unreadable smudge — a 48-port
  // switch on one 19" 1U row would leave 2px per port.
  const attempts: { rows: number; gap: number; minWidth: number }[] = [
    { rows: 1, gap: PORT_GAP, minWidth: 4 },
    { rows: 2, gap: PORT_GAP, minWidth: 4 },
    { rows: 1, gap: 1, minWidth: 3 },
    { rows: 2, gap: 1, minWidth: 2 },
  ]

  let chosen = { rows: 2, gap: 1, width: 2, height: 4 }
  for (const attempt of attempts) {
    const cols = Math.ceil(device.ports / attempt.rows)
    const width = Math.min(PORT_W, Math.floor((usableWidth - attempt.gap * (cols - 1)) / cols))
    const height = Math.min(
      PORT_H,
      Math.floor((usableHeight - attempt.gap * (attempt.rows - 1)) / attempt.rows),
    )
    if (width >= attempt.minWidth && height >= 3) {
      chosen = { rows: attempt.rows, gap: attempt.gap, width, height }
      break
    }
  }

  const cols = Math.ceil(device.ports / chosen.rows)
  const stripWidth = cols * chosen.width + chosen.gap * (cols - 1)
  const stripHeight = chosen.rows * chosen.height + chosen.gap * (chosen.rows - 1)
  const left = Math.max(gutter, boxWidth - FACE_PAD - stripWidth)
  const top = Math.max(2, (boxHeight - stripHeight) / 2)

  const rects: PortRect[] = []
  for (let i = 0; i < device.ports; i++) {
    rects.push({
      x: left + (i % cols) * (chosen.width + chosen.gap),
      y: top + Math.floor(i / cols) * (chosen.height + chosen.gap),
      width: chosen.width,
      height: chosen.height,
    })
  }
  return rects
}

export const rackHeightPx = (rack: Rack): number => rack.units * U_PX

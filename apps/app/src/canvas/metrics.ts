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

/** Width taken by one SFP/SFP+ cage, including its gap. */
export const CAGE_PITCH = 13

const PORT_W = 8
const PORT_H = 12

/**
 * The narrowest slot worth drawing. Below this the strip is a smudge and a fingertip cannot pick
 * one port out of its neighbours, so the strip wraps to another row instead.
 */
export const MIN_PORT_W = 6
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
  // Uplink cages are drawn at the right edge; the copper strip stops before them rather than
  // running underneath.
  const cages = device.sfp ? device.sfp * CAGE_PITCH + FACE_PAD : 0
  const usableWidth = boxWidth - gutter - FACE_PAD - cages
  const usableHeight = boxHeight - FACE_PAD

  /**
   * The design's slot is 8x12. When a device is too dense for that at this rack width, wrap to
   * another row rather than shrink: found on an iPad, where a 24-port switch drew 4pt-wide slots
   * — narrower than the gap between two fingers, so tapping port 12 selected port 15.
   *
   * Every attempt that keeps a slot at least MIN_PORT_W wide is tried before any that does not.
   */
  const attempts: { rows: number; gap: number; minWidth: number }[] = [
    { rows: 1, gap: PORT_GAP, minWidth: PORT_W },
    { rows: 2, gap: PORT_GAP, minWidth: MIN_PORT_W },
    { rows: 2, gap: 1, minWidth: MIN_PORT_W },
    { rows: 3, gap: 1, minWidth: MIN_PORT_W },
    { rows: 4, gap: 1, minWidth: MIN_PORT_W },
    // 48 ports on a 10" rack cannot be drawn at a tappable size at any row count, and no such
    // device exists; it degrades rather than overflowing its box.
    { rows: 3, gap: 1, minWidth: 4 },
    { rows: 4, gap: 1, minWidth: 3 },
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
  const left = Math.max(gutter, boxWidth - FACE_PAD - cages - stripWidth)
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

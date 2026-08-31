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
  left: number
}

/**
 * Rack units run bottom-up, the canvas runs top-down; this is the one place that flips.
 *
 * A 10" device in a 19" rack takes half the width and sits in the half its column names — two of
 * them fit across one unit on extended mounts.
 */
export function deviceRect(rack: Rack, device: Device): Rect {
  const full = RACK_INNER_PX[rack.width]
  const half =
    device.column !== undefined && device.width !== undefined && device.width < rack.width
  const width = half ? Math.floor(full / 2) : full
  return {
    top: (rack.units - device.posU - device.heightU) * U_PX,
    height: device.heightU * U_PX,
    width,
    left: half && device.column === 1 ? full - width : 0,
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
export function copperPorts(device: Device): number {
  return Math.max(0, device.ports - (device.sfp ?? 0))
}

/**
 * The SFP/SFP+ cages, drawn at the right edge. They are the LAST ports of the device, not
 * decoration beside them: an aggregation switch is eight cages and nothing else, and every one of
 * them takes a cable.
 */
export function cageRects(device: Device, boxWidth: number, boxHeight: number): PortRect[] {
  const count = Math.min(device.sfp ?? 0, device.ports)
  if (count <= 0) return []
  const width = CAGE_PITCH - 2
  const height = 9
  const top = Math.max(2, (boxHeight - height) / 2)
  const first = boxWidth - FACE_PAD - count * CAGE_PITCH + 2
  return Array.from({ length: count }, (_, i) => ({
    x: first + i * CAGE_PITCH,
    y: top,
    width,
    height,
  }))
}

export function portRects(device: Device, boxWidth: number, boxHeight: number): PortRect[] {
  const copper = copperPorts(device)
  if (copper <= 0) return []

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
  const ports = copper
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
    const cols = Math.ceil(ports / attempt.rows)
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

  const cols = Math.ceil(ports / chosen.rows)
  const stripWidth = cols * chosen.width + chosen.gap * (cols - 1)
  const stripHeight = chosen.rows * chosen.height + chosen.gap * (chosen.rows - 1)
  const left = Math.max(gutter, boxWidth - FACE_PAD - cages - stripWidth)
  const top = Math.max(2, (boxHeight - stripHeight) / 2)

  const rects: PortRect[] = []
  for (let i = 0; i < ports; i++) {
    rects.push({
      x: left + (i % cols) * (chosen.width + chosen.gap),
      y: top + Math.floor(i / cols) * (chosen.height + chosen.gap),
      width: chosen.width,
      height: chosen.height,
    })
  }
  return rects
}

/**
 * The cut-outs across a mount tray, left to right. A board bolted into one is drawn inside its
 * rectangle, with its own name and its own ports.
 */
export function slotRects(device: Device, boxWidth: number, boxHeight: number): PortRect[] {
  const count = device.slots ?? 0
  if (count <= 0) return []
  const gap = 4
  // the tray carries its own name at the left like any other faceplate; the cut-outs start after
  const left = labelGutter(boxWidth)
  const width = Math.floor((boxWidth - left - FACE_PAD - gap * (count - 1)) / count)
  const height = Math.max(0, boxHeight - FACE_PAD * 2)
  return Array.from({ length: count }, (_, i) => ({
    x: left + i * (width + gap),
    y: FACE_PAD,
    width,
    height,
  }))
}

export const rackHeightPx = (rack: Rack): number => rack.units * U_PX

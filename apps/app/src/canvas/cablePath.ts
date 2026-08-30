export interface Point {
  x: number
  y: number
}

/**
 * A cubic bezier that leaves each port horizontally, so cables read as cables rather than as
 * straight lines cutting through the rack. The bow is clamped so short hops do not loop.
 */
export function cablePath(a: Point, b: Point): string {
  const bow = Math.min(160, Math.max(40, Math.abs(b.x - a.x) / 2 + Math.abs(b.y - a.y) / 3))
  return `M${a.x},${a.y} C${a.x + bow},${a.y} ${b.x - bow},${b.y} ${b.x},${b.y}`
}

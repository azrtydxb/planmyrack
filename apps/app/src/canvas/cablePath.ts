export interface Point {
  x: number
  y: number
}

/**
 * A cable between two ports.
 *
 * Ports on devices stacked in the same rack are almost vertically aligned. Pulling the control
 * points sideways there produces a tight S; the design instead runs the cable out of the port and
 * bows it round in one smooth arc, so both control points go the SAME way. Across racks the bow
 * follows the horizontal run as usual.
 */
export function cablePath(a: Point, b: Point): string {
  const dx = b.x - a.x
  const dy = b.y - a.y

  if (Math.abs(dx) < 60) {
    // stacked: one arc bulging left of both ports
    const bow = Math.min(90, 26 + Math.abs(dy) * 0.45)
    return `M${a.x},${a.y} C${a.x - bow},${a.y} ${b.x - bow},${b.y} ${b.x},${b.y}`
  }

  const bow = Math.min(160, Math.max(40, Math.abs(dx) / 2 + Math.abs(dy) / 3))
  return `M${a.x},${a.y} C${a.x + bow},${a.y} ${b.x - bow},${b.y} ${b.x},${b.y}`
}

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

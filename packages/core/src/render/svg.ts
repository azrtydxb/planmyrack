import { DEVICE_TYPES } from '../deviceTypes.ts'
import type { Face, Layout, Rack } from '../types.ts'

const U_PX = 26
const RACK_INNER: Record<number, number> = { 19: 470, 10: 280 }
const SCALE_W = 28
const GAP = 24
const HEAD = 28

const escape = (text: string): string =>
  text.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!)

const rackWidth = (rack: Rack): number => RACK_INNER[rack.width]! + SCALE_W * 2

/**
 * The rack elevation as a self-contained SVG string — no external references, no fonts to fetch,
 * nothing platform-specific. PNG export rasterises this on web, and print wraps it in HTML, so
 * both come from one renderer rather than from a screenshot of a live view.
 */
export function layoutSvg(layout: Layout, face: Face): string {
  const height = HEAD + Math.max(0, ...layout.racks.map((r) => r.units * U_PX)) + 20
  const width = layout.racks.reduce((sum, rack) => sum + rackWidth(rack) + GAP, GAP)

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="#0b1020"/>`,
  ]

  let x = GAP
  for (const rack of layout.racks) {
    const inner = RACK_INNER[rack.width]!
    const bodyX = x + SCALE_W
    const rackHeight = rack.units * U_PX

    parts.push(
      `<text x="${x}" y="${HEAD - 10}" fill="#e6ecff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">${escape(rack.name)} · ${rack.width}" · ${rack.units}U · ${face}</text>`,
      `<rect x="${bodyX}" y="${HEAD}" width="${inner}" height="${rackHeight}" fill="#0d1424" stroke="#243049" stroke-width="2"/>`,
    )

    for (let u = 0; u < rack.units; u++) {
      const y = HEAD + u * U_PX
      const label = rack.units - u
      parts.push(
        `<line x1="${bodyX}" y1="${y}" x2="${bodyX + inner}" y2="${y}" stroke="#93a0c0" stroke-opacity="0.12"/>`,
        `<text x="${bodyX - 6}" y="${y + 17}" fill="#93a0c0" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">${label}</text>`,
        `<text x="${bodyX + inner + 6}" y="${y + 17}" fill="#93a0c0" font-family="system-ui, sans-serif" font-size="10">${label}</text>`,
      )
    }

    for (const device of layout.devices.filter((d) => d.rackId === rack.id && d.face === face)) {
      const top = HEAD + (rack.units - device.posU - device.heightU) * U_PX
      const deviceHeight = device.heightU * U_PX
      parts.push(
        `<rect x="${bodyX}" y="${top}" width="${inner}" height="${deviceHeight}" fill="${escape(device.colour)}" stroke="#0b1020"/>`,
        `<text x="${bodyX + 8}" y="${top + deviceHeight / 2 + 4}" fill="#0b1020" font-family="system-ui, sans-serif" font-size="11" font-weight="700">${escape(device.name)}</text>`,
      )
      if (device.ports > 0) {
        parts.push(
          `<text x="${bodyX + inner - 8}" y="${top + deviceHeight / 2 + 4}" fill="#0b1020" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">${device.ports}p</text>`,
        )
      }
    }

    x += rackWidth(rack) + GAP
  }

  parts.push('</svg>')
  return parts.join('')
}

/** One printable page per rack, using the same elevation the screen and PNG use. */
export function layoutPrintHtml(layout: Layout, faces: Face[] = ['front']): string {
  const pages = faces
    .map(
      (face) =>
        `<section><h2>${escape(layout.name)} — ${face}</h2>${layoutSvg(layout, face)}</section>`,
    )
    .join('')

  const summary = layout.racks
    .map((rack) => {
      const devices = layout.devices.filter((d) => d.rackId === rack.id)
      const watts = devices.reduce((sum, d) => sum + d.watts, 0)
      return `<li>${escape(rack.name)}: ${devices.length} devices, ${watts} W, ${rack.units}U</li>`
    })
    .join('')

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escape(layout.name)}</title><style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #111; }
    section { page-break-after: always; }
    h2 { font-size: 16px; }
    svg { max-width: 100%; height: auto; }
    ul { font-size: 12px; }
  </style></head><body>${pages}<h3>Racks</h3><ul>${summary}</ul>
  <p style="font-size:11px;color:#555">Device types: ${Object.values(DEVICE_TYPES).length} known</p>
  </body></html>`
}

import { describe, it, expect } from 'vitest'
import {
  addDevice,
  connect,
  layoutPrintHtml,
  layoutSvg,
  newDevice,
  newLayout,
  newRack,
} from '../src/index.ts'
import type { Layout } from '../src/index.ts'

const rack = newRack({ id: 'R', units: 12, name: 'Basement' })
const seeded: Layout = (() => {
  let l = newLayout('Basement', [rack])
  l = addDevice(
    l,
    newDevice({
      id: 'sw',
      rackId: 'R',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'switch',
      name: 'Switch',
    }),
  )
  l = addDevice(
    l,
    newDevice({
      id: 'nas',
      rackId: 'R',
      face: 'front',
      posU: 2,
      heightU: 2,
      type: 'server',
      name: 'NAS',
    }),
  )
  l = addDevice(
    l,
    newDevice({
      id: 'pdu',
      rackId: 'R',
      face: 'rear',
      posU: 0,
      heightU: 1,
      type: 'pdu',
      name: 'PDU',
    }),
  )
  return connect(l, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'nas', port: 1 })
})()

describe('TestLayoutSvgIsSelfContained', () => {
  it('draws one rect per visible device plus the rack body and background', () => {
    const svg = layoutSvg(seeded, 'front')
    // 2 front devices + 1 rack body + 1 background
    expect(svg.match(/<rect/g)).toHaveLength(4)
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
  })

  it('references nothing external, so rasterising it cannot hit the network', () => {
    const svg = layoutSvg(seeded, 'front')
    expect(svg).not.toContain('<image')
    expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/)
  })

  it('draws only the face asked for', () => {
    expect(layoutSvg(seeded, 'front')).toContain('NAS')
    expect(layoutSvg(seeded, 'front')).not.toContain('>PDU<')
    expect(layoutSvg(seeded, 'rear')).toContain('PDU')
  })

  it('escapes a device name that would otherwise break the document', () => {
    const nasty = addDevice(
      newLayout('x', [rack]),
      newDevice({
        rackId: 'R',
        face: 'front',
        posU: 0,
        heightU: 1,
        type: 'server',
        name: '<script>&"',
      }),
    )
    const svg = layoutSvg(nasty, 'front')
    expect(svg).toContain('&lt;script&gt;&amp;&quot;')
    expect(svg).not.toContain('<script>')
  })

  it('makes one printable page per face from the same elevation', () => {
    const html = layoutPrintHtml(seeded, ['front', 'rear'])
    expect(html.match(/<section>/g)).toHaveLength(2)
    expect(html).toContain('page-break-after')
  })
})

import { newDevice, newRack } from '@planmyrack/core'
import {
  CAGE_PITCH,
  MIN_PORT_W,
  RACK_INNER_PX,
  U_PX,
  deviceRect,
  labelGutter,
  portRects,
} from '../src/canvas/metrics'

const rack = newRack({ id: 'R', units: 12 })
const device = (over: Partial<Parameters<typeof newDevice>[0]> = {}) =>
  newDevice({ rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'switch', ...over })

describe('TestDeviceRectFlipsUnitsToPixels', () => {
  it('puts unit 0 at the bottom of the rack and a 2U device two units tall', () => {
    const rect = deviceRect(rack, device({ posU: 0, heightU: 2 }))
    expect(rect.top).toBe((12 - 0 - 2) * U_PX)
    expect(rect.height).toBe(2 * U_PX)
  })

  it('gives a 10-inch rack a narrower body than a 19-inch one', () => {
    const narrow = newRack({ id: 'N', units: 12, width: 10 })
    expect(deviceRect(narrow, device()).width).toBe(RACK_INNER_PX[10])
    expect(deviceRect(rack, device()).width).toBeGreaterThan(RACK_INNER_PX[10])
  })
})

describe('TestDensePortsStayInsideDevice', () => {
  it.each([
    [48, 1],
    [48, 2],
    [24, 1],
    [8, 0.5],
  ])('keeps all %i ports of a %sU device inside its box', (ports, heightU) => {
    const dev = device({ ports, heightU, type: 'switch' })
    const box = deviceRect(rack, dev)
    const rects = portRects(dev, box.width, box.height)

    expect(rects).toHaveLength(ports)
    for (const rect of rects) {
      expect(rect.x + rect.width).toBeLessThanOrEqual(box.width)
      expect(rect.y + rect.height).toBeLessThanOrEqual(box.height)
      expect(rect.width).toBeGreaterThan(0)
      expect(rect.height).toBeGreaterThan(0)
    }
  })

  it('wraps a 24-port 1U switch rather than drawing slots too narrow to tap', () => {
    // found on an iPad: one row of 24 left each slot 4pt wide, and tapping port 12 selected 15
    const dev = device({ ports: 24, heightU: 1 })
    const box = deviceRect(rack, dev)
    const rects = portRects(dev, box.width, box.height)
    expect(new Set(rects.map((r) => r.y)).size).toBeGreaterThan(1)
    expect(Math.min(...rects.map((r) => r.width))).toBeGreaterThanOrEqual(MIN_PORT_W)
  })

  it('wraps a 48-port switch far enough to keep its slots tappable', () => {
    const dev = device({ ports: 48, heightU: 1 })
    const box = deviceRect(rack, dev)
    const rects = portRects(dev, box.width, box.height)
    expect(new Set(rects.map((r) => r.y)).size).toBeGreaterThan(1)
    expect(Math.min(...rects.map((r) => r.width))).toBeGreaterThanOrEqual(MIN_PORT_W)
  })

  it('keeps every port count a real device has wide enough to pick out with a finger', () => {
    // the one exception is 48 ports on a 10" rack, which no product is: it cannot be drawn at a
    // tappable size at any row count, and degrades rather than overflowing
    for (const ports of [2, 4, 8, 16, 24, 26, 28, 48]) {
      for (const width of [19, 10] as const) {
        if (ports === 48 && width === 10) continue
        const dev = device({ ports, heightU: 1 })
        const box = deviceRect(newRack({ id: 'R', units: 12, width }), dev)
        const narrowest = Math.min(...portRects(dev, box.width, box.height).map((r) => r.width))
        expect([ports, width, narrowest >= MIN_PORT_W]).toEqual([ports, width, true])
      }
    }
  })

  it('draws the 8x12 slots the design specifies when the device is sparse enough', () => {
    const dev = device({ ports: 8, heightU: 1 })
    const box = deviceRect(rack, dev)
    const first = portRects(dev, box.width, box.height)[0]!
    expect([first.width, first.height]).toEqual([8, 12])
  })

  it('keeps a dense strip legible rather than matching the slot size exactly', () => {
    // the design's 8px slots sit beside six-character codes (PP-01); a real catalogue name needs
    // a wider label, so a 24-port strip trades slot width for a readable device name
    const dev = device({ ports: 24, heightU: 1 })
    const box = deviceRect(rack, dev)
    const first = portRects(dev, box.width, box.height)[0]!
    expect(first.width).toBeGreaterThanOrEqual(4)
    expect(first.height).toBe(12)
  })

  it('draws nothing for a device with no ports', () => {
    expect(portRects(device({ ports: 0, type: 'blank' }), 470, 26)).toEqual([])
  })
})

describe('TestPortsNeverSitUnderTheDeviceName', () => {
  it('starts the first port after the label gutter', () => {
    // Found by looking at the built app: on a 1U switch the name was drawn over the ports.
    const dev = device({ ports: 24, heightU: 1 })
    const box = deviceRect(rack, dev)
    const rects = portRects(dev, box.width, box.height)
    expect(rects[0]!.x).toBeGreaterThanOrEqual(labelGutter(box.width))
  })

  it('still fits every port inside the box once the gutter is taken out', () => {
    const dev = device({ ports: 48, heightU: 1 })
    const box = deviceRect(rack, dev)
    for (const rect of portRects(dev, box.width, box.height)) {
      expect(rect.x + rect.width).toBeLessThanOrEqual(box.width)
    }
  })
})

describe('TestUplinkCagesDoNotSitOnThePorts', () => {
  it('stops the copper strip before the cages', () => {
    // seen in the app: the SFP cages were drawn over the last few RJ45 ports
    const dev = device({ ports: 24, heightU: 1, sfp: 2 })
    const box = deviceRect(rack, dev)
    const rects = portRects(dev, box.width, box.height)
    const stripEnd = Math.max(...rects.map((r) => r.x + r.width))
    expect(stripEnd).toBeLessThanOrEqual(box.width - 2 * CAGE_PITCH)
  })

  it('uses the full width when a device has no cages', () => {
    const dev = device({ ports: 24, heightU: 1 })
    const box = deviceRect(rack, dev)
    const rects = portRects(dev, box.width, box.height)
    expect(Math.max(...rects.map((r) => r.x + r.width))).toBeGreaterThan(box.width - 2 * CAGE_PITCH)
  })
})

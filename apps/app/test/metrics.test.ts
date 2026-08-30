import { newDevice, newRack } from '@planmyrack/core'
import { RACK_INNER_PX, U_PX, deviceRect, portRects } from '../src/canvas/metrics'

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
      expect(rect.x + rect.size).toBeLessThanOrEqual(box.width)
      expect(rect.y + rect.size).toBeLessThanOrEqual(box.height)
      expect(rect.size).toBeGreaterThan(0)
    }
  })

  it('wraps to two rows only when the device is tall enough to show them', () => {
    const oneU = device({ ports: 48, heightU: 1 })
    const twoU = device({ ports: 48, heightU: 2 })
    const rowsOf = (d: typeof oneU) =>
      new Set(portRects(d, deviceRect(rack, d).width, deviceRect(rack, d).height).map((r) => r.y))
        .size
    expect(rowsOf(oneU)).toBe(1)
    expect(rowsOf(twoU)).toBe(2)
  })

  it('draws nothing for a device with no ports', () => {
    expect(portRects(device({ ports: 0, type: 'blank' }), 470, 26)).toEqual([])
  })
})

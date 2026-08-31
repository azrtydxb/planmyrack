import { describe, it, expect } from 'vitest'
import {
  PlacementError,
  addDevice,
  addRack,
  columnsOverlap,
  fitsRack,
  moveDevice,
  newDevice,
  newLayout,
  newRack,
} from '../src/index.ts'
import type { Device, Layout } from '../src/index.ts'

const wide = newRack({ id: 'W', name: 'Rack A', units: 12, width: 19 })
const narrow = newRack({ id: 'N', name: 'Rack B', units: 12, width: 10 })
const both: Layout = addRack(newLayout('widths', [wide]), narrow)

const gear = (over: Partial<Device> & { id: string }): Device =>
  newDevice({ rackId: 'W', face: 'front', posU: 0, heightU: 1, type: 'switch', ...over })

describe('TestNineteenInchGearDoesNotGoInATenInchRack', () => {
  it('refuses the placement and says which way round it is', () => {
    const big = gear({ id: 'big', rackId: 'N', width: 19, name: 'Switch 24' })
    expect(() => addDevice(both, big)).toThrow(PlacementError)
    expect(() => addDevice(both, big)).toThrow(/19" gear and Rack B is a 10" rack/)
  })

  it('refuses a move into one just as firmly', () => {
    const placed = addDevice(both, gear({ id: 'big', width: 19 }))
    expect(() => moveDevice(placed, 'big', { rackId: 'N', face: 'front', posU: 0 })).toThrow(
      /10" rack/,
    )
  })

  it('lets ten-inch gear into a nineteen-inch rack, which is what extended mounts are for', () => {
    const small = gear({ id: 'small', width: 10, rackId: 'W' })
    expect(addDevice(both, small).devices).toHaveLength(1)
    expect(fitsRack(10, wide)).toBe(true)
    expect(fitsRack(19, narrow)).toBe(false)
    // gear with no declared standard fits anywhere: a generic shape is not a product
    expect(fitsRack(undefined, narrow)).toBe(true)
  })
})

describe('TestTwoTenInchDevicesShareAUnit', () => {
  it('lets them sit side by side, and refuses a third in the same halves', () => {
    let layout = addDevice(both, gear({ id: 'left', width: 10, column: 0, posU: 4 }))
    layout = addDevice(layout, gear({ id: 'right', width: 10, column: 1, posU: 4 }))

    const left = layout.devices.find((d) => d.id === 'left')!
    const right = layout.devices.find((d) => d.id === 'right')!
    expect([left.posU, right.posU]).toEqual([4, 4])

    // a third narrow device cannot have the left half back; it lands elsewhere
    const third = addDevice(layout, gear({ id: 'third', width: 10, column: 0, posU: 4 }))
    expect(third.devices.find((d) => d.id === 'third')!.posU).not.toBe(4)
  })

  it('keeps full-width gear out of a unit either half is using', () => {
    const layout = addDevice(both, gear({ id: 'left', width: 10, column: 0, posU: 4 }))
    const full = addDevice(layout, gear({ id: 'full', posU: 4 }))
    expect(full.devices.find((d) => d.id === 'full')!.posU).not.toBe(4)
  })

  it('knows which halves are in the way of each other', () => {
    expect(columnsOverlap(0, 1)).toBe(false)
    expect(columnsOverlap(1, 0)).toBe(false)
    expect(columnsOverlap(0, 0)).toBe(true)
    // a device that spans the rack is in the way of both halves
    expect(columnsOverlap(undefined, 0)).toBe(true)
    expect(columnsOverlap(1, undefined)).toBe(true)
  })
})

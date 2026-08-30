import { describe, it, expect } from 'vitest'
import {
  PlacementError,
  addDevice,
  addRack,
  moveDevice,
  newDevice,
  newLayout,
  newRack,
  removeRack,
  updateRack,
} from '../src/index.js'
import type { Layout, Link } from '../src/index.js'

const rackA = newRack({ id: 'A', units: 12, name: 'A' })
const rackB = newRack({ id: 'B', units: 12, name: 'B', width: 10 })
const base: Layout = addRack(newLayout('two racks', [rackA]), rackB)

const place = (l: Layout, p: Parameters<typeof newDevice>[0]) => addDevice(l, newDevice(p))

// Task 5 owns connect(); a literal link is enough to prove moves and cascades keep cables.
const cable = (a: string, ap: number, b: string, bp: number): Link => ({
  id: `${a}:${ap}-${b}:${bp}`,
  kind: 'network',
  a: { deviceId: a, port: ap },
  b: { deviceId: b, port: bp },
  label: '',
  colour: '#3b82f6',
  cableType: 'cat6',
})

describe('TestDropFindsNearestFreeSlotElseRefuses', () => {
  it('refuses the drop without changing the layout when nothing fits', () => {
    const small = newRack({ id: 'S', units: 4 })
    const full = place(newLayout('full', [small]), {
      rackId: 'S',
      face: 'front',
      posU: 0,
      heightU: 4,
      type: 'blank',
    })
    expect(() =>
      addDevice(
        full,
        newDevice({ rackId: 'S', face: 'front', posU: 0, heightU: 1, type: 'server' }),
      ),
    ).toThrow(PlacementError)
    expect(full.devices).toHaveLength(1)
  })

  it('places into the nearest free slot instead of overlapping', () => {
    const one = place(base, { rackId: 'A', face: 'front', posU: 2, heightU: 2, type: 'server' })
    const two = place(one, { rackId: 'A', face: 'front', posU: 2, heightU: 1, type: 'switch' })
    const placed = two.devices[1]!
    expect(placed.posU).not.toBe(2)
    expect(
      two.devices.every((d, i) =>
        two.devices.every(
          (o, j) => i === j || d.posU + d.heightU <= o.posU || o.posU + o.heightU <= d.posU,
        ),
      ),
    ).toBe(true)
  })
})

describe('TestMoveDeviceAcrossRackAndFaceKeepsLinks', () => {
  const wired = (() => {
    const withSwitch = place(base, {
      id: 'sw',
      rackId: 'A',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'switch',
    })
    const withNas = place(withSwitch, {
      id: 'nas',
      rackId: 'A',
      face: 'front',
      posU: 4,
      heightU: 2,
      type: 'server',
    })
    return { ...withNas, links: [cable('sw', 0, 'nas', 1)] }
  })()

  it('moves a device to another rack and face while its cables survive', () => {
    const moved = moveDevice(wired, 'sw', { rackId: 'B', face: 'rear', posU: 0 })
    const dev = moved.devices.find((d) => d.id === 'sw')!
    expect([dev.rackId, dev.face, dev.posU]).toEqual(['B', 'rear', 0])
    expect(moved.links).toHaveLength(1)
  })

  it('leaves the layout untouched when the target has no room', () => {
    const tiny = newRack({ id: 'T', units: 1 })
    const packed = place(addRack(wired, tiny), {
      rackId: 'T',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'blank',
    })
    expect(() => moveDevice(packed, 'nas', { rackId: 'T', face: 'front', posU: 0 })).toThrow(
      PlacementError,
    )
    expect(packed.devices.find((d) => d.id === 'nas')!.rackId).toBe('A')
  })
})

describe('TestRemoveRackCascades', () => {
  it('takes the rack, its devices and their cables with it', () => {
    const withSwitch = place(base, {
      id: 'sw',
      rackId: 'A',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'switch',
    })
    const withNas = place(withSwitch, {
      id: 'nas',
      rackId: 'A',
      face: 'front',
      posU: 4,
      heightU: 2,
      type: 'server',
    })
    const wired = { ...withNas, links: [cable('sw', 0, 'nas', 1)] }
    const after = removeRack(wired, 'A')
    expect(after.racks.map((r) => r.id)).toEqual(['B'])
    expect(after.devices).toHaveLength(0)
    expect(after.links).toHaveLength(0)
  })
})

describe('TestRackShrinkNeverStrands', () => {
  it('refuses to shrink a rack below a device already placed high in it', () => {
    const high = place(base, { rackId: 'A', face: 'front', posU: 10, heightU: 2, type: 'server' })
    expect(() => updateRack(high, 'A', { units: 4 })).toThrow(PlacementError)
    expect(high.racks.find((r) => r.id === 'A')!.units).toBe(12)
  })

  it('allows a shrink that strands nothing', () => {
    const low = place(base, { rackId: 'A', face: 'front', posU: 0, heightU: 2, type: 'server' })
    expect(updateRack(low, 'A', { units: 6 }).racks.find((r) => r.id === 'A')!.units).toBe(6)
  })
})

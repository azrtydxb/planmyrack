import { describe, it, expect } from 'vitest'
import {
  PlacementError,
  addDevice,
  addRack,
  connect,
  moveDevice,
  newDevice,
  newLayout,
  newRack,
  rackStats,
  removeRack,
  updateDevice,
  updateRack,
} from '../src/index.ts'
import type { Layout, Link } from '../src/index.ts'

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

describe('TestUpdateDeviceChecksTheRackItMovesTo', () => {
  it('lands in a free slot of the new rack rather than on top of what is there', () => {
    const a = newRack({ id: 'A', units: 6 })
    const b = newRack({ id: 'B', units: 6 })
    let layout = addRack(newLayout('two', [a]), b)
    layout = addDevice(
      layout,
      newDevice({ id: 'sitting', rackId: 'B', face: 'front', posU: 0, heightU: 2, type: 'server' }),
    )
    layout = addDevice(
      layout,
      newDevice({ id: 'moving', rackId: 'A', face: 'front', posU: 0, heightU: 2, type: 'server' }),
    )

    const moved = updateDevice(layout, 'moving', { rackId: 'B' })
    const placed = moved.devices.find((d) => d.id === 'moving')!
    expect(placed.rackId).toBe('B')
    expect(placed.posU).toBeGreaterThanOrEqual(2)
  })

  it('refuses the move when the new rack is full', () => {
    const a = newRack({ id: 'A', units: 4 })
    const b = newRack({ id: 'B', units: 2 })
    let layout = addRack(newLayout('two', [a]), b)
    layout = addDevice(
      layout,
      newDevice({ id: 'full', rackId: 'B', face: 'front', posU: 0, heightU: 2, type: 'blank' }),
    )
    layout = addDevice(
      layout,
      newDevice({ id: 'moving', rackId: 'A', face: 'front', posU: 0, heightU: 2, type: 'server' }),
    )

    expect(() => updateDevice(layout, 'moving', { rackId: 'B' })).toThrow(/no free/)
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

describe('TestRenamingARackKeepsEverythingAttached', () => {
  it('moves nothing and drops no cable, however the racks are named', () => {
    // devices point at rack ids and cables point at device ids: a name is a label, never a key
    const a = newRack({ id: 'A', name: 'Rack A', units: 12 })
    const b = newRack({ id: 'B', name: 'Rack B', units: 12 })
    let layout = addRack(newLayout('two', [a]), b)
    layout = addDevice(
      layout,
      newDevice({ id: 'sw', rackId: 'A', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
    )
    layout = addDevice(
      layout,
      newDevice({ id: 'nas', rackId: 'B', face: 'front', posU: 0, heightU: 2, type: 'server' }),
    )
    layout = connect(
      layout,
      'network',
      { deviceId: 'sw', port: 0 },
      { deviceId: 'nas', port: 0 },
      { label: 'cross-rack', colour: '#fff', cableType: 'cat6' },
    )

    // both racks renamed, one to the other's old name
    const renamed = updateRack(updateRack(layout, 'A', { name: 'Loft' }), 'B', { name: 'Rack A' })

    expect(renamed.devices.map((d) => [d.id, d.rackId])).toEqual([
      ['sw', 'A'],
      ['nas', 'B'],
    ])
    expect(renamed.links).toHaveLength(1)
    expect(renamed.links[0]!.label).toBe('cross-rack')
    expect(rackStats(renamed, 'A').deviceCount).toBe(1)
    expect(rackStats(renamed, 'B').deviceCount).toBe(1)
  })
})

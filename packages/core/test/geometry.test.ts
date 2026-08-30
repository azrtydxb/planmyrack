import { describe, it, expect } from 'vitest'
import {
  collides,
  findFreeSlot,
  newDevice,
  newLayout,
  newRack,
  rackStats,
  snapHalfU,
} from '../src/index.ts'
import type { Device, Face } from '../src/index.ts'

const rack = newRack({ id: 'r1', units: 4 })
const mk = (p: Partial<Device> & { posU: number; heightU: number }): Device =>
  newDevice({ rackId: 'r1', face: 'front', type: 'equipment', ...p })
const probe = (posU: number, heightU: number, face: Face = 'front') => ({
  rackId: 'r1',
  face,
  posU,
  heightU,
})

describe('TestDropSnapsToHalfU', () => {
  it('snaps a pointer position to the nearest half unit', () => {
    expect([snapHalfU(3.26), snapHalfU(3.74), snapHalfU(-0.1)]).toEqual([3.5, 3.5, -0])
  })
})

describe('TestDropFindsNearestFreeSlotElseRefuses', () => {
  it('returns the requested slot when it is empty', () => {
    expect(findFreeSlot([], rack, probe(1, 2))).toBe(1)
  })

  it('slides to the closest free slot when the target is taken', () => {
    // the sitting device occupies [1, 3), so 0.5 would still overlap it — 0 is the nearest free slot
    const sitting = mk({ posU: 1, heightU: 2 })
    expect(findFreeSlot([sitting], rack, probe(1, 1))).toBe(0)
  })

  it('returns null when the face has no room at all', () => {
    const full = mk({ posU: 0, heightU: 4 })
    expect(findFreeSlot([full], rack, probe(0, 1))).toBeNull()
  })

  it('never returns a slot that runs past the top of the rack', () => {
    expect(findFreeSlot([], rack, probe(3.5, 2))).toBe(2)
  })

  it('ignores the device being moved, so a nudge in place is free', () => {
    const moving = mk({ id: 'd1', posU: 1, heightU: 2 })
    expect(findFreeSlot([moving], rack, { ...probe(1, 2), id: 'd1' })).toBe(1)
  })
})

describe('TestHalfUDevicesShareAUnit', () => {
  it('lets two half-U devices sit in the same unit without colliding', () => {
    const lower = mk({ posU: 0, heightU: 0.5 })
    expect(collides([lower], probe(0.5, 0.5))).toBe(false)
    expect(collides([lower], probe(0, 0.5))).toBe(true)
  })
})

describe('TestFacesAreIndependent', () => {
  it('lets front and rear devices occupy the same units', () => {
    const front = mk({ posU: 0, heightU: 2 })
    expect(collides([front], probe(0, 2, 'rear'))).toBe(false)
    expect(collides([front], probe(0, 2, 'front'))).toBe(true)
  })
})

describe('TestRackWattsSum', () => {
  it('adds up the watts of every device and counts each face separately', () => {
    const big = newRack({ id: 'r1', units: 12 })
    const layout = {
      ...newLayout('stats', [big]),
      devices: [
        mk({ posU: 0, heightU: 2, watts: 30 }),
        mk({ posU: 2, heightU: 1, watts: 12 }),
        mk({ posU: 0, heightU: 1, watts: 8, face: 'rear' }),
      ],
    }
    const stats = rackStats(layout, 'r1')
    expect(stats.watts).toBe(50)
    expect([stats.unitsUsedFront, stats.unitsUsedRear]).toEqual([3, 1])
    expect(stats.unitsFree).toBe(9)
    expect(stats.deviceCount).toBe(3)
  })
})

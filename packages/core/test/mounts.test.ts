import { describe, it, expect } from 'vitest'
import {
  PlacementError,
  addDevice,
  addToMount,
  connect,
  freeSlot,
  guestsOf,
  moveDevice,
  newDevice,
  newLayout,
  newRack,
  rackStats,
  removeDevice,
} from '../src/index.ts'
import type { Device, Layout } from '../src/index.ts'

const rack = newRack({ id: 'R', units: 12 })

const mount = (over: Partial<Device> = {}): Device =>
  newDevice({
    id: 'tray',
    rackId: 'R',
    face: 'front',
    posU: 0,
    heightU: 1,
    type: 'mount',
    name: 'Pi tray',
    slots: 2,
    ...over,
  })

const board = (id: string, over: Partial<Device> = {}): Device =>
  newDevice({
    id,
    rackId: 'R',
    face: 'front',
    posU: 0,
    heightU: 1,
    type: 'sbc',
    name: id,
    ports: 2,
    watts: 8,
    weightKg: 0.1,
    ...over,
  })

const withTray = (): Layout => addDevice(newLayout('mounts', [rack]), mount())

describe('TestBoardsRideInAMountsSlots', () => {
  it('bolts a board into a cut-out and keeps it there', () => {
    const layout = addToMount(withTray(), mount(), 0, board('pi'))
    const guest = layout.devices.find((d) => d.id === 'pi')!
    expect(guest.host).toEqual({ deviceId: 'tray', slot: 0 })
    expect([guest.rackId, guest.face, guest.posU]).toEqual(['R', 'front', 0])
  })

  it('refuses a slot the mount does not have, and one already taken', () => {
    const one = addToMount(withTray(), mount(), 0, board('pi'))
    expect(() => addToMount(one, mount(), 2, board('other'))).toThrow(PlacementError)
    expect(() => addToMount(one, mount(), 2, board('other'))).toThrow(/no slot 3/)
    expect(() => addToMount(one, mount(), 0, board('other'))).toThrow(/already in slot 1/)
  })

  it('reports the next empty cut-out, and nothing when the tray is full', () => {
    const empty = withTray()
    expect(freeSlot(empty, mount())).toBe(0)
    const one = addToMount(empty, mount(), 0, board('pi'))
    expect(freeSlot(one, mount())).toBe(1)
    const full = addToMount(one, mount(), 1, board('pi2'))
    expect(freeSlot(full, mount())).toBeNull()
    expect(guestsOf(full, 'tray').map((d) => d.id)).toEqual(['pi', 'pi2'])
  })
})

describe('TestMountedBoardsTakeNoUnitsOfTheirOwn', () => {
  it('leaves the rack as full as the tray alone makes it', () => {
    const bare = rackStats(withTray(), 'R')
    const loaded = rackStats(
      addToMount(addToMount(withTray(), mount(), 0, board('pi')), mount(), 1, board('pi2')),
      'R',
    )

    expect(loaded.unitsUsedFront).toBe(bare.unitsUsedFront)
    expect(loaded.unitsFree).toBe(bare.unitsFree)
    // the boards are still real hardware: their power and weight count
    expect(loaded.watts).toBe(16)
    expect(loaded.weightKg).toBeCloseTo(0.2)
    expect(loaded.deviceCount).toBe(3)
  })

  it('does not stop another device taking the units the boards appear to be in', () => {
    const loaded = addToMount(withTray(), mount(), 0, board('pi'))
    const next = addDevice(
      loaded,
      newDevice({ id: 'sw', rackId: 'R', face: 'front', posU: 1, heightU: 1, type: 'switch' }),
    )
    expect(next.devices.find((d) => d.id === 'sw')!.posU).toBe(1)
  })
})

describe('TestBoardsFollowTheirMount', () => {
  it('carries the boards when the tray moves, and takes them when it goes', () => {
    const loaded = addToMount(
      addToMount(withTray(), mount(), 0, board('pi')),
      mount(),
      1,
      board('pi2'),
    )

    const moved = moveDevice(loaded, 'tray', { rackId: 'R', face: 'rear', posU: 6 })
    for (const id of ['tray', 'pi', 'pi2']) {
      const d = moved.devices.find((x) => x.id === id)!
      expect([id, d.face, d.posU]).toEqual([id, 'rear', 6])
    }

    const gone = removeDevice(moved, 'tray')
    expect(gone.devices.map((d) => d.id)).toEqual([])
  })

  it('drops the cables of the boards it takes with it', () => {
    const loaded = addToMount(withTray(), mount(), 0, board('pi'))
    const wired = connect(
      addDevice(
        loaded,
        newDevice({ id: 'sw', rackId: 'R', face: 'front', posU: 4, heightU: 1, type: 'switch' }),
      ),
      'network',
      { deviceId: 'sw', port: 0 },
      { deviceId: 'pi', port: 0 },
      { label: '', colour: '#fff', cableType: 'cat6' },
    )
    expect(wired.links).toHaveLength(1)

    expect(removeDevice(wired, 'tray').links).toHaveLength(0)
  })
})

describe('TestABoardGoesInATrayOrNowhere', () => {
  it('refuses to screw a board straight to the rails', () => {
    expect(() => addDevice(withTray(), board('pi'))).toThrow(PlacementError)
    expect(() => addDevice(withTray(), board('pi'))).toThrow(/bolts into a mount tray/)
  })

  it('refuses to move a board out of its tray onto the rails', () => {
    const loaded = addToMount(withTray(), mount(), 0, board('pi'))
    expect(() => moveDevice(loaded, 'pi', { rackId: 'R', face: 'front', posU: 6 })).toThrow(
      /bolts into a mount tray/,
    )
  })

  it('still takes anything with its own ears', () => {
    const rackable = newDevice({
      id: 'sw',
      rackId: 'R',
      face: 'front',
      posU: 5,
      heightU: 1,
      type: 'switch',
    })
    expect(addDevice(withTray(), rackable).devices).toHaveLength(2)
  })
})

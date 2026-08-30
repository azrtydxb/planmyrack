import { describe, it, expect } from 'vitest'
import {
  addDevice,
  addRack,
  canRedo,
  canUndo,
  commit,
  connect,
  disconnect,
  initHistory,
  moveDevice,
  newDevice,
  newLayout,
  newRack,
  redo,
  removeDevice,
  removeRack,
  undo,
  updateDevice,
} from '../src/index.js'
import type { Layout } from '../src/index.js'

const rackA = newRack({ id: 'A', units: 12 })
const rackB = newRack({ id: 'B', units: 12 })

const seeded: Layout = (() => {
  let l = addRack(newLayout('history', [rackA]), rackB)
  l = addDevice(
    l,
    newDevice({ id: 'sw', rackId: 'A', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
  )
  l = addDevice(
    l,
    newDevice({ id: 'nas', rackId: 'A', face: 'front', posU: 4, heightU: 2, type: 'server' }),
  )
  return connect(l, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'nas', port: 0 })
})()

const edits: [string, (l: Layout) => Layout][] = [
  [
    'place',
    (l) =>
      addDevice(l, newDevice({ rackId: 'A', face: 'front', posU: 8, heightU: 1, type: 'server' })),
  ],
  ['move', (l) => moveDevice(l, 'sw', { rackId: 'A', face: 'front', posU: 6 })],
  ['edit', (l) => updateDevice(l, 'sw', { name: 'Core switch', watts: 42 })],
  [
    'connect',
    (l) => connect(l, 'network', { deviceId: 'sw', port: 1 }, { deviceId: 'nas', port: 1 }),
  ],
  ['disconnect', (l) => disconnect(l, l.links[0]!.id)],
  ['delete', (l) => removeDevice(l, 'nas')],
  ['rack', (l) => removeRack(l, 'B')],
]

describe('TestUndoRedoCoversAllEditKinds', () => {
  it.each(edits)('undoes and redoes a %s', (_kind, edit) => {
    const history = commit(initHistory(seeded), edit(seeded))
    expect(history.present).not.toEqual(seeded)
    expect(canUndo(history)).toBe(true)
    expect(undo(history).present).toEqual(seeded)
    expect(redo(undo(history)).present).toEqual(history.present)
  })

  it('does not record an edit that changed nothing', () => {
    const history = commit(initHistory(seeded), seeded)
    expect(canUndo(history)).toBe(false)
  })

  it('drops the redo trail once a new edit is made', () => {
    const one = commit(initHistory(seeded), edits[0]![1](seeded))
    const stepped = undo(one)
    expect(canRedo(stepped)).toBe(true)
    expect(canRedo(commit(stepped, edits[2]![1](stepped.present)))).toBe(false)
  })
})

describe('TestRemoveRackCascadesAndUndoes', () => {
  it('restores the rack, its devices and their cables together', () => {
    const wiredB = addDevice(
      seeded,
      newDevice({ id: 'b1', rackId: 'B', face: 'front', posU: 0, heightU: 1, type: 'patch' }),
    )
    const history = commit(initHistory(wiredB), removeRack(wiredB, 'A'))
    expect(history.present.devices.map((d) => d.id)).toEqual(['b1'])
    expect(history.present.links).toHaveLength(0)
    expect(undo(history).present).toEqual(wiredB)
  })
})

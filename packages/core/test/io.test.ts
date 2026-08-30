import { describe, it, expect } from 'vitest'
import {
  CABLES_CSV_HEADER,
  PARTS_CSV_HEADER,
  addDevice,
  cablesCsv,
  connect,
  exportJson,
  importJson,
  newDevice,
  newLayout,
  newRack,
  partsCsv,
  updateDevice,
} from '../src/index.ts'
import type { Layout } from '../src/index.ts'

const rack = newRack({ id: 'R', units: 12, name: 'Basement' })
const seeded: Layout = (() => {
  let l = newLayout('Basement', [rack])
  l = addDevice(
    l,
    newDevice({ id: 'sw', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
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
      watts: 40,
    }),
  )
  return connect(
    l,
    'network',
    { deviceId: 'sw', port: 0 },
    { deviceId: 'nas', port: 1 },
    {
      label: 'uplink-1',
      colour: '#22c55e',
      cableType: 'cat6a',
    },
  )
})()

describe('TestJsonRoundTrip', () => {
  it('reproduces every rack, device, colour, port count and cable', () => {
    const back = importJson(exportJson(seeded))
    expect(back.racks).toEqual(seeded.racks)
    expect(back.devices).toEqual(seeded.devices)
    expect(back.links).toEqual(seeded.links)
    expect(back.name).toBe(seeded.name)
  })

  it('arrives as a new document so an import cannot overwrite a stored layout', () => {
    const stored = { ...seeded, id: 'stored-1', revision: 7 }
    const back = importJson(exportJson(stored))
    expect([back.id, back.revision]).toEqual([null, 0])
  })
})

describe('TestImportRejectsBadSchema', () => {
  const withDuplicateIds = {
    ...seeded,
    devices: [seeded.devices[0]!, { ...seeded.devices[1]!, id: seeded.devices[0]!.id }],
  }
  const withDanglingLink = {
    ...seeded,
    links: [{ ...seeded.links[0]!, b: { deviceId: 'ghost', port: 0 } }],
  }

  it.each([
    ['not json at all', 'nonsense{'],
    ['a newer schema', JSON.stringify({ ...seeded, schemaVersion: 99 })],
    ['duplicate device ids', JSON.stringify(withDuplicateIds)],
    ['a cable pointing at a missing device', JSON.stringify(withDanglingLink)],
    ['a device in a rack that is absent', JSON.stringify({ ...seeded, racks: [] })],
    [
      'a position off the half-unit grid',
      JSON.stringify({ ...seeded, devices: [{ ...seeded.devices[0]!, posU: 1.3 }] }),
    ],
  ])('refuses %s and names the problem', (_case, text) => {
    expect(() => importJson(text)).toThrow(/That file isn't a layout this version can open:/)
  })
})

describe('TestCsvColumnsAndRowCounts', () => {
  it('writes the documented headers with one row per device and per cable', () => {
    const parts = partsCsv(seeded).trimEnd().split('\n')
    expect(parts[0]).toBe(PARTS_CSV_HEADER.join(','))
    expect(parts).toHaveLength(seeded.devices.length + 1)

    const cables = cablesCsv(seeded).trimEnd().split('\n')
    expect(cables[0]).toBe(CABLES_CSV_HEADER.join(','))
    expect(cables).toHaveLength(seeded.links.length + 1)
  })

  it('quotes a device name containing a comma', () => {
    const withComma = updateDevice(seeded, 'sw', { name: 'Switch, core' })
    expect(partsCsv(withComma)).toContain('"Switch, core"')
  })
})

describe('TestCableMetadataFlowsToScheduleAndCsv', () => {
  it('carries label, colour and cable type into the cable CSV row', () => {
    expect(cablesCsv(seeded)).toContain('uplink-1,cat6a,#22c55e')
  })
})

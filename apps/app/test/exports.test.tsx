import { render, screen } from '@testing-library/react-native'
import {
  CABLES_CSV_HEADER,
  PARTS_CSV_HEADER,
  addDevice,
  cablesCsv,
  connect,
  newDevice,
  newLayout,
  newRack,
  partsCsv,
  updateDevice,
} from '@planmyrack/core'
import { RackSummary } from '../src/ui/RackSummary'
import { exportPng } from '../src/export/png'
import type { Layout } from '@planmyrack/core'

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
      watts: 30,
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
      watts: 12,
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
      watts: 8,
    }),
  )
  return connect(l, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'nas', port: 1 })
})()

describe('TestRackWattsSum — in the UI', () => {
  it('shows the rack total and updates when a device changes', () => {
    const { rerender } = render(<RackSummary layout={seeded} rackId="R" />)
    // the design shows the figure under a mono WATTS caption
    expect(screen.getByTestId('summary-R')).toHaveTextContent(/WATTS50/)

    rerender(<RackSummary layout={updateDevice(seeded, 'sw', { watts: 78 })} rackId="R" />)
    expect(screen.getByTestId('summary-R')).toHaveTextContent(/WATTS98/)
  })

  it('counts each face separately and reports what is free', () => {
    render(<RackSummary layout={seeded} rackId="R" />)
    // one usage bar per face, each reporting what is still free on that face
    const summary = screen.getByTestId('summary-R')
    expect(summary).toHaveTextContent(/Front3U \/ 9 FREE/)
    expect(summary).toHaveTextContent(/Rear1U \/ 11 FREE/)
  })
})

describe('TestPngExportProducesImage', () => {
  it('reports a failure instead of resolving with nothing', async () => {
    await expect(exportPng(seeded, 'front', 'rack.png')).rejects.toThrow(/PNG export failed/)
  })

  it('captures the live view on native', async () => {
    const capture = jest.fn().mockResolvedValue('file:///tmp/rack.png')
    await expect(exportPng(seeded, 'front', 'rack.png', capture)).resolves.toMatch(/\.png$/)
    expect(capture).toHaveBeenCalled()
  })
})

describe('TestCsvColumnsAndRowCounts — from the export menu', () => {
  it('writes the documented headers with one row per device and per cable', () => {
    const parts = partsCsv(seeded).trimEnd().split('\n')
    expect(parts[0]).toBe(PARTS_CSV_HEADER.join(','))
    expect(parts).toHaveLength(seeded.devices.length + 1)

    const cables = cablesCsv(seeded).trimEnd().split('\n')
    expect(cables[0]).toBe(CABLES_CSV_HEADER.join(','))
    expect(cables).toHaveLength(seeded.links.length + 1)
  })
})

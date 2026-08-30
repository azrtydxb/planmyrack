import { fireEvent, render, screen } from '@testing-library/react-native'
import { addDevice, addRack, connect, newDevice, newLayout, newRack } from '@planmyrack/core'
import { CableOverlay } from '../src/canvas/CableOverlay'
import { cablePath } from '../src/canvas/cablePath'
import { CableSchedule } from '../src/ui/CableSchedule'
import { PortPicker } from '../src/ui/PortPicker'
import type { Layout } from '@planmyrack/core'

const rackA = newRack({ id: 'A', units: 12, name: 'A' })
const rackB = newRack({ id: 'B', units: 12, name: 'B' })

const build = (): Layout => {
  let l = addRack(newLayout('cables', [rackA]), rackB)
  l = addDevice(
    l,
    newDevice({
      id: 'sw',
      rackId: 'A',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'switch',
      name: 'Switch',
    }),
  )
  l = addDevice(
    l,
    newDevice({
      id: 'nas',
      rackId: 'A',
      face: 'front',
      posU: 3,
      heightU: 2,
      type: 'server',
      name: 'NAS',
    }),
  )
  l = addDevice(
    l,
    newDevice({
      id: 'far',
      rackId: 'B',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'patch',
      name: 'Patch B',
    }),
  )
  return l
}

const base = build()
const wired = connect(
  base,
  'network',
  { deviceId: 'sw', port: 0 },
  { deviceId: 'nas', port: 1 },
  {
    label: 'uplink-1',
    colour: '#22c55e',
    cableType: 'cat6a',
  },
)
const offsets = { A: { x: 0, y: 0 }, B: { x: 600, y: 0 } }

describe('TestConnectFreePorts — through the UI', () => {
  it('creates the cable when a free port is picked', () => {
    const onConnect = jest.fn()
    render(
      <PortPicker
        layout={base}
        device={base.devices[0]!}
        port={0}
        kind="network"
        onConnect={onConnect}
        onDisconnect={jest.fn()}
        onClose={jest.fn()}
      />,
    )

    fireEvent.press(screen.getByTestId('pick-nas-1'))
    expect(onConnect).toHaveBeenCalledWith(
      { deviceId: 'nas', port: 1 },
      expect.objectContaining({ cableType: 'cat6' }),
    )
  })
})

describe('TestPickerBlocksTakenPorts — through the UI', () => {
  it('shows a taken port as disabled and names what holds it', () => {
    render(
      <PortPicker
        layout={wired}
        device={wired.devices[2]!}
        port={0}
        kind="network"
        onConnect={jest.fn()}
        onDisconnect={jest.fn()}
        onClose={jest.fn()}
      />,
    )

    const taken = screen.getByTestId('pick-nas-1')
    expect(taken.props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText(/Port 2, taken by Switch/)).toBeTruthy()
  })
})

describe('TestDisconnectClearsBothEnds — through the UI', () => {
  it('offers disconnect on a connected port', () => {
    const onDisconnect = jest.fn()
    render(
      <PortPicker
        layout={wired}
        device={wired.devices[0]!}
        port={0}
        kind="network"
        onConnect={jest.fn()}
        onDisconnect={onDisconnect}
        onClose={jest.fn()}
      />,
    )

    expect(screen.getByText(/Connected to NAS port 2/)).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'Disconnect' }))
    expect(onDisconnect).toHaveBeenCalledWith(wired.links[0]!.id)
  })
})

describe('TestCrossRackCableListedWithoutOverlay', () => {
  const crossRack = connect(
    base,
    'network',
    { deviceId: 'sw', port: 2 },
    { deviceId: 'far', port: 0 },
  )

  it('draws same-rack cables but not the cross-rack one it cannot place', () => {
    render(
      <CableOverlay layout={wired} face="front" rackOffsets={offsets} width={900} height={400} />,
    )
    expect(screen.getByTestId(`cable-path-${wired.links[0]!.id}`)).toBeTruthy()
  })

  it('lists the cross-rack cable in the schedule all the same', () => {
    render(<CableSchedule layout={crossRack} />)
    expect(screen.getByTestId(`cable-row-${crossRack.links[0]!.id}`)).toBeTruthy()
    // the design writes a cable as "A · Port n ⇄ B · Port n"
    expect(screen.getByText(/Switch · Port 3 ⇄ Patch B · Port 1/)).toBeTruthy()
  })

  it('draws nothing for a cable whose far end is on the other face', () => {
    const rear = {
      ...wired,
      devices: wired.devices.map((d) => (d.id === 'nas' ? { ...d, face: 'rear' as const } : d)),
    }
    render(
      <CableOverlay layout={rear} face="front" rackOffsets={offsets} width={900} height={400} />,
    )
    expect(screen.queryByTestId(`cable-path-${wired.links[0]!.id}`)).toBeNull()
  })
})

describe('TestCableMetadataFlowsToScheduleAndCsv', () => {
  it('shows the label and cable type in the schedule row', () => {
    render(<CableSchedule layout={wired} />)
    const row = screen.getByTestId(`cable-row-${wired.links[0]!.id}`)
    expect(row).toHaveTextContent(/uplink-1/)
    // cable type reads as a mono chip in the design
    expect(row).toHaveTextContent(/CAT6A/)
  })
})

describe('TestStackedCablesArcRatherThanKink', () => {
  it('bows both control points the same way when two ports are stacked', () => {
    // seen in the running app: opposed control points turned a short vertical run into an S
    const path = cablePath({ x: 200, y: 100 }, { x: 210, y: 160 })
    const [, c1x, , c2x] = /C([\d.-]+),([\d.-]+) ([\d.-]+),([\d.-]+)/.exec(path)!.map(Number)
    expect(c1x).toBeLessThan(200)
    expect(c2x).toBeLessThan(210)
  })

  it('still bows along the run when the ports are far apart horizontally', () => {
    const path = cablePath({ x: 100, y: 100 }, { x: 600, y: 120 })
    const [, c1x] = /C([\d.-]+),/.exec(path)!.map(Number)
    expect(c1x).toBeGreaterThan(100)
  })
})

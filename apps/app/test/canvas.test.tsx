import { fireEvent, render, screen } from '@testing-library/react-native'
import { DEVICE_TYPES, addDevice, addRack, newDevice, newLayout, newRack } from '@planmyrack/core'
import { RackCanvas } from '../src/canvas/RackCanvas'
import { DeviceBox } from '../src/canvas/DeviceBox'
import { RACK_INNER_PX } from '../src/canvas/metrics'
import type { DeviceType, Layout } from '@planmyrack/core'

const wide = newRack({ id: 'W', units: 12, name: 'Wide', width: 19 })
const narrow = newRack({ id: 'N', units: 12, name: 'Narrow', width: 10 })
const twoRacks: Layout = addRack(newLayout('two', [wide]), narrow)

const withDevice = (over: Partial<Parameters<typeof newDevice>[0]>): Layout =>
  addDevice(
    newLayout('one', [wide]),
    newDevice({
      id: 'd1',
      rackId: 'W',
      face: 'front',
      posU: 0,
      heightU: 1,
      type: 'switch',
      ...over,
    }),
  )

const styleOf = (testID: string): Record<string, unknown> => {
  const style = screen.getByTestId(testID).props.style as unknown
  return Object.assign({}, ...(Array.isArray(style) ? style.flat(9) : [style]))
}

describe('TestLayoutHoldsMixedWidthRacks', () => {
  it('draws a 19-inch and a 10-inch rack at different widths, each with its own U scale', () => {
    render(<RackCanvas layout={twoRacks} face="front" />)
    expect(styleOf(`rack-${wide.id}`).width).toBe(RACK_INNER_PX[19])
    expect(styleOf(`rack-${narrow.id}`).width).toBe(RACK_INNER_PX[10])
    // the design numbers the units once, outside the rack on the left — two racks, two scales
    expect(screen.getAllByText('12')).toHaveLength(2)
  })
})

describe('TestFacesAreIndependent — on the canvas', () => {
  it('shows a rear device only on the rear face', () => {
    const layout = withDevice({ face: 'rear', name: 'Rear PDU', type: 'pdu' })
    const { rerender } = render(<RackCanvas layout={layout} face="front" />)
    expect(screen.queryByTestId('device-d1')).toBeNull()
    rerender(<RackCanvas layout={layout} face="rear" />)
    expect(screen.getByTestId('device-d1')).toBeTruthy()
  })
})

describe('TestPortCountRendersExactly', () => {
  it.each([
    [4, 'equipment'],
    [24, 'switch'],
    [48, 'switch'],
  ])('draws %i ports on a %s', (ports, type) => {
    render(<RackCanvas layout={withDevice({ ports, type: type as DeviceType })} face="front" />)
    expect(screen.getAllByTestId(/^port-d1-network-/)).toHaveLength(ports)
  })

  it('redraws when the port count changes', () => {
    const { rerender } = render(<RackCanvas layout={withDevice({ ports: 24 })} face="front" />)
    expect(screen.getAllByTestId(/^port-d1-network-/)).toHaveLength(24)
    rerender(<RackCanvas layout={withDevice({ ports: 48 })} face="front" />)
    expect(screen.getAllByTestId(/^port-d1-network-/)).toHaveLength(48)
  })

  it('draws no ports on a blanking plate', () => {
    render(<RackCanvas layout={withDevice({ type: 'blank', ports: 0 })} face="front" />)
    expect(screen.queryAllByTestId(/^port-d1-network-/)).toHaveLength(0)
  })
})

describe('TestCableManagementFlavoursRender', () => {
  const draw = (type: DeviceType) => {
    const dev = newDevice({ rackId: 'W', face: 'front', posU: 0, heightU: 1, type })
    return JSON.stringify(render(<DeviceBox device={dev} rack={wide} />).toJSON())
  }

  it('draws hooks and brush differently, and both differently from a blank panel', () => {
    const hooks = draw('hooks')
    const brush = draw('brush')
    const blank = draw('blank')
    expect(hooks).not.toBe(brush)
    expect(hooks).not.toBe(blank)
    expect(brush).not.toBe(blank)
  })

  it('offers both flavours at half a unit and one unit', () => {
    for (const type of ['hooks', 'brush'] as const) {
      expect(DEVICE_TYPES[type].sizes).toEqual([0.5, 1])
    }
  })
})

describe('TestHalfUFaceplatesDropTheMetaLine', () => {
  it('shows only the name on a half-U device, which is too short for two lines', () => {
    // seen in the built app: the ½U cable-management label was clipped mid-glyph
    const half = withDevice({ type: 'hooks', heightU: 0.5, name: 'HOOKS', ports: 0 })
    render(<RackCanvas layout={half} face="front" />)
    expect(screen.getByText('HOOKS')).toBeTruthy()
    expect(screen.queryByText('½U')).toBeNull()
  })

  it('keeps the meta line on a full-height device', () => {
    const full = withDevice({ type: 'switch', heightU: 1, name: 'SW', ports: 8 })
    render(<RackCanvas layout={full} face="front" />)
    expect(screen.getByText('1U · 8P')).toBeTruthy()
  })
})

describe('TestPortsStayReachableOnIos', () => {
  it('does not collapse the faceplate into one accessibility element', () => {
    // found with idb on the simulator: iOS merged the children of the accessible faceplate, so
    // all 24 ports vanished from the accessibility tree and VoiceOver could not wire anything
    render(<RackCanvas layout={withDevice({ ports: 24, type: 'switch' })} face="front" />)
    expect(screen.getByTestId('device-d1').props.accessible).toBe(false)
  })

  it('keeps the device selectable and every port addressable', () => {
    const onSelect = jest.fn()
    render(
      <RackCanvas
        layout={withDevice({ ports: 4, type: 'server' })}
        face="front"
        onSelect={onSelect}
      />,
    )

    fireEvent.press(screen.getByRole('button', { name: /1U at U1/ }))
    expect(onSelect).toHaveBeenCalledWith('d1')
    expect(screen.getAllByTestId(/^port-d1-network-/)).toHaveLength(4)
  })
})

describe('TestKnownModelsLookLikeTheirHardware', () => {
  const draw = (over: Parameters<typeof withDevice>[0]) =>
    JSON.stringify(render(<RackCanvas layout={withDevice(over)} face="front" />).toJSON())

  it('draws a NAS with drive bays, unlike a plain server', () => {
    const bays = draw({ type: 'server', faceplate: 'bays', bays: 8, name: 'NAS' })
    const plain = draw({ type: 'server', name: 'NAS' })
    expect(bays).not.toBe(plain)
  })

  it('draws uplink cages for a switch that has them', () => {
    const withCages = draw({ type: 'switch', ports: 24, sfp: 2, name: 'SW' })
    const without = draw({ type: 'switch', ports: 24, name: 'SW' })
    expect(withCages).not.toBe(without)
  })

  it('draws a gateway display', () => {
    const display = draw({ type: 'equipment', faceplate: 'display', ports: 8, name: 'UDM' })
    const plain = draw({ type: 'equipment', ports: 8, name: 'UDM' })
    expect(display).not.toBe(plain)
  })
})

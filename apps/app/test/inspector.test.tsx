import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { addDevice, newDevice, newLayout, newRack, updateDevice } from '@planmyrack/core'
import { createMemoryStore } from '@planmyrack/storage'
import { Inspector } from '../src/ui/Inspector'
import { InspectorHost } from '../src/ui/InspectorHost'
import { useLayoutEditor } from '../src/state/useLayoutEditor'
import type { Device, DeviceType, Layout } from '@planmyrack/core'

const rack = newRack({ id: 'R', units: 12 })
const seeded: Layout = addDevice(
  newLayout('inspect', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
)
const device = (type: DeviceType): Device =>
  newDevice({ rackId: 'R', face: 'front', posU: 0, heightU: 1, type })

const setWidth = (width: number) =>
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width, height: 900, scale: 2, fontScale: 2 })

describe('TestInspectorLayoutByBreakpoint', () => {
  afterEach(() => jest.restoreAllMocks())

  it('is a bottom sheet at phone width', () => {
    setWidth(390)
    render(
      <InspectorHost visible device={device('switch')} onChange={jest.fn()} onClose={jest.fn()} />,
    )
    expect(screen.getByTestId('inspector-sheet')).toBeTruthy()
    expect(screen.queryByTestId('inspector-panel')).toBeNull()
  })

  it('is a side panel at desktop width', () => {
    setWidth(1280)
    render(
      <InspectorHost visible device={device('switch')} onChange={jest.fn()} onClose={jest.fn()} />,
    )
    expect(screen.getByTestId('inspector-panel')).toBeTruthy()
    expect(screen.queryByTestId('inspector-sheet')).toBeNull()
  })
})

describe('TestPortlessTypesHidePortField', () => {
  it.each(['hooks', 'brush', 'shelf', 'blank'] as const)('offers no port field for %s', (type) => {
    render(<Inspector device={device(type)} onChange={jest.fn()} />)
    expect(screen.queryByLabelText('Network ports')).toBeNull()
  })

  it('offers a port field for a switch and outlets for a PDU', () => {
    const { rerender } = render(<Inspector device={device('switch')} onChange={jest.fn()} />)
    expect(screen.getByLabelText('Network ports')).toBeTruthy()
    expect(screen.queryByLabelText('Power outlets')).toBeNull()

    rerender(<Inspector device={device('pdu')} onChange={jest.fn()} />)
    expect(screen.getByLabelText('Power outlets')).toBeTruthy()
  })

  it('caps a typed port count at what the type allows', () => {
    const onChange = jest.fn()
    render(<Inspector device={device('equipment')} onChange={onChange} />)
    fireEvent.changeText(screen.getByLabelText('Network ports'), '99')
    expect(onChange).toHaveBeenCalledWith({ ports: 8 })
  })
})

describe('TestDevicePropertyRoundTrip', () => {
  it('keeps an edited name, colour and watts after saving and reopening', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)

    const { result } = renderHook(() => useLayoutEditor(store, saved))
    act(() =>
      result.current.apply((l) =>
        updateDevice(l, 'd1', { name: 'Core switch', watts: 42, colour: '#22c55e' }),
      ),
    )

    // wait on the store, not on a status flag: the flag is 'idle' before the debounce fires too
    await waitFor(
      async () =>
        expect((await store.get(saved.id!)).devices[0]).toMatchObject({
          name: 'Core switch',
          watts: 42,
          colour: '#22c55e',
        }),
      { timeout: 3000 },
    )
  })

  it('undoes and redoes an edit', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    const { result } = renderHook(() => useLayoutEditor(store, saved))

    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Core switch' })))
    expect(result.current.layout.devices[0]!.name).toBe('Core switch')

    act(() => result.current.undo())
    expect(result.current.layout.devices[0]!.name).not.toBe('Core switch')
    expect(result.current.canRedo).toBe(true)

    act(() => result.current.redo())
    expect(result.current.layout.devices[0]!.name).toBe('Core switch')
  })
})

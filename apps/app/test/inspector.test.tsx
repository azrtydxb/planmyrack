import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native'
import { Dimensions, View } from 'react-native'
import { RackEditorScreen } from '../src/screens/RackEditorScreen'

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }),
}))
import { addDevice, newDevice, newLayout, newRack, updateDevice } from '@planmyrack/core'
import { createMemoryStore } from '@planmyrack/storage'
import { Inspector } from '../src/ui/Inspector'
import { InspectorHost, panelWidth } from '../src/ui/InspectorHost'
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

  it('is a side panel on a phone in landscape, where a sheet would cover everything', () => {
    // 667x375 is an iPhone SE on its side, and the app is locked to landscape: the sheet took
    // the whole screen and pushed the tab bar off the bottom
    setWidth(667)
    render(
      <InspectorHost visible device={device('switch')} onChange={jest.fn()} onClose={jest.fn()} />,
    )
    expect(screen.getByTestId('inspector-panel')).toBeTruthy()
  })

  it('takes a share of a small screen rather than a fixed third of it', () => {
    expect(panelWidth(1440)).toBe(330)
    expect(panelWidth(667)).toBe(267)
    expect(panelWidth(400)).toBe(240)
  })

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

describe('TestRapidEditsDoNotSelfConflict', () => {
  it('saves two quick edits without the app conflicting with itself', async () => {
    // Found by running the built app: placing two devices in a row raised the stale-save dialog,
    // because the second save was sent at the revision the first had already superseded.
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    const { result } = renderHook(() => useLayoutEditor(store, saved))

    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'First' })))
    await waitFor(async () => expect((await store.get(saved.id!)).devices[0]!.name).toBe('First'), {
      timeout: 3000,
    })

    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Second' })))
    await waitFor(
      async () => expect((await store.get(saved.id!)).devices[0]!.name).toBe('Second'),
      { timeout: 3000 },
    )

    expect(result.current.conflict).toBeNull()
    expect(result.current.saving).toBe('idle')
  })
})

describe('TestOneEditWritesOnce', () => {
  it('does not autosave in a loop after the store returns a new revision', async () => {
    // found by watching the running app: revisions climbed about twice a second with nobody
    // touching it, because a successful save changed the layout and re-armed the debounce.
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    const update = jest.spyOn(store, 'update')

    const { result } = renderHook(() => useLayoutEditor(store, saved))
    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Once' })))

    await waitFor(async () => expect((await store.get(saved.id!)).devices[0]!.name).toBe('Once'), {
      timeout: 3000,
    })
    // give the debounce several more windows to misfire
    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(update).toHaveBeenCalledTimes(1)
    expect((await store.get(saved.id!)).revision).toBe(2)
  })
})

describe('TestEditSurvivesLeavingTheEditor', () => {
  it('writes a pending edit when the editor unmounts inside the debounce window', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)

    const { result, unmount } = renderHook(() => useLayoutEditor(store, saved))
    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Typed and left' })))
    // leaving well inside AUTOSAVE_MS: the debounce has not fired yet
    unmount()

    await waitFor(
      async () => expect((await store.get(saved.id!)).devices[0]!.name).toBe('Typed and left'),
      { timeout: 3000 },
    )
  })
})

describe('TestRetryDoesNotConflictWithItself', () => {
  it('never has two saves of the same revision in flight', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    // a slow store is what makes the race visible: the retry used to fire while the debounced
    // save was still running, and the second write was refused as stale by the app's own first
    const realUpdate = store.update.bind(store)
    const update = jest.spyOn(store, 'update').mockImplementation(async (layout) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return realUpdate(layout)
    })

    const { result } = renderHook(() => useLayoutEditor(store, saved))
    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Retried' })))

    await act(async () => {
      // inside the write itself: the debounce fired at 600ms and the store takes 200ms
      await new Promise((resolve) => setTimeout(resolve, 650))
      result.current.saveNow()
      result.current.saveNow()
    })

    await waitFor(() => expect(result.current.saving).toBe('idle'), { timeout: 3000 })
    expect(result.current.conflict).toBeNull()
    expect((await store.get(saved.id!)).devices[0]!.name).toBe('Retried')
    expect(update.mock.calls.map((call) => call[0].revision)).toEqual([1])
  })

  it('writes an edit made while an earlier save was still in flight', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    const realUpdate = store.update.bind(store)
    jest.spyOn(store, 'update').mockImplementation(async (layout) => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return realUpdate(layout)
    })

    const { result } = renderHook(() => useLayoutEditor(store, saved))
    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'First' })))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 650))
      result.current.apply((l) => updateDevice(l, 'd1', { name: 'Second' }))
    })

    await waitFor(
      async () => expect((await store.get(saved.id!)).devices[0]!.name).toBe('Second'),
      { timeout: 4000 },
    )
    expect(result.current.conflict).toBeNull()
  })
})

describe('TestRefusedEditSaysWhy', () => {
  it('surfaces the reason instead of silently doing nothing', async () => {
    // found in the running app: connecting power through the picker did nothing at all, because
    // the refusal was raised inside a state updater and React discarded the error it set.
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    const { result } = renderHook(() => useLayoutEditor(store, saved))

    act(() =>
      result.current.apply(() => {
        throw new Error('that port does not exist')
      }),
    )

    expect(result.current.error).toBe('that port does not exist')
    expect(result.current.layout).toEqual(saved)
  })

  it('clears the error once an edit succeeds', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    const { result } = renderHook(() => useLayoutEditor(store, saved))

    act(() =>
      result.current.apply(() => {
        throw new Error('nope')
      }),
    )
    expect(result.current.error).toBe('nope')

    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Fine' })))
    expect(result.current.error).toBeNull()
  })
})

describe('TestEditorClearsTheStatusBar', () => {
  it('pads the screen by the top safe-area inset', () => {
    // seen on the simulator: the layout name ran under the Dynamic Island, because this screen
    // hides the navigation header and nothing else applied the inset
    const store = createMemoryStore()
    render(<RackEditorScreen store={store} initial={seeded} />)
    const padded = screen.UNSAFE_getByType(View as never)
    expect(JSON.stringify(padded.props.style)).toContain('59')
  })
})

import { act, render, renderHook } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { createMemoryStore } from '@planmyrack/storage'
import { getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { RackEditorScreen } from '../src/screens/RackEditorScreen'
import { addDevice, newDevice, newLayout, newRack } from '@planmyrack/core'
import { U_PX } from '../src/canvas/metrics'
import { positionFromPoint, useDragPlacement } from '../src/canvas/useDragPlacement'
import type { Layout, Rack } from '@planmyrack/core'
import type { RackHit } from '../src/canvas/useDragPlacement'

const rack: Rack = newRack({ id: 'R', units: 12 })
const empty: Layout = newLayout('drag', [rack])
const resolve = (hit: RackHit | null) => () => hit
const front: RackHit = { rack, face: 'front', topY: 0 }

describe('TestDropSnapsToHalfU', () => {
  it('centres a 2U device on the finger, snapped to the half unit', () => {
    // 3.3U down from the top of a 12U rack, centring a 2U device: 12 - 3.3 - 1 = 7.7 -> 7.5
    expect(positionFromPoint(rack, 0, 3.3 * U_PX, 2)).toBe(7.5)
  })

  it('never lets a device hang off either end of the rack', () => {
    expect(positionFromPoint(rack, 0, -500, 2)).toBe(10)
    expect(positionFromPoint(rack, 0, 5000, 2)).toBe(0)
  })
})

describe('TestDropFindsNearestFreeSlotElseRefuses — through the UI', () => {
  it('places a dragged item and reports the drop as valid', () => {
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({ layout: empty, resolve: resolve(front), onCommit }),
    )

    act(() => result.current.startNew('server', 2, { x: 100, y: 3.3 * U_PX }))
    expect(result.current.drag?.target).toMatchObject({ posU: 7.5, valid: true })

    act(() => result.current.drop())
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit.mock.calls[0][0].devices[0]).toMatchObject({ posU: 7.5, heightU: 2 })
    expect(result.current.drag).toBeNull()
  })

  it('leaves the layout alone when the face is full', () => {
    const small = newRack({ id: 'S', units: 1 })
    const full = addDevice(
      newLayout('full', [small]),
      newDevice({ rackId: 'S', face: 'front', posU: 0, heightU: 1, type: 'blank' }),
    )
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({
        layout: full,
        resolve: resolve({ rack: small, face: 'front', topY: 0 }),
        onCommit,
      }),
    )

    act(() => result.current.startNew('server', 1, { x: 10, y: 10 }))
    expect(result.current.drag?.target?.valid).toBe(false)

    act(() => result.current.drop())
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('drops nothing when the finger is not over a rack', () => {
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({ layout: empty, resolve: resolve(null), onCommit }),
    )
    act(() => result.current.startNew('server', 1, { x: 0, y: 0 }))
    expect(result.current.drag?.target).toBeNull()
    act(() => result.current.drop())
    expect(onCommit).not.toHaveBeenCalled()
  })
})

describe('TestDragSurvivesBackgrounding', () => {
  it('cancels a drag without changing the layout', () => {
    const seeded = addDevice(
      empty,
      newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'server' }),
    )
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({ layout: seeded, resolve: resolve(front), onCommit }),
    )

    act(() => result.current.startMove(seeded.devices[0]!, { x: 10, y: 10 }))
    act(() => result.current.cancel())

    expect(result.current.drag).toBeNull()
    act(() => result.current.drop())
    expect(onCommit).not.toHaveBeenCalled()
  })
})

describe('TestMoveDeviceAcrossRackAndFaceKeepsLinks — dragged', () => {
  it('moves the dragged device to the face under the finger', () => {
    const seeded = addDevice(
      empty,
      newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'server' }),
    )
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({
        layout: seeded,
        resolve: resolve({ rack, face: 'rear', topY: 0 }),
        onCommit,
      }),
    )

    act(() => result.current.startMove(seeded.devices[0]!, { x: 10, y: 6 * U_PX }))
    act(() => result.current.drop())

    expect(onCommit.mock.calls[0][0].devices[0]).toMatchObject({ face: 'rear' })
  })
})

describe('TestDragIsWiredToTheConsole', () => {
  afterEach(() => jest.restoreAllMocks())

  const seeded = addDevice(
    newLayout('wired', [newRack({ id: 'R', units: 12 })]),
    newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
  )

  const mountConsole = () => {
    jest
      .spyOn(Dimensions, 'get')
      .mockReturnValue({ width: 1440, height: 900, scale: 2, fontScale: 2 })
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)
  }

  it('hangs a drag gesture on every library row and every placed device', () => {
    // the placement hook and its tests existed from the start; nothing rendered them, so the app
    // could not place anything by dragging at all
    mountConsole()
    expect(getByGestureTestId('drag-palette-switch-1')).toBeTruthy()
    expect(getByGestureTestId('drag-catalog-entry-generic-switch')).toBeTruthy()
    expect(getByGestureTestId('drag-device-d1')).toBeTruthy()
  })

  it('runs the drag on the JS thread, where the layout lives', () => {
    mountConsole()
    // a worklet handler would be a no-op against React state, and the drop would do nothing
    expect(getByGestureTestId('drag-device-d1').config.runOnJS).toBe(true)
  })
})

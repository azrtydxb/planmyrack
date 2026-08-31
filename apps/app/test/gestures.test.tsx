import { act, render, renderHook } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { createMemoryStore } from '@planmyrack/storage'
import { getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { RackEditorScreen } from '../src/screens/RackEditorScreen'
import { addDevice, newDevice, newLayout, newRack } from '@planmyrack/core'
import { RACK_INNER_PX, U_PX } from '../src/canvas/metrics'
import { positionFromPoint, useDragPlacement } from '../src/canvas/useDragPlacement'
import { useDragSource } from '../src/canvas/useDragSource'
import type { Layout, Rack } from '@planmyrack/core'
import type { RackHit } from '../src/canvas/useDragPlacement'

const rack: Rack = newRack({ id: 'R', units: 12 })
const empty: Layout = newLayout('drag', [rack])
const resolve = (hit: RackHit | null) => () => hit
const front: RackHit = { rack, face: 'front', topY: 0, leftX: 0 }

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
        resolve: resolve({ rack: small, face: 'front', topY: 0, leftX: 0 }),
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
        resolve: resolve({ rack, face: 'rear', topY: 0, leftX: 0 }),
        onCommit,
      }),
    )

    act(() => result.current.startMove(seeded.devices[0]!, { x: 10, y: 6 * U_PX }))
    act(() => result.current.drop())

    expect(onCommit.mock.calls[0][0].devices[0]).toMatchObject({ face: 'rear' })
  })
})

describe('TestDragDoesNotAlsoTap', () => {
  it('ignores the press that follows a drag, and keeps a plain press working', () => {
    // web fires a click after the pointer comes up even when the gesture was a drag: a row
    // dragged onto a rack placed the device twice, once at the drop and once at the first slot
    const onPress = jest.fn()
    const { result } = renderHook(() =>
      useDragSource('choice', {
        onStart: jest.fn(),
        onMove: jest.fn(),
        onEnd: jest.fn(),
        onCancel: jest.fn(),
      }),
    )

    expect(result.current.pressWasDrag()).toBe(false)
    onPress()

    // the gesture callbacks the handler would fire, in order
    const config = result.current.gesture as unknown as {
      handlers: { onBegin: () => void; onStart: (e: unknown) => void }
    }
    act(() => {
      config.handlers.onBegin()
      config.handlers.onStart({ absoluteX: 10, absoluteY: 10 })
    })
    expect(result.current.pressWasDrag()).toBe(true)

    act(() => config.handlers.onBegin())
    expect(result.current.pressWasDrag()).toBe(false)
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

  it('runs every gesture in the console on the JS thread, where its state lives', () => {
    // a worklet handler cannot touch React state or an Animated.Value: the drop would do
    // nothing, and a pinch killed the app outright
    mountConsole()
    for (const id of ['drag-device-d1', 'drag-palette-switch-1', 'pinch', 'canvas-pan']) {
      const gesture = getByGestureTestId(id) as unknown as { config: { runOnJS?: boolean } }
      expect([id, gesture.config.runOnJS]).toEqual([id, true])
    }
  })
})

describe('TestNarrowGearDropsIntoTheHalfUnderThePointer', () => {
  const wideRack = newRack({ id: 'W', units: 12, width: 19 })
  const hit: RackHit = { rack: wideRack, face: 'front', topY: 0, leftX: 0 }
  const empty: Layout = newLayout('halves', [wideRack])

  it('takes the left half on the left, and the right half on the right', () => {
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({ layout: empty, resolve: resolve(hit), onCommit }),
    )

    act(() => result.current.startNew('switch', 1, { x: 20, y: 100 }, { width: 10 }))
    expect(result.current.drag?.target?.column).toBe(0)

    act(() => result.current.moveTo({ x: RACK_INNER_PX[19] - 20, y: 100 }))
    expect(result.current.drag?.target?.column).toBe(1)

    act(() => result.current.drop())
    expect(onCommit.mock.calls[0][0].devices[0]).toMatchObject({ column: 1, width: 10 })
  })

  it('leaves wide gear spanning the rack, with no half of its own', () => {
    const onCommit = jest.fn()
    const { result } = renderHook(() =>
      useDragPlacement({ layout: empty, resolve: resolve(hit), onCommit }),
    )

    act(() => result.current.startNew('switch', 1, { x: 20, y: 100 }, { width: 19 }))
    expect(result.current.drag?.target?.column).toBeUndefined()

    act(() => result.current.drop())
    expect(onCommit.mock.calls[0][0].devices[0].column).toBeUndefined()
  })

  it('lets a second narrow device share the unit, in the other half', () => {
    const onCommit = jest.fn()
    const { result, rerender } = renderHook(
      ({ layout }: { layout: Layout }) =>
        useDragPlacement({ layout, resolve: resolve(hit), onCommit }),
      { initialProps: { layout: empty } },
    )

    act(() => result.current.startNew('switch', 1, { x: 20, y: 100 }, { width: 10 }))
    act(() => result.current.drop())
    const withLeft = onCommit.mock.calls[0][0] as Layout
    rerender({ layout: withLeft })

    act(() =>
      result.current.startNew('switch', 1, { x: RACK_INNER_PX[19] - 20, y: 100 }, { width: 10 }),
    )
    const target = result.current.drag?.target
    expect(target?.valid).toBe(true)
    expect(target?.posU).toBe(withLeft.devices[0]!.posU)
  })
})

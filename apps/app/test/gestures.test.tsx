import { act, renderHook } from '@testing-library/react-native'
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

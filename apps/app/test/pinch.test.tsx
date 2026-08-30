import { fireEvent, render, screen } from '@testing-library/react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { addDevice, newDevice, newLayout, newRack } from '@planmyrack/core'
import { CanvasGestures } from '../src/canvas/CanvasGestures'
import { RackCanvas } from '../src/canvas/RackCanvas'
import type { Layout } from '@planmyrack/core'

const rack = newRack({ id: 'R', units: 12 })
const seeded: Layout = addDevice(
  newLayout('pinch', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 4, heightU: 2, type: 'server' }),
)

describe('TestPinchOverDeviceZoomsNotDrags', () => {
  it('zooms the canvas without moving the device the pinch started on', () => {
    const onSelect = jest.fn()
    render(
      <CanvasGestures>
        <RackCanvas layout={seeded} face="front" onSelect={onSelect} />
      </CanvasGestures>,
    )

    fireGestureHandler(getByGestureTestId('pinch'), [
      { state: State.BEGAN, scale: 1 },
      { state: State.ACTIVE, scale: 1 },
      { state: State.ACTIVE, scale: 2 },
      { state: State.END, scale: 2 },
    ])

    // a two-finger gesture is never a device drag
    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByTestId('device-d1')).toBeTruthy()
  })
})

describe('TestZoomControlsAndDropsAgree', () => {
  it('shows the zoom, resets it, and fits the racks on screen', () => {
    render(<RackCanvas layout={seeded} face="front" />)
    expect(screen.getByText('100%')).toBeTruthy()

    fireEvent(screen.getByTestId('canvas-scroll'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 200 } },
    })
    fireEvent.press(screen.getByTestId('zoom-fit'))
    // a 12U rack does not fit 300x200, so fitting has to zoom out
    expect(screen.queryByText('100%')).toBeNull()
    expect(screen.getByText(/^\d+%$/)).toBeTruthy()

    fireEvent.press(screen.getByTestId('zoom-reset'))
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('reports the pinch scale to whoever converts screen points', () => {
    const seen: number[] = []
    render(
      <CanvasGestures onTransform={(t) => seen.push(t.scale)}>
        <RackCanvas layout={seeded} face="front" />
      </CanvasGestures>,
    )

    fireGestureHandler(getByGestureTestId('pinch'), [
      { state: State.BEGAN, scale: 1 },
      { state: State.ACTIVE, scale: 1 },
      { state: State.ACTIVE, scale: 2 },
      { state: State.END, scale: 2 },
    ])

    // without this the drag conversion cannot divide the zoom out and every drop misses
    expect(Math.max(...seen)).toBeGreaterThan(1)
  })
})

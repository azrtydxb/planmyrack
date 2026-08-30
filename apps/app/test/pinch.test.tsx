import { render, screen } from '@testing-library/react-native'
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

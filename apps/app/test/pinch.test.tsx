import { render, screen } from '@testing-library/react-native'
import { State } from 'react-native-gesture-handler'
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils'
import { addDevice, newDevice, newLayout, newRack } from '@planmyrack/core'
import { RackScreen } from '../src/screens/RackScreen'
import type { Layout } from '@planmyrack/core'

const rack = newRack({ id: 'R', units: 12 })
const seeded: Layout = addDevice(
  newLayout('pinch', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 4, heightU: 2, type: 'server' }),
)

describe('TestPinchOverDeviceZoomsNotDrags', () => {
  it('zooms the canvas without moving the device the pinch started on', () => {
    const onChange = jest.fn()
    render(<RackScreen layout={seeded} onChange={onChange} />)

    fireGestureHandler(getByGestureTestId('pinch'), [
      { state: State.BEGAN, scale: 1 },
      { state: State.ACTIVE, scale: 1 },
      { state: State.ACTIVE, scale: 2, scaleChange: 2 },
      { state: State.END, scale: 2 },
    ])

    // the layout is untouched: a two-finger gesture is never a device drag
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('device-d1')).toBeTruthy()
  })
})

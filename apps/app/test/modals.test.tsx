import { render, screen } from '@testing-library/react-native'
import { Modal, Text } from 'react-native'
import { addDevice, newDevice, newLayout, newRack } from '@planmyrack/core'
import { BottomSheet } from '../src/ui/BottomSheet'
import { ConflictDialog } from '../src/ui/ConflictDialog'
import { PortPicker } from '../src/ui/PortPicker'
import type { Layout } from '@planmyrack/core'

const rack = newRack({ id: 'R', units: 12 })
const seeded: Layout = addDevice(
  newLayout('modals', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
)
const device = seeded.devices[0]!

const orientationsOf = (): unknown[][] =>
  screen.UNSAFE_getAllByType(Modal).map((m) => m.props.supportedOrientations ?? [])

describe('TestModalsDeclareLandscape', () => {
  it('every modal in the app supports the only orientation the app has', () => {
    // an iPhone terminated the app the moment a port was tapped:
    // "UIApplicationInvalidInterfaceOrientation: Supported orientations has no common
    // orientation with the application". A Modal is portrait-only unless it says otherwise.
    render(
      <>
        <BottomSheet title="Sheet" visible onClose={jest.fn()}>
          <Text>body</Text>
        </BottomSheet>
        <ConflictDialog current={seeded} onReload={jest.fn()} onExportJson={jest.fn()} />
        <PortPicker
          layout={seeded}
          device={device}
          port={0}
          kind="network"
          onConnect={jest.fn()}
          onDisconnect={jest.fn()}
          onClose={jest.fn()}
        />
      </>,
    )

    const found = orientationsOf()
    expect(found).toHaveLength(3)
    for (const orientations of found) {
      expect(orientations).toContain('landscape')
    }
  })
})

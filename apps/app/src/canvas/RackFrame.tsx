import { StyleSheet, Text, View } from 'react-native'
import { DeviceBox } from './DeviceBox'
import { UScale } from './UScale'
import { RACK_INNER_PX, U_PX, rackHeightPx } from './metrics'
import { theme } from '../ui/theme'
import type { Device, Face, Layout, Rack } from '@planmyrack/core'

export function RackFrame({
  rack,
  devices,
  layout,
  face,
  selectedId,
  dropHint,
  onSelect,
  onPortPress,
  onDeviceLongPress,
}: {
  rack: Rack
  devices: Device[]
  layout?: Layout
  face: Face
  selectedId?: string | null
  dropHint?: { posU: number; heightU: number; valid: boolean } | null
  onSelect?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onDeviceLongPress?: (device: Device) => void
}) {
  const height = rackHeightPx(rack)

  return (
    <View style={styles.rack}>
      <View style={styles.head}>
        <Text style={styles.name} numberOfLines={1}>
          {rack.name}
        </Text>
        <Text style={styles.tag}>
          {rack.width}" · {rack.units}U · {face}
        </Text>
      </View>

      <View style={styles.frame}>
        <UScale units={rack.units} />
        <View
          testID={`rack-${rack.id}`}
          data-face={face}
          style={[styles.body, { width: RACK_INNER_PX[rack.width], height }]}
        >
          {Array.from({ length: rack.units }, (_, i) => (
            <View key={i} style={[styles.unitLine, { top: i * U_PX }]} />
          ))}

          {dropHint ? (
            <View
              testID="drop-hint"
              style={[
                styles.dropHint,
                {
                  top: (rack.units - dropHint.posU - dropHint.heightU) * U_PX,
                  height: dropHint.heightU * U_PX,
                  borderColor: dropHint.valid ? theme.ok : theme.danger,
                },
              ]}
            />
          ) : null}

          {devices.map((device) => (
            <DeviceBox
              key={device.id}
              device={device}
              rack={rack}
              layout={layout}
              selected={device.id === selectedId}
              onPress={onSelect}
              onPortPress={onPortPress}
              onLongPress={onDeviceLongPress}
            />
          ))}
        </View>
        <UScale units={rack.units} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rack: { marginRight: 20 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 },
  name: { color: theme.text, fontWeight: '700', fontSize: 15 },
  tag: { color: theme.dim, fontSize: 12 },
  frame: { flexDirection: 'row', alignItems: 'flex-start' },
  body: {
    position: 'relative',
    backgroundColor: '#0d1424',
    borderColor: theme.panelEdge,
    borderWidth: 2,
    borderRadius: 4,
  },
  unitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(147,160,192,0.12)',
  },
  dropHint: { position: 'absolute', left: 0, right: 0, borderWidth: 2, borderRadius: 3 },
})

import { StyleSheet, Text, View } from 'react-native'
import { DeviceBox } from './DeviceBox'
import { Rail } from './Rail'
import { CAP_PX, RACK_INNER_PX, SCALE_PX, U_PX, rackHeightPx } from './metrics'
import { Mono } from '../ui/primitives'
import { colour, font, rack as hw } from '../ui/theme'
import type { DragSource } from './useDragSource'
import type { Device, Face, Layout, Rack } from '@planmyrack/core'

/** U numbers run outside the rack, counting from 1 at the bottom as a real rack does. */
function UScale({ units }: { units: number }) {
  return (
    <View style={styles.scale}>
      {Array.from({ length: units }, (_, i) => units - i).map((u) => (
        <View key={u} style={styles.scaleCell}>
          <Mono size={7.5} tone="#9aa4b0" weight="medium">
            {u}
          </Mono>
        </View>
      ))}
    </View>
  )
}

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
  onBodyLayout,
  drag,
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
  /** Reports where the rack body actually landed, so cables can be drawn from measured ports. */
  onBodyLayout?: (rackId: string, origin: { x: number; y: number }) => void
  drag?: DragSource<Device>
}) {
  const height = rackHeightPx(rack)

  return (
    <View style={styles.rack}>
      <View style={styles.frameRow}>
        <UScale units={rack.units} />
        <View>
          <View style={styles.cap} />
          <View style={styles.body}>
            <Rail units={rack.units} />
            <View
              testID={`rack-${rack.id}`}
              onLayout={(event) => {
                const { x, y } = event.nativeEvent.layout
                onBodyLayout?.(rack.id, { x, y })
              }}
              style={[styles.inner, { width: RACK_INNER_PX[rack.width], height }]}
            >
              {dropHint ? (
                <View
                  testID="drop-hint"
                  style={[
                    styles.dropHint,
                    {
                      top: (rack.units - dropHint.posU - dropHint.heightU) * U_PX,
                      height: dropHint.heightU * U_PX,
                      borderColor: dropHint.valid ? colour.accent : colour.danger,
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
                  drag={drag}
                />
              ))}
            </View>
            <Rail units={rack.units} />
          </View>
          <View style={styles.cap} />
        </View>
      </View>

      <Text style={styles.caption}>
        {rack.name.toUpperCase()} · {rack.units}U · {rack.width}" · {face.toUpperCase()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  rack: { alignItems: 'center', marginRight: 28 },
  frameRow: { flexDirection: 'row', alignItems: 'flex-start' },
  scale: { width: SCALE_PX, paddingTop: CAP_PX },
  scaleCell: { height: U_PX, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 3 },
  cap: { height: CAP_PX, backgroundColor: hw.cap, borderRadius: 3 },
  body: { flexDirection: 'row', backgroundColor: hw.body },
  inner: { position: 'relative', backgroundColor: hw.body },
  dropHint: { position: 'absolute', left: 0, right: 0, borderWidth: 2, borderRadius: 2 },
  caption: {
    marginTop: 10,
    fontFamily: font.monoBold,
    fontSize: 8,
    letterSpacing: 1,
    color: colour.mutedSoft,
  },
})

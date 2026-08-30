import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg from 'react-native-svg'
import { sizeLabel } from '@planmyrack/core'
import { DeviceArt } from './art'
import { PortGrid } from './PortGrid'
import { deviceRect } from './metrics'
import { theme } from '../ui/theme'
import type { Device, Layout, Rack } from '@planmyrack/core'

export const DeviceBox = memo(function DeviceBox({
  device,
  rack,
  layout,
  selected,
  onPress,
  onPortPress,
  onLongPress,
}: {
  device: Device
  rack: Rack
  layout?: Layout
  selected?: boolean
  onPress?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onLongPress?: (device: Device) => void
}) {
  const rect = deviceRect(rack, device)

  return (
    <Pressable
      testID={`device-${device.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${device.name}, ${sizeLabel(device.heightU)} at U${device.posU + 1}`}
      onPress={() => onPress?.(device.id)}
      onLongPress={() => onLongPress?.(device)}
      style={[
        styles.box,
        {
          top: rect.top,
          height: rect.height,
          width: rect.width,
          backgroundColor: device.colour,
          borderColor: selected ? theme.text : 'rgba(0,0,0,0.35)',
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={rect.width} height={rect.height}>
          <DeviceArt type={device.type} width={rect.width} height={rect.height} />
        </Svg>
      </View>

      <View style={styles.label} pointerEvents="none">
        <Text numberOfLines={1} style={styles.name}>
          {device.name}
        </Text>
        <Text style={styles.size}>{sizeLabel(device.heightU)}</Text>
      </View>

      <PortGrid
        device={device}
        layout={layout}
        boxWidth={rect.width}
        boxHeight={rect.height}
        onPortPress={onPortPress}
      />
    </Pressable>
  )
})

const styles = StyleSheet.create({
  box: { position: 'absolute', left: 0, borderRadius: 3, overflow: 'hidden', justifyContent: 'center' },
  label: { paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: '#0b1020', fontWeight: '700', fontSize: 12, flexShrink: 1 },
  size: { color: 'rgba(11,16,32,0.7)', fontSize: 11, fontWeight: '600' },
})

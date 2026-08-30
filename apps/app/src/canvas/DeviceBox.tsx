import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { sizeLabel } from '@planmyrack/core'
import { PortStrip } from './PortStrip'
import { deviceRect, labelGutter } from './metrics'
import { colour, font, radius, rack as hw } from '../ui/theme'
import type { Device, Layout, Rack } from '@planmyrack/core'

/** Types that are hardware faceplates rather than passive panels. */
const FLAT: Record<string, string> = {
  blank: hw.blank,
  brush: hw.brush,
  hooks: hw.blank,
}

function Hooks({ width, height }: { width: number; height: number }) {
  const count = Math.max(4, Math.floor(width / 52))
  return (
    <View style={[styles.hooks, { height }]} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.hook} />
      ))}
    </View>
  )
}

function Brush({ width }: { width: number }) {
  const count = Math.max(20, Math.floor(width / 5))
  return (
    <View style={styles.brush} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.bristle} />
      ))}
    </View>
  )
}

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
  const flat = FLAT[device.type]
  const shelf = device.type === 'shelf'
  const meta = [
    sizeLabel(device.heightU),
    device.ports > 0 ? `${device.ports}P` : null,
    device.watts ? `${device.watts}W` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const body = (
    <>
      {device.type === 'hooks' ? <Hooks width={rect.width} height={rect.height} /> : null}
      {device.type === 'brush' ? <Brush width={rect.width} /> : null}

      <View style={[styles.label, { width: labelGutter(rect.width) }]} pointerEvents="none">
        <Text numberOfLines={1} style={[styles.name, shelf && styles.nameOnLight]}>
          {device.name.toUpperCase()}
        </Text>
        <Text numberOfLines={1} style={[styles.meta, shelf && styles.metaOnLight]}>
          {meta}
        </Text>
      </View>

      <PortStrip
        device={device}
        layout={layout}
        boxWidth={rect.width}
        boxHeight={rect.height}
        onPortPress={onPortPress}
      />
    </>
  )

  return (
    <Pressable
      testID={`device-${device.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${device.name}, ${sizeLabel(device.heightU)} at U${device.posU + 1}`}
      onPress={() => onPress?.(device.id)}
      onLongPress={() => onLongPress?.(device)}
      style={[
        styles.box,
        { top: rect.top, height: rect.height, width: rect.width },
        selected && styles.selected,
      ]}
    >
      {shelf ? (
        <LinearGradient colors={[hw.shelfTop, hw.shelfBottom]} style={styles.fill}>
          {body}
        </LinearGradient>
      ) : flat ? (
        <View style={[styles.fill, { backgroundColor: flat }]}>{body}</View>
      ) : (
        <LinearGradient colors={[hw.faceTop, hw.faceBottom]} style={styles.fill}>
          {body}
        </LinearGradient>
      )}
      {/* the device colour reads as a status bar down the left edge of the faceplate */}
      <View style={[styles.stripe, { backgroundColor: device.colour }]} pointerEvents="none" />
    </Pressable>
  )
})

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    left: 0,
    borderRadius: radius.face,
    borderWidth: 1,
    borderColor: hw.faceBorder,
    overflow: 'hidden',
  },
  selected: { borderColor: colour.accent, borderWidth: 2 },
  fill: { flex: 1, justifyContent: 'center' },
  label: { paddingLeft: 10, gap: 1 },
  name: { fontFamily: font.uiBold, fontSize: 9.5, color: hw.faceText, letterSpacing: 0.2 },
  nameOnLight: { color: '#1b2129' },
  meta: { fontFamily: font.mono, fontSize: 7, color: hw.faceMeta, letterSpacing: 0.4 },
  metaOnLight: { color: '#2b323a' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  hooks: {
    position: 'absolute',
    left: 74,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  hook: {
    width: 18,
    height: 14,
    borderColor: '#5b6674',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
  },
  brush: {
    position: 'absolute',
    left: 74,
    right: 8,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bristle: { width: 1, height: 12, backgroundColor: '#4a5462' },
})

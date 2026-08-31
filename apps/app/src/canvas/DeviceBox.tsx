import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import { LinearGradient } from 'expo-linear-gradient'
import { sizeLabel } from '@planmyrack/core'
import { MountedBox } from './MountedBox'
import { PortStrip } from './PortStrip'
import { deviceRect, labelGutter } from './metrics'
import { useDragSource } from './useDragSource'
import { colour, font, radius, rack as hw } from '../ui/theme'
import type { DragSource } from './useDragSource'
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

/** Drive bays, drawn as the vertical carriers a rack NAS actually shows. */
function Bays({ count, height }: { count: number; height: number }) {
  return (
    <View style={[styles.bays, { height }]} pointerEvents="none">
      {Array.from({ length: Math.min(count, 16) }, (_, i) => (
        <View key={i} style={styles.bay}>
          <View style={styles.bayHandle} />
        </View>
      ))}
    </View>
  )
}

/** The small status display a gateway carries instead of a bare plate. */
function Display() {
  return (
    <View style={styles.display} pointerEvents="none">
      <View style={styles.displayLine} />
      <View style={[styles.displayLine, styles.displayLineShort]} />
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
  guests = [],
  selectedId,
  onPress,
  onPortPress,
  onLongPress,
  drag,
}: {
  device: Device
  rack: Rack
  layout?: Layout
  selected?: boolean
  onPress?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onLongPress?: (device: Device) => void
  /** The boards bolted into this device, when it is a mount. */
  guests?: Device[]
  selectedId?: string | null
  drag?: DragSource<Device>
}) {
  const { gesture: dragGesture } = useDragSource(device, drag, `drag-device-${device.id}`)
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
      {device.faceplate === 'bays' && device.bays ? (
        <Bays count={device.bays} height={rect.height} />
      ) : null}
      {device.faceplate === 'display' ? <Display /> : null}

      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${device.name}, ${sizeLabel(device.heightU)} at U${device.posU + 1}`}
        onPress={() => onPress?.(device.id)}
        onLongPress={() => onLongPress?.(device)}
        style={[styles.label, { width: labelGutter(rect.width) }]}
      >
        <Text numberOfLines={1} style={[styles.name, shelf && styles.nameOnLight]}>
          {device.name.toUpperCase()}
        </Text>
        {/* a half-U faceplate is 17px tall: the name and its meta line cannot both fit */}
        {device.heightU >= 1 ? (
          <Text numberOfLines={1} style={[styles.meta, shelf && styles.metaOnLight]}>
            {meta}
          </Text>
        ) : null}
      </Pressable>

      <PortStrip
        device={device}
        layout={layout}
        boxWidth={rect.width}
        boxHeight={rect.height}
        onPortPress={onPortPress}
      />

      {device.slots ? (
        <MountedBox
          mount={device}
          guests={guests}
          layout={layout}
          boxWidth={rect.width}
          boxHeight={rect.height}
          selectedId={selectedId}
          onSelect={onPress}
          onPortPress={onPortPress}
        />
      ) : null}
    </>
  )

  return (
    /*
     * accessible={false} on the faceplate matters more than it looks. iOS merges the children of
     * an accessible view into one element, which turned the whole device into a single button and
     * hid all 24 of its ports — VoiceOver could never reach a port to wire it. The name area
     * inside carries the button role instead, leaving each port its own element.
     */
    <GestureDetector gesture={dragGesture}>
      <Pressable
        testID={`device-${device.id}`}
        accessible={false}
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
    </GestureDetector>
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
  bays: {
    position: 'absolute',
    left: 96,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bay: {
    flex: 1,
    maxWidth: 16,
    height: '62%',
    borderRadius: 1,
    backgroundColor: '#171d24',
    borderWidth: 0.5,
    borderColor: '#39424d',
    justifyContent: 'center',
    paddingLeft: 1.5,
  },
  bayHandle: { width: 2, height: '58%', borderRadius: 1, backgroundColor: '#59657a' },
  display: {
    position: 'absolute',
    left: 98,
    width: 34,
    top: 6,
    bottom: 6,
    borderRadius: 2,
    backgroundColor: '#0a0f14',
    borderWidth: 0.5,
    borderColor: '#39424d',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  displayLine: { height: 1.5, borderRadius: 1, backgroundColor: '#22c55e' },
  displayLineShort: { width: '55%' },
})

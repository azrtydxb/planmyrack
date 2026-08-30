import { Pressable, StyleSheet, View } from 'react-native'
import { portKey } from './portKey'
import { portRects } from './metrics'
import { TOUCH, rack as hw } from '../ui/theme'
import type { Device, Layout, LinkKind } from '@planmyrack/core'

/**
 * The port strip on a faceplate. A free port is near-black with a hairline of shine along its
 * top; a connected one takes the cable's colour and glows. Slots are small by design, so each
 * carries a finger-sized hit area rather than being enlarged.
 */
export function PortStrip({
  device,
  layout,
  boxWidth,
  boxHeight,
  onPortPress,
}: {
  device: Device
  layout?: Layout
  boxWidth: number
  boxHeight: number
  onPortPress?: (device: Device, port: number, kind: LinkKind) => void
}) {
  const rects = portRects(device, boxWidth, boxHeight)
  if (rects.length === 0) return null

  const linkFor = (port: number) =>
    layout?.links.find(
      (l) =>
        l.kind === 'network' &&
        ((l.a.deviceId === device.id && l.a.port === port) ||
          (l.b.deviceId === device.id && l.b.port === port)),
    )

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {rects.map((rect, index) => {
        const link = linkFor(index)
        const padX = Math.max(0, (TOUCH - rect.width) / 2)
        const padY = Math.max(0, (TOUCH - rect.height) / 2)
        return (
          <Pressable
            key={index}
            testID={portKey(device.id, index, 'network')}
            accessibilityRole="button"
            accessibilityLabel={`${device.name} port ${index + 1}${link ? ', connected' : ', free'}`}
            hitSlop={{ top: padY, bottom: padY, left: padX, right: padX }}
            onPress={() => onPortPress?.(device, index, 'network')}
            style={[
              styles.port,
              {
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                backgroundColor: link ? link.colour : hw.portFree,
                shadowColor: link ? link.colour : undefined,
                shadowOpacity: link ? 0.9 : 0,
                shadowRadius: link ? 4 : 0,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  port: { position: 'absolute', borderRadius: 1 },
})

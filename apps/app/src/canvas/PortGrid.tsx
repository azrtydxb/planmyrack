import { Pressable, StyleSheet, View } from 'react-native'
import { portKey } from './portKey'
import { portRects } from './metrics'
import { theme } from '../ui/theme'
import type { Device, Layout, LinkKind } from '@planmyrack/core'

/**
 * Port squares are drawn small enough that 48 fit in 1U, so each one carries a 44pt touch target
 * centred on it. Looking at a port and hitting it are different problems.
 */
export function PortGrid({
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
    <View style={styles.layer} pointerEvents="box-none">
      {rects.map((rect, index) => {
        const link = linkFor(index)
        const pad = Math.max(0, (theme.touch - rect.size) / 2)
        return (
          <Pressable
            key={index}
            testID={portKey(device.id, index, 'network')}
            accessibilityRole="button"
            accessibilityLabel={`${device.name} port ${index + 1}${link ? ', connected' : ', free'}`}
            hitSlop={{ top: pad, bottom: pad, left: pad, right: pad }}
            onPress={() => onPortPress?.(device, index, 'network')}
            style={[
              styles.port,
              {
                left: rect.x,
                top: rect.y,
                width: rect.size,
                height: rect.size,
                backgroundColor: link ? link.colour : 'rgba(11,16,32,0.55)',
                borderColor: link ? '#0b1020' : 'rgba(230,236,255,0.4)',
              },
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject },
  port: { position: 'absolute', borderRadius: 2, borderWidth: 1 },
})

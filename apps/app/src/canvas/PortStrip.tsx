import { Pressable, StyleSheet, View } from 'react-native'
import { portKey } from './portKey'
import { cageRects, copperPorts, portRects } from './metrics'
import { rack as hw } from '../ui/theme'
import type { Device, Layout, LinkKind } from '@planmyrack/core'

/**
 * The ports on a faceplate: the copper strip, then any SFP cages at the right edge. A free port
 * is near-black with a hairline of shine along its top; a connected one takes the cable's colour
 * and glows. Slots are small by design, so each carries a finger-sized hit area.
 *
 * The cages are ports, not decoration. An aggregation switch is eight cages and nothing else, and
 * every one of them takes a cable.
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
  const copper = copperPorts(device)
  const rects = [
    ...portRects(device, boxWidth, boxHeight),
    ...cageRects(device, boxWidth, boxHeight),
  ]
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
        /*
         * A modest margin, not a finger-sized one. Expanding each 8x12 slot to 44x44 turned the
         * strip into a solid wall of port targets: on a 24-port switch every tap anywhere near
         * the faceplate opened the port picker, and the device itself could not be selected at
         * all. The finger-sized targets are the port grid in the inspector; this strip is the
         * precise one, and the gaps between its slots belong to the device underneath.
         */
        const padX = 2
        const padY = 4
        return (
          <Pressable
            key={index}
            testID={portKey(device.id, index, 'network')}
            accessibilityRole="button"
            accessibilityLabel={`${device.name} port ${index + 1}${link ? ', connected' : ', free'}`}
            hitSlop={{ top: padY, bottom: padY, left: padX, right: padX }}
            onPress={() => onPortPress?.(device, index, 'network')}
            style={[
              index >= copper ? styles.cage : styles.port,
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
  cage: { position: 'absolute', borderRadius: 1, borderWidth: 0.5, borderColor: hw.cage },
})

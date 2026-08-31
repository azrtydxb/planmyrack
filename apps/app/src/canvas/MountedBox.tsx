import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PortStrip } from './PortStrip'
import { slotRects } from './metrics'
import { colour, font, rack as hw } from '../ui/theme'
import type { Device, Layout, LinkKind } from '@planmyrack/core'

/**
 * The cut-outs of a mount tray, and whatever is bolted into them.
 *
 * A board is a device in its own right — its own name, its own ports, its own cables — but it has
 * no position on the rails: it sits in a slot of the tray that carries it.
 */
export function MountedBox({
  mount,
  guests,
  layout,
  boxWidth,
  boxHeight,
  selectedId,
  onSelect,
  onPortPress,
}: {
  mount: Device
  guests: Device[]
  layout?: Layout
  boxWidth: number
  boxHeight: number
  selectedId?: string | null
  onSelect?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: LinkKind) => void
}) {
  const slots = slotRects(mount, boxWidth, boxHeight)
  if (slots.length === 0) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {slots.map((rect, slot) => {
        const guest = guests.find((g) => g.host?.slot === slot)
        const frame = { left: rect.x, top: rect.y, width: rect.width, height: rect.height }

        if (!guest) {
          return (
            // accessible, so the cut-out is announced as an empty slot rather than as "+", and
            // pointerEvents none, so a board dragged over it still reaches the canvas beneath
            <View
              key={slot}
              testID={`mount-slot-${mount.id}-${slot}`}
              accessible
              accessibilityLabel={`${mount.name} slot ${slot + 1}, empty — drag a board here`}
              style={[styles.empty, frame]}
              pointerEvents="none"
            >
              <Text style={styles.emptyGlyph}>+</Text>
            </View>
          )
        }

        return (
          <View key={slot} style={[styles.guest, frame, guest.id === selectedId && styles.chosen]}>
            <Pressable
              testID={`mounted-${guest.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${guest.name}, in ${mount.name} slot ${slot + 1}`}
              onPress={() => onSelect?.(guest.id)}
              style={styles.guestLabel}
            >
              <Text numberOfLines={1} style={styles.guestName}>
                {guest.name.toUpperCase()}
              </Text>
            </Pressable>
            <View style={[styles.stripe, { backgroundColor: guest.colour }]} pointerEvents="none" />
            <PortStrip
              device={guest}
              layout={layout}
              boxWidth={rect.width}
              boxHeight={rect.height}
              onPortPress={onPortPress}
            />
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    position: 'absolute',
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: hw.railLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGlyph: { fontFamily: font.uiBold, fontSize: 13, color: hw.railLight },
  guest: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: hw.faceTop,
    borderWidth: 1,
    borderColor: hw.railDark,
    overflow: 'hidden',
  },
  chosen: { borderColor: colour.accent, borderWidth: 1.5 },
  guestLabel: { paddingLeft: 6, paddingTop: 3, paddingRight: 4 },
  guestName: { fontFamily: font.uiBold, fontSize: 7.5, color: '#e8eef6', letterSpacing: 0.2 },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2 },
})

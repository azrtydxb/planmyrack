import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Mono } from './primitives'
import { TOUCH, colour, font, radius } from './theme'
import type { Rack } from '@planmyrack/core'

/** One chip per rack, then a dashed chip to add another — the design's rack switcher. */
export function RackPager({
  racks,
  activeId,
  onSelect,
  onEditRack,
  onAddRack,
}: {
  racks: Rack[]
  activeId: string | null
  onSelect: (rackId: string) => void
  onEditRack?: (rackId: string) => void
  onAddRack?: () => void
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // a scroller grows to fill its column by default, which centred these chips in half the
      // canvas and pushed the racks off the bottom of the screen
      style={styles.bar}
      contentContainerStyle={styles.row}
    >
      {racks.map((rack) => {
        const on = rack.id === activeId
        return (
          /*
           * accessible={false} on the chip for the same reason the faceplate carries it: iOS
           * merges an accessible view's children into one element, which swallowed the ⚙ whole.
           * On an iPad the only route to a rack's name, standard and height could not be reached
           * by VoiceOver at all.
           */
          <View
            key={rack.id}
            accessible={false}
            style={[styles.chip, on && styles.chipOn]}
            testID={`rack-chip-${rack.id}`}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${rack.name}, ${rack.units}U`}
              onPress={() => onSelect(rack.id)}
              style={styles.chipMain}
            >
              <Text style={[styles.name, on && styles.nameOn]}>{rack.name}</Text>
              <Mono size={8} tone={on ? colour.accent : colour.icon}>
                {`${rack.units}U`}
              </Mono>
            </Pressable>
            {on && onEditRack ? (
              <Pressable
                testID={`rack-settings-${rack.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Rack settings for ${rack.name}`}
                onPress={() => onEditRack(rack.id)}
                style={styles.gear}
                hitSlop={10}
              >
                <Text style={styles.gearText}>⚙</Text>
              </Pressable>
            ) : null}
          </View>
        )
      })}

      {onAddRack ? (
        <Pressable
          testID="add-rack"
          accessibilityRole="button"
          accessibilityLabel="Add rack"
          onPress={onAddRack}
          style={[styles.chip, styles.chipAdd]}
        >
          <Text style={styles.addText}>+ Rack</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  bar: { flexGrow: 0, flexShrink: 0 },
  row: { gap: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH - 6,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.border,
    backgroundColor: colour.surface,
  },
  chipOn: { borderColor: colour.accent, borderWidth: 1.5 },
  chipAdd: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  name: { fontFamily: font.ui, fontSize: 12.5, color: colour.textSecondary },
  nameOn: { fontFamily: font.uiBold, color: colour.text },
  addText: { fontFamily: font.ui, fontSize: 12.5, color: colour.muted },
  chipMain: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: TOUCH - 6 },
  gear: { paddingLeft: 6, alignItems: 'center', justifyContent: 'center' },
  gearText: { fontSize: 13, color: colour.icon },
})

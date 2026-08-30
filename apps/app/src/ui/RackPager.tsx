import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Mono } from './primitives'
import { TOUCH, colour, font, radius } from './theme'
import type { Rack } from '@planmyrack/core'

/** One chip per rack, then a dashed chip to add another — the design's rack switcher. */
export function RackPager({
  racks,
  activeId,
  onSelect,
  onAddRack,
}: {
  racks: Rack[]
  activeId: string | null
  onSelect: (rackId: string) => void
  onAddRack?: () => void
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {racks.map((rack) => {
        const on = rack.id === activeId
        return (
          <Pressable
            key={rack.id}
            testID={`rack-chip-${rack.id}`}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${rack.name}, ${rack.units}U`}
            onPress={() => onSelect(rack.id)}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={[styles.name, on && styles.nameOn]}>{rack.name}</Text>
            <Mono size={8} tone={on ? colour.accent : colour.icon}>
              {`${rack.units}U`}
            </Mono>
          </Pressable>
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
})

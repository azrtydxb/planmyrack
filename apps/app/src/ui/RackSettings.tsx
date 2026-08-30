import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { MAX_RACK_UNITS, RACK_UNIT_PRESETS, RACK_WIDTHS } from '@planmyrack/core'
import { NumberField, TextField } from './Field'
import { Button, Mono } from './primitives'
import { TOUCH, colour, font, radius } from './theme'
import type { Rack, RackWidth } from '@planmyrack/core'

/**
 * Rack name, standard, height and removal. The core has held these operations from the start;
 * this is the surface that lets anyone reach them.
 */
export function RackSettings({
  rack,
  onChange,
  onRemove,
  error,
}: {
  rack: Rack
  onChange: (patch: Partial<Rack>) => void
  onRemove?: () => void
  error?: string | null
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <TextField label="Rack name" value={rack.name} onChange={(name) => onChange({ name })} />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Standard</Text>
        <View style={styles.chips}>
          {RACK_WIDTHS.map((width: RackWidth) => (
            <Pressable
              key={width}
              accessibilityRole="button"
              accessibilityLabel={`${width}" rack`}
              accessibilityState={{ selected: width === rack.width }}
              onPress={() => onChange({ width })}
              style={[styles.chip, width === rack.width && styles.chipOn]}
            >
              <Text style={[styles.chipText, width === rack.width && styles.chipTextOn]}>
                {`${width}"`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Height</Text>
        <View style={styles.chips}>
          {RACK_UNIT_PRESETS.map((units) => (
            <Pressable
              key={units}
              accessibilityRole="button"
              accessibilityLabel={`${units}U rack`}
              accessibilityState={{ selected: units === rack.units }}
              onPress={() => onChange({ units })}
              style={[styles.chip, units === rack.units && styles.chipOn]}
            >
              <Text style={[styles.chipText, units === rack.units && styles.chipTextOn]}>
                {`${units}U`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.fields}>
        <NumberField
          label="Units"
          value={rack.units}
          onChange={(units) => onChange({ units: Math.min(MAX_RACK_UNITS, Math.max(1, units)) })}
        />
        <NumberField
          label="Depth (mm)"
          value={rack.depthMm}
          onChange={(depthMm) => onChange({ depthMm: Math.max(0, depthMm) })}
        />
      </View>

      {error ? (
        <Text testID="rack-error" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {onRemove ? (
        <View style={styles.actions}>
          {confirming ? (
            <>
              <Mono size={7.5} tone={colour.icon}>
                {`REMOVES ${rack.name.toUpperCase()} AND EVERYTHING IN IT`}
              </Mono>
              <Button label="Delete rack for good" tone="danger" onPress={onRemove} />
              <Button label="Keep rack" onPress={() => setConfirming(false)} />
            </>
          ) : (
            <Button label="Delete rack" tone="danger" onPress={() => setConfirming(true)} />
          )}
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingBottom: 28 },
  row: { gap: 8 },
  rowLabel: { fontFamily: font.uiBold, fontSize: 14, color: colour.text },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    minHeight: TOUCH - 10,
    minWidth: 52,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.border,
    backgroundColor: colour.surface,
  },
  chipOn: { borderColor: colour.accent, borderWidth: 1.5, backgroundColor: colour.accentSoft },
  chipText: { fontFamily: font.ui, fontSize: 13, color: colour.textSecondary },
  chipTextOn: { fontFamily: font.uiBold, color: colour.accent },
  fields: { flexDirection: 'row', gap: 10 },
  actions: { gap: 8 },
  error: { fontFamily: font.ui, fontSize: 12.5, color: colour.danger },
})

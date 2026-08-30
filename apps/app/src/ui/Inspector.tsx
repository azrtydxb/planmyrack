import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { COLOURS, DEVICE_TYPES, UNIT_SIZES, otherEnd, sizeLabel } from '@planmyrack/core'
import { Button } from './Button'
import { NumberField, TextField } from './Field'
import { theme } from './theme'
import type { Device, Layout } from '@planmyrack/core'

/**
 * Everything about one device. Port and outlet fields exist only for types that can carry them —
 * a shelf has no ports, so offering the field would be a lie the model would then have to reject.
 */
export function Inspector({
  device,
  layout,
  onChange,
  onDuplicate,
  onDelete,
  onSaveTemplate,
}: {
  device: Device
  layout?: Layout
  onChange: (patch: Partial<Device>) => void
  onDuplicate?: () => void
  onDelete?: () => void
  onSaveTemplate?: () => void
}) {
  const spec = DEVICE_TYPES[device.type]
  const cables = layout?.links.filter(
    (l) => l.a.deviceId === device.id || l.b.deviceId === device.id,
  )

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <TextField label="Name" value={device.name} onChange={(name) => onChange({ name })} />

      <View style={styles.row}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chips}>
          {Object.values(DEVICE_TYPES).map((option) => (
            <Pressable
              key={option.type}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: option.type === device.type }}
              onPress={() => onChange({ type: option.type })}
              style={[styles.chip, option.type === device.type && styles.chipOn]}
            >
              <Text style={styles.chipText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Height</Text>
        <View style={styles.chips}>
          {UNIT_SIZES.filter((size) => spec.sizes.includes(size)).map((size) => (
            <Pressable
              key={size}
              accessibilityRole="button"
              accessibilityLabel={`Height ${sizeLabel(size)}`}
              accessibilityState={{ selected: size === device.heightU }}
              onPress={() => onChange({ heightU: size })}
              style={[styles.chip, size === device.heightU && styles.chipOn]}
            >
              <Text style={styles.chipText}>{sizeLabel(size)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Colour</Text>
        <View style={styles.chips}>
          {COLOURS.map((colour) => (
            <Pressable
              key={colour}
              accessibilityRole="button"
              accessibilityLabel={`Colour ${colour}`}
              accessibilityState={{ selected: colour === device.colour }}
              onPress={() => onChange({ colour })}
              style={[
                styles.swatch,
                { backgroundColor: colour },
                colour === device.colour && styles.swatchOn,
              ]}
            />
          ))}
        </View>
      </View>

      {spec.maxPorts > 0 ? (
        <NumberField
          label="Network ports"
          value={device.ports}
          onChange={(ports) => onChange({ ports: Math.min(spec.maxPorts, Math.max(0, ports)) })}
        />
      ) : null}

      {spec.maxOutlets > 0 ? (
        <NumberField
          label="Power outlets"
          value={device.outlets}
          onChange={(outlets) =>
            onChange({ outlets: Math.min(spec.maxOutlets, Math.max(0, outlets)) })
          }
        />
      ) : null}

      <NumberField
        label="Power (W)"
        value={device.watts}
        onChange={(watts) => onChange({ watts })}
      />
      <NumberField
        label="Weight (kg)"
        value={device.weightKg}
        onChange={(weightKg) => onChange({ weightKg })}
      />
      <NumberField
        label="Depth (mm)"
        value={device.depthMm}
        onChange={(depthMm) => onChange({ depthMm })}
      />
      <TextField label="Notes" value={device.notes} onChange={(notes) => onChange({ notes })} />

      {cables ? (
        <View style={styles.row}>
          <Text style={styles.label}>Connections ({cables.length})</Text>
          {cables.length === 0 ? (
            <Text style={styles.dim}>Tap a port on this device to connect it.</Text>
          ) : null}
          {cables.map((link) => {
            const near = link.a.deviceId === device.id ? link.a : link.b
            const far = otherEnd(link, near)
            const farName = layout?.devices.find((d) => d.id === far.deviceId)?.name ?? far.deviceId
            return (
              <Text key={link.id} testID={`inspector-cable-${link.id}`} style={styles.dim}>
                port {near.port + 1} → {farName} port {far.port + 1}
                {link.label ? ` · ${link.label}` : ''}
              </Text>
            )
          })}
        </View>
      ) : null}

      <View style={styles.actions}>
        {onSaveTemplate ? <Button label="Save as template" onPress={onSaveTemplate} /> : null}
        {onDuplicate ? <Button label="Duplicate" onPress={onDuplicate} /> : null}
        {onDelete ? <Button label="Delete" tone="danger" onPress={onDelete} /> : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  body: { gap: theme.gap, paddingBottom: 24 },
  row: { gap: 6 },
  label: { color: theme.dim, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: theme.touch,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.panelEdge,
    backgroundColor: theme.bg,
  },
  chipOn: { borderColor: theme.accent, backgroundColor: 'rgba(59,130,246,0.15)' },
  chipText: { color: theme.text, fontSize: 13 },
  swatch: {
    width: theme.touch,
    height: theme.touch,
    borderRadius: theme.radius,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchOn: { borderColor: theme.text },
  dim: { color: theme.dim, fontSize: 13 },
  actions: { flexDirection: 'row', gap: theme.gap, flexWrap: 'wrap', marginTop: 8 },
})

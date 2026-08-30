import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { DEVICE_TYPES, sizeLabel } from '@planmyrack/core'
import { BUNDLED_CATALOG, catalogByVendor } from '@planmyrack/catalog'
import { theme } from './theme'
import type { DeviceType } from '@planmyrack/core'
import type { CatalogEntry } from '@planmyrack/catalog'
import type { Template } from '@planmyrack/storage'

export interface PaletteChoice {
  type: DeviceType
  heightU: number
  name?: string
  ports?: number
  outlets?: number
  watts?: number
  colour?: string
}

/**
 * Three sources in one list: bare shapes by type and size, the user's saved gear, and the
 * bundled catalogue grouped by vendor.
 */
export function Palette({
  templates = [],
  onPick,
}: {
  templates?: Template[]
  onPick: (choice: PaletteChoice) => void
}) {
  const vendors = useMemo(() => [...catalogByVendor(BUNDLED_CATALOG).entries()], [])

  const entryChoice = (entry: CatalogEntry): PaletteChoice => ({
    type: entry.type,
    heightU: entry.heightU,
    name: entry.vendor === 'Generic' ? entry.model : `${entry.vendor} ${entry.model}`,
    ports: entry.ports,
    outlets: entry.outlets,
    watts: entry.watts,
    colour: entry.colour,
  })

  return (
    <ScrollView style={styles.palette} contentContainerStyle={styles.content}>
      <Text style={styles.group}>Sizes</Text>
      <View style={styles.items}>
        {Object.values(DEVICE_TYPES).flatMap((spec) =>
          spec.sizes.map((size) => (
            <Pressable
              key={`${spec.type}-${size}`}
              testID={`palette-${spec.type}-${size}`}
              accessibilityRole="button"
              accessibilityLabel={`${spec.label} ${sizeLabel(size)}`}
              onPress={() => onPick({ type: spec.type, heightU: size })}
              style={[styles.item, { borderLeftColor: spec.defaultColour }]}
            >
              <Text style={styles.itemSize}>{sizeLabel(size)}</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {spec.label}
              </Text>
            </Pressable>
          )),
        )}
      </View>

      {templates.length > 0 ? (
        <>
          <Text style={styles.group}>My gear</Text>
          <View style={styles.items}>
            {templates.map((template) => (
              <Pressable
                key={template.id}
                testID={`template-${template.id}`}
                accessibilityRole="button"
                accessibilityLabel={template.name}
                onPress={() =>
                  onPick({
                    type: template.type,
                    heightU: template.heightU,
                    name: template.name,
                    ports: template.ports,
                    outlets: template.outlets,
                    watts: template.watts,
                    colour: template.colour,
                  })
                }
                style={[styles.item, { borderLeftColor: template.colour }]}
              >
                <Text style={styles.itemSize}>{sizeLabel(template.heightU)}</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {template.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {vendors.map(([vendor, entries]) => (
        <View key={vendor}>
          <Text style={styles.group}>{vendor}</Text>
          <View style={styles.items}>
            {entries.map((entry) => (
              <Pressable
                key={entry.id}
                testID={`catalog-entry-${entry.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${entry.vendor} ${entry.model}`}
                onPress={() => onPick(entryChoice(entry))}
                style={[styles.item, { borderLeftColor: entry.colour }]}
              >
                <Text style={styles.itemSize}>{sizeLabel(entry.heightU)}</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {entry.model}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  palette: { backgroundColor: theme.panel, maxHeight: 260 },
  content: { padding: 12, gap: 6 },
  group: {
    color: theme.dim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  items: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    minHeight: theme.touch,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: theme.panelEdge,
    backgroundColor: theme.bg,
    maxWidth: 170,
  },
  itemSize: { color: theme.dim, fontSize: 10, fontWeight: '700' },
  itemName: { color: theme.text, fontSize: 13 },
})

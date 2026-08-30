import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { DEVICE_TYPES, sizeLabel } from '@planmyrack/core'
import { BUNDLED_CATALOG, catalogByVendor } from '@planmyrack/catalog'
import { Mono, Segmented } from './primitives'
import { TOUCH, colour, font, radius, rack as hw } from './theme'
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

/** Miniature faceplate, so a library row reads as the hardware it will place. */
function Thumb({ ports }: { ports: number }) {
  const slots = Math.min(12, Math.max(1, ports))
  return (
    <View style={styles.thumb}>
      {ports > 0 ? (
        <View style={styles.thumbPorts}>
          {Array.from({ length: slots }, (_, i) => (
            <View key={i} style={styles.thumbPort} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

function Row({
  name,
  meta,
  ports,
  accent,
  testID,
  onPress,
}: {
  name: string
  meta: string
  ports: number
  accent: string
  testID: string
  onPress: () => void
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={styles.row}
    >
      <Thumb ports={ports} />
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={styles.rowName}>
          {name}
        </Text>
        <Mono size={7.5} tone={colour.muted} weight="medium">
          {meta}
        </Mono>
      </View>
      <View style={[styles.add, { borderColor: accent }]}>
        <Text style={[styles.addGlyph, { color: accent }]}>+</Text>
      </View>
    </Pressable>
  )
}

/** Catalogue and saved gear, grouped by vendor as the design lays it out. */
export function Palette({
  templates = [],
  onPick,
}: {
  templates?: Template[]
  onPick: (choice: PaletteChoice) => void
}) {
  const [tab, setTab] = useState<'catalogue' | 'saved'>('catalogue')
  const [query, setQuery] = useState('')
  const vendors = useMemo(() => [...catalogByVendor(BUNDLED_CATALOG).entries()], [])
  const match = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase())

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
    <View style={styles.panel}>
      <View style={styles.controls}>
        <TextInput
          accessibilityLabel="Search equipment"
          placeholder="Search equipment"
          placeholderTextColor={colour.icon}
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
        <Segmented
          label="Library source"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'catalogue', label: 'Catalogue' },
            { value: 'saved', label: 'Saved' },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {tab === 'saved' ? (
          templates.length === 0 ? (
            <Text style={styles.empty}>
              No saved gear yet. Configure a device and choose Template to keep it.
            </Text>
          ) : (
            <View style={styles.group}>
              <Mono size={7.5} tone={colour.icon}>
                MY GEAR
              </Mono>
              {templates
                .filter((t) => match(t.name))
                .map((template) => (
                  <Row
                    key={template.id}
                    testID={`template-${template.id}`}
                    name={template.name}
                    ports={template.ports}
                    accent={template.colour}
                    meta={[
                      sizeLabel(template.heightU),
                      template.ports ? `${template.ports}P` : null,
                      template.watts ? `${template.watts}W` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
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
                  />
                ))}
            </View>
          )
        ) : (
          <>
            <View style={styles.group}>
              <Mono size={7.5} tone={colour.icon}>
                SIZES
              </Mono>
              <View style={styles.sizes}>
                {Object.values(DEVICE_TYPES).flatMap((spec) =>
                  spec.sizes
                    .filter(() => match(spec.label))
                    .map((size) => (
                      <Pressable
                        key={`${spec.type}-${size}`}
                        testID={`palette-${spec.type}-${size}`}
                        accessibilityRole="button"
                        accessibilityLabel={`${spec.label} ${sizeLabel(size)}`}
                        onPress={() => onPick({ type: spec.type, heightU: size })}
                        style={[styles.sizeChip, { borderLeftColor: spec.defaultColour }]}
                      >
                        <Mono size={7} tone={colour.icon}>
                          {sizeLabel(size)}
                        </Mono>
                        <Text numberOfLines={1} style={styles.sizeName}>
                          {spec.label}
                        </Text>
                      </Pressable>
                    )),
                )}
              </View>
            </View>

            {vendors.map(([vendor, entries]) => {
              const shown = entries.filter((e) => match(`${e.vendor} ${e.model}`))
              if (shown.length === 0) return null
              return (
                <View key={vendor} style={styles.group}>
                  <Mono size={7.5} tone={colour.icon}>
                    {vendor.toUpperCase()}
                  </Mono>
                  {shown.map((entry) => (
                    <Row
                      key={entry.id}
                      testID={`catalog-entry-${entry.id}`}
                      name={`${entry.vendor === 'Generic' ? '' : `${entry.vendor} `}${entry.model}`.trim()}
                      ports={entry.ports}
                      accent={entry.colour}
                      meta={[
                        sizeLabel(entry.heightU),
                        entry.ports ? `${entry.ports}P` : null,
                        entry.outlets ? `${entry.outlets} OUT` : null,
                        entry.watts ? `${entry.watts}W` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      onPress={() => onPick(entryChoice(entry))}
                    />
                  ))}
                </View>
              )
            })}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { flex: 1, backgroundColor: colour.surface },
  controls: { padding: 14, gap: 10 },
  search: {
    minHeight: 40,
    borderRadius: radius.button,
    backgroundColor: colour.sunkenSoft,
    paddingHorizontal: 12,
    fontFamily: font.ui,
    fontSize: 13,
    color: colour.text,
  },
  list: { padding: 14, paddingTop: 0, gap: 16 },
  group: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: TOUCH + 8,
    paddingHorizontal: 10,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.borderSoft,
    backgroundColor: colour.surface,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontFamily: font.uiBold, fontSize: 13, color: colour.text },
  add: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyph: { fontFamily: font.uiBold, fontSize: 15, lineHeight: 17 },
  thumb: {
    width: 46,
    height: 22,
    borderRadius: 3,
    backgroundColor: hw.faceBottom,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  thumbPorts: { flexDirection: 'row', gap: 1.5, justifyContent: 'flex-end' },
  thumbPort: { width: 2.5, height: 8, borderRadius: 0.5, backgroundColor: hw.portFree },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeChip: {
    minHeight: TOUCH,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: radius.button,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: colour.borderSoft,
    backgroundColor: colour.surface,
    maxWidth: 168,
  },
  sizeName: { fontFamily: font.ui, fontSize: 12, color: colour.text },
  empty: { fontFamily: font.ui, fontSize: 13, color: colour.muted },
})

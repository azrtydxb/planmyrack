import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import { DEVICE_TYPES, sizeLabel } from '@planmyrack/core'
import { BUNDLED_CATALOG, catalogByVendor } from '@planmyrack/catalog'
import { useDragSource } from '../canvas/useDragSource'
import { Mono, Segmented } from './primitives'
import { TOUCH, colour, font, radius, rack as hw } from './theme'
import type { DeviceType } from '@planmyrack/core'
import type { CatalogEntry } from '@planmyrack/catalog'
import type { DragSource } from '../canvas/useDragSource'
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

/** −  N  +  for setting how many ports (or outlets) a generic device is placed with. */
function Stepper({
  label,
  owner,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  /** Named in the button labels: several rows have a stepper, and "one more ports" alone is
   *  ambiguous to anyone navigating by voice. */
  owner: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)))
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${owner}: one fewer ${label}`}
        accessibilityState={{ disabled: value <= min }}
        disabled={value <= min}
        onPress={() => step(-1)}
        style={[styles.stepButton, value <= min && styles.stepButtonOff]}
      >
        <Text style={styles.stepGlyph}>−</Text>
      </Pressable>
      <View style={styles.stepValue}>
        <Text style={styles.stepNumber}>{value}</Text>
        <Mono size={6} tone={colour.icon} weight="medium">
          {label.toUpperCase()}
        </Mono>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${owner}: one more ${label}`}
        accessibilityState={{ disabled: value >= max }}
        disabled={value >= max}
        onPress={() => step(1)}
        style={[styles.stepButton, value >= max && styles.stepButtonOff]}
      >
        <Text style={styles.stepGlyph}>+</Text>
      </Pressable>
    </View>
  )
}

/** One of the plain size chips — the same drag source as a catalogue row. */
function SizeChip({
  label,
  accent,
  choice,
  drag,
  onPress,
}: {
  label: string
  accent: string
  choice: PaletteChoice
  drag?: DragSource<PaletteChoice>
  onPress: () => void
}) {
  const gesture = useDragSource(choice, drag, `drag-palette-${choice.type}-${choice.heightU}`)
  return (
    <GestureDetector gesture={gesture}>
      <Pressable
        testID={`palette-${choice.type}-${choice.heightU}`}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${sizeLabel(choice.heightU)}`}
        onPress={onPress}
        style={[styles.sizeChip, { borderLeftColor: accent }]}
      >
        <Mono size={7} tone={colour.icon}>
          {sizeLabel(choice.heightU)}
        </Mono>
        <Text numberOfLines={1} style={styles.sizeName}>
          {label}
        </Text>
      </Pressable>
    </GestureDetector>
  )
}

function Row({
  name,
  meta,
  ports,
  accent,
  testID,
  onPress,
  stepper,
  choice,
  drag,
}: {
  name: string
  meta: string
  ports: number
  accent: string
  testID: string
  onPress: () => void
  stepper?: ReactNode
  choice: PaletteChoice
  drag?: DragSource<PaletteChoice>
}) {
  const gesture = useDragSource(choice, drag, `drag-${testID}`)
  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.row}>
        <Thumb ports={ports} />
        <View style={styles.rowText}>
          <Text numberOfLines={1} style={styles.rowName}>
            {name}
          </Text>
          <Mono size={7.5} tone={colour.muted} weight="medium">
            {meta}
          </Mono>
          {stepper}
        </View>
        <Pressable
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={onPress}
          style={[styles.add, { borderColor: accent }]}
        >
          <Text style={[styles.addGlyph, { color: accent }]}>+</Text>
        </Pressable>
      </View>
    </GestureDetector>
  )
}

/** Catalogue and saved gear, grouped by vendor as the design lays it out. */
export function Palette({
  templates = [],
  onPick,
  drag,
}: {
  templates?: Template[]
  onPick: (choice: PaletteChoice) => void
  /** Set by the console so a row can be dragged onto a rack instead of tapped. */
  drag?: DragSource<PaletteChoice>
}) {
  const [tab, setTab] = useState<'catalogue' | 'saved'>('catalogue')
  const [query, setQuery] = useState('')
  /** Port or outlet counts the user has dialled in for generic gear, keyed by catalogue id. */
  const [counts, setCounts] = useState<Record<string, number>>({})
  const vendors = useMemo(() => [...catalogByVendor(BUNDLED_CATALOG).entries()], [])
  const match = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase())

  const templateChoice = (template: Template): PaletteChoice => ({
    type: template.type,
    heightU: template.heightU,
    name: template.name,
    ports: template.ports,
    outlets: template.outlets,
    watts: template.watts,
    colour: template.colour,
  })

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
                    choice={templateChoice(template)}
                    drag={drag}
                    onPress={() => onPick(templateChoice(template))}
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
                      <SizeChip
                        key={`${spec.type}-${size}`}
                        label={spec.label}
                        accent={spec.defaultColour}
                        choice={{ type: spec.type, heightU: size }}
                        drag={drag}
                        onPress={() => onPick({ type: spec.type, heightU: size })}
                      />
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
                  {shown.map((entry) => {
                    const spec = DEVICE_TYPES[entry.type]
                    // Generic gear is configured before it is placed; a known model is what it is.
                    const countable =
                      entry.vendor === 'Generic' && (spec.maxPorts > 0 || spec.maxOutlets > 0)
                    // A PDU has a couple of network ports but is defined by its outlets; step
                    // whichever count the device is really described by.
                    const isOutlets = spec.maxOutlets > spec.maxPorts
                    const count = counts[entry.id] ?? (isOutlets ? entry.outlets : entry.ports)
                    const chosen = countable
                      ? { ...entry, [isOutlets ? 'outlets' : 'ports']: count }
                      : entry

                    return (
                      <Row
                        key={entry.id}
                        testID={`catalog-entry-${entry.id}`}
                        name={`${entry.vendor === 'Generic' ? '' : `${entry.vendor} `}${entry.model}`.trim()}
                        ports={countable ? count : entry.ports}
                        accent={entry.colour}
                        meta={[
                          sizeLabel(entry.heightU),
                          !countable && entry.ports ? `${entry.ports}P` : null,
                          !countable && entry.outlets ? `${entry.outlets} OUT` : null,
                          entry.watts ? `${entry.watts}W` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        stepper={
                          countable ? (
                            <Stepper
                              owner={entry.model}
                              label={isOutlets ? 'outlets' : 'ports'}
                              value={count}
                              min={0}
                              max={isOutlets ? spec.maxOutlets : spec.maxPorts}
                              onChange={(next) =>
                                setCounts((current) => ({ ...current, [entry.id]: next }))
                              }
                            />
                          ) : undefined
                        }
                        choice={entryChoice(chosen)}
                        drag={drag}
                        onPress={() => onPick(entryChoice(chosen))}
                      />
                    )
                  })}
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.borderSoft,
    backgroundColor: colour.surface,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontFamily: font.uiBold, fontSize: 13, color: colour.text },
  add: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colour.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colour.surface,
  },
  stepButtonOff: { opacity: 0.35 },
  stepGlyph: { fontFamily: font.uiBold, fontSize: 15, color: colour.textSecondary, lineHeight: 17 },
  stepValue: { minWidth: 42, alignItems: 'center' },
  stepNumber: { fontFamily: font.uiBold, fontSize: 13, color: colour.text },
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

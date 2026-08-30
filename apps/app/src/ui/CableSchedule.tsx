import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { otherEnd } from '@planmyrack/core'
import { Button, Mono } from './primitives'
import { TOUCH, colour, font, radius } from './theme'
import type { Layout } from '@planmyrack/core'

type Filter = 'all' | 'network' | 'power' | string

/** Every cable in the layout, including the ones the overlay cannot draw. */
export function CableSchedule({
  layout,
  onJumpToDevice,
  onDisconnect,
  onExportCsv,
}: {
  layout: Layout
  onJumpToDevice?: (deviceId: string) => void
  onDisconnect?: (linkId: string) => void
  onExportCsv?: () => void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const name = (id: string) => layout.devices.find((d) => d.id === id)?.name ?? id
  const rackOf = (deviceId: string) => layout.devices.find((d) => d.id === deviceId)?.rackId

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...layout.racks.map((rack) => ({ value: rack.id, label: rack.name })),
    { value: 'network', label: 'Network' },
    { value: 'power', label: 'Power' },
  ]

  const shown = layout.links.filter((link) => {
    if (filter === 'all') return true
    if (filter === 'network' || filter === 'power') return link.kind === filter
    return rackOf(link.a.deviceId) === filter || rackOf(link.b.deviceId) === filter
  })

  return (
    <View style={styles.screen}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.title}>Cables</Text>
          <Mono size={8.5}>
            {`${layout.name.toUpperCase()} · ${layout.links.length} ${
              layout.links.length === 1 ? 'CONNECTION' : 'CONNECTIONS'
            }`}
          </Mono>
        </View>
        {onExportCsv ? <Button small label="Export CSV" tone="soft" onPress={onExportCsv} /> : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={`Filter ${option.label}`}
            accessibilityState={{ selected: option.value === filter }}
            onPress={() => setFilter(option.value)}
            style={[styles.filter, option.value === filter && styles.filterOn]}
          >
            <Text style={[styles.filterText, option.value === filter && styles.filterTextOn]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {shown.length === 0 ? (
          <Text style={styles.empty}>No cables yet. Tap a port on a device to connect it.</Text>
        ) : null}

        {shown.map((link) => {
          const far = otherEnd(link, link.a)
          const crossRack = rackOf(link.a.deviceId) !== rackOf(far.deviceId)
          return (
            <View key={link.id} testID={`cable-row-${link.id}`} style={styles.row}>
              <View style={[styles.bar, { backgroundColor: link.colour }]} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${name(link.a.deviceId)} port ${link.a.port + 1}`}
                style={styles.rowText}
                onPress={() => onJumpToDevice?.(link.a.deviceId)}
              >
                <Text style={styles.rowTitle}>
                  {name(link.a.deviceId)} · Port {link.a.port + 1} ⇄ {name(far.deviceId)} · Port{' '}
                  {far.port + 1}
                </Text>
                <View style={styles.rowMeta}>
                  <View style={styles.typeChip}>
                    <Mono size={7} tone={colour.textSecondary}>
                      {link.kind === 'power' ? 'POWER' : link.cableType.toUpperCase()}
                    </Mono>
                  </View>
                  {link.label ? (
                    <Mono size={7.5} tone={colour.muted} weight="medium">
                      {link.label}
                    </Mono>
                  ) : null}
                  {crossRack ? (
                    <View style={styles.crossRack}>
                      <Mono size={6.5} tone="#b45309">
                        CROSS-RACK
                      </Mono>
                    </View>
                  ) : null}
                </View>
              </Pressable>
              {onDisconnect ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Disconnect ${name(link.a.deviceId)} port ${link.a.port + 1}`}
                  onPress={() => onDisconnect(link.id)}
                  style={styles.remove}
                >
                  <Text style={styles.removeGlyph}>×</Text>
                </Pressable>
              ) : null}
            </View>
          )
        })}

        {shown.length > 0 ? (
          <Mono size={7.5} tone={colour.icon} style={styles.hint}>
            TAP A CABLE TO JUMP TO ITS DEVICE
          </Mono>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colour.appBg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  headText: { flex: 1, gap: 3 },
  title: { fontFamily: font.uiBold, fontSize: 22, color: colour.text },
  // a horizontal ScrollView stretches its children to full height without this
  filters: { gap: 8, paddingHorizontal: 16, paddingBottom: 12, alignItems: 'center' },
  filter: {
    minHeight: 32,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colour.surface,
    borderWidth: 1,
    borderColor: colour.border,
  },
  filterOn: { backgroundColor: colour.text, borderColor: colour.text },
  filterText: { fontFamily: font.ui, fontSize: 11.5, color: colour.textSecondary },
  filterTextOn: { fontFamily: font.uiBold, color: '#fff' },
  list: { padding: 16, paddingTop: 0, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colour.surface,
    borderRadius: radius.card,
    padding: 12,
  },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  rowText: { flex: 1, gap: 5, minHeight: TOUCH - 20, justifyContent: 'center' },
  rowTitle: { fontFamily: font.ui, fontSize: 13, color: colour.text },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colour.sunkenSoft,
  },
  crossRack: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#fef3c7',
  },
  remove: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  removeGlyph: { fontSize: 18, color: colour.icon },
  empty: { fontFamily: font.ui, fontSize: 13, color: colour.muted, padding: 8 },
  hint: { alignSelf: 'center', marginTop: 12 },
})

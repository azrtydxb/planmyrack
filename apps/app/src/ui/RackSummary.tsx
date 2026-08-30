import { StyleSheet, Text, View } from 'react-native'
import { rackStats } from '@planmyrack/core'
import { Mono, StatTile } from './primitives'
import { colour, font, radius } from './theme'
import type { Layout } from '@planmyrack/core'

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const share = total > 0 ? Math.min(1, used / total) : 0
  return (
    <View style={styles.usage}>
      <View style={styles.usageHead}>
        <Text style={styles.usageLabel}>{label}</Text>
        <Mono size={8} tone={colour.muted}>
          {`${used}U / ${(total - used).toFixed(1).replace(/\.0$/, '')} FREE`}
        </Mono>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${share * 100}%` }]} />
      </View>
    </View>
  )
}

/** Units used per face, what is free, and the totals that decide whether the rack can take more. */
export function RackSummary({ layout, rackId }: { layout: Layout; rackId: string }) {
  const rack = layout.racks.find((r) => r.id === rackId)
  const stats = rackStats(layout, rackId)
  if (!rack) return null

  return (
    <View testID={`summary-${rackId}`} style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.name}>{rack.name}</Text>
        <Mono size={8}>{`${rack.units}U · ${rack.width}" · ${stats.deviceCount} DEVICES`}</Mono>
      </View>

      <UsageBar label="Front" used={stats.unitsUsedFront} total={rack.units} />
      <UsageBar label="Rear" used={stats.unitsUsedRear} total={rack.units} />

      <View style={styles.tiles}>
        <StatTile caption="Watts" value={String(stats.watts)} />
        <StatTile caption="Kg" value={String(stats.weightKg)} />
        <StatTile caption="Dev" value={String(stats.deviceCount)} />
        <StatTile caption="Cbl" value={String(stats.linkCount)} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colour.surface,
    borderWidth: 1,
    borderColor: colour.borderSoft,
  },
  head: { gap: 3 },
  name: { fontFamily: font.uiBold, fontSize: 15, color: colour.text },
  usage: { gap: 5 },
  usageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  usageLabel: { fontFamily: font.ui, fontSize: 12, color: colour.textSecondary },
  track: { height: 6, borderRadius: 3, backgroundColor: colour.sunken, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colour.accent },
  tiles: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})

import { StyleSheet, Text, View } from 'react-native'
import { rackStats } from '@planmyrack/core'
import { theme } from './theme'
import type { Layout } from '@planmyrack/core'

/** Units used per face, what is free, and the totals that decide whether the rack can take more. */
export function RackSummary({ layout, rackId }: { layout: Layout; rackId: string }) {
  const rack = layout.racks.find((r) => r.id === rackId)
  const stats = rackStats(layout, rackId)
  if (!rack) return null

  return (
    <View testID={`summary-${rackId}`} style={styles.card}>
      <Text style={styles.name}>{rack.name}</Text>
      <Text style={styles.line}>
        {stats.unitsUsedFront}U front · {stats.unitsUsedRear}U rear · {stats.unitsFree}U free
      </Text>
      <Text style={styles.line}>
        {stats.watts} W · {stats.weightKg} kg
      </Text>
      <Text style={styles.line}>
        {stats.deviceCount} devices · {stats.linkCount} cables
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.panelEdge,
    backgroundColor: theme.panel,
    gap: 2,
  },
  name: { color: theme.text, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  line: { color: theme.dim, fontSize: 12 },
})

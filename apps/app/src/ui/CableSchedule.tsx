import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { otherEnd } from '@planmyrack/core'
import { theme } from './theme'
import type { Layout } from '@planmyrack/core'

/** Every cable in the layout, including the ones the overlay cannot draw. */
export function CableSchedule({
  layout,
  onJumpToDevice,
  onDisconnect,
}: {
  layout: Layout
  onJumpToDevice?: (deviceId: string) => void
  onDisconnect?: (linkId: string) => void
}) {
  const name = (id: string) => layout.devices.find((d) => d.id === id)?.name ?? id

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Cables ({layout.links.length})</Text>
      {layout.links.length === 0 ? (
        <Text style={styles.dim}>No cables yet. Tap a port to connect it.</Text>
      ) : null}
      {layout.links.map((link) => {
        const far = otherEnd(link, link.a)
        return (
          <View key={link.id} testID={`cable-row-${link.id}`} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: link.colour }]} />
            <Pressable
              accessibilityRole="button"
              style={styles.rowText}
              onPress={() => onJumpToDevice?.(link.a.deviceId)}
            >
              <Text style={styles.text}>
                {name(link.a.deviceId)} port {link.a.port + 1} → {name(far.deviceId)} port{' '}
                {far.port + 1}
              </Text>
              <Text style={styles.meta}>
                {link.kind === 'power' ? 'power' : link.cableType}
                {link.label ? ` · ${link.label}` : ''}
              </Text>
            </Pressable>
            {onDisconnect ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Disconnect ${name(link.a.deviceId)} port ${link.a.port + 1}`}
                onPress={() => onDisconnect(link.id)}
                style={styles.remove}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            ) : null}
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  list: { backgroundColor: theme.panel },
  content: { padding: 12, gap: 8 },
  heading: { color: theme.text, fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: theme.touch },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowText: { flex: 1, justifyContent: 'center' },
  text: { color: theme.text, fontSize: 13 },
  meta: { color: theme.dim, fontSize: 11 },
  remove: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: theme.danger, fontSize: 20 },
  dim: { color: theme.dim, fontSize: 13 },
})

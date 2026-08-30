import { Modal, StyleSheet, Text, View } from 'react-native'
import { STALE_SAVE_MESSAGE } from '@planmyrack/storage'
import { Button } from './Button'
import { theme } from './theme'
import type { Layout } from '@planmyrack/core'

/**
 * Shown when the server refused a save because the layout changed elsewhere. Reload discards this
 * device's edits, so exporting them first is offered beside it rather than buried.
 */
export function ConflictDialog({
  current,
  onReload,
  onExportJson,
}: {
  current: Layout | null
  onReload: () => void
  onExportJson: () => void
}) {
  if (!current) return null

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View testID="conflict-dialog" style={styles.card}>
          <Text style={styles.title}>{STALE_SAVE_MESSAGE}</Text>
          <Text style={styles.body}>
            The server now holds “{current.name}” at revision {current.revision}. Reloading replaces
            what is on this screen.
          </Text>
          <View style={styles.actions}>
            <Button label="Export to JSON" onPress={onExportJson} />
            <Button label="Reload" tone="primary" onPress={onReload} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    maxWidth: 460,
    backgroundColor: theme.panel,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.panelEdge,
    padding: 20,
    gap: theme.gap,
  },
  title: { color: theme.text, fontSize: 16, fontWeight: '700' },
  body: { color: theme.dim, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: theme.gap, justifyContent: 'flex-end', flexWrap: 'wrap' },
})

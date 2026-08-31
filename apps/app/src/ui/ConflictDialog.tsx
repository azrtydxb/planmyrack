import { Modal, StyleSheet, Text, View } from 'react-native'
import { STALE_SAVE_MESSAGE } from '@planmyrack/storage'
import { Button } from './primitives'
import { colour, font, radius } from './theme'
import { MODAL_ORIENTATIONS } from './modal'
import type { Layout } from '@planmyrack/core'

/**
 * Shown when a save was refused because the layout changed elsewhere. Reloading discards this
 * device's edits, so exporting them first sits beside it rather than buried.
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
    <Modal visible transparent animationType="fade" supportedOrientations={MODAL_ORIENTATIONS}>
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
    backgroundColor: 'rgba(22,32,44,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    maxWidth: 460,
    backgroundColor: colour.surface,
    borderRadius: radius.card,
    padding: 20,
    gap: 12,
  },
  title: { fontFamily: font.uiBold, fontSize: 16, color: colour.text, lineHeight: 22 },
  body: { fontFamily: font.ui, fontSize: 13, color: colour.muted, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' },
})

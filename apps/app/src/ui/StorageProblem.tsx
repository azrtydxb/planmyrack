import { StyleSheet, Text, View } from 'react-native'
import { Button } from './primitives'
import { colour, font, radius } from './theme'
import type { StorageProblem as Problem } from '../storage/capabilities'

/** A storage failure the user can act on: never a silent empty screen, never a lost edit. */
export function StorageProblem({
  problem,
  onImportJson,
  onExportJson,
  onSwitchMode,
  onOpenSettings,
  onRetry,
}: {
  problem: Problem | null
  onImportJson?: () => void
  onExportJson?: () => void
  onSwitchMode?: () => void
  onOpenSettings?: () => void
  onRetry?: () => void
}) {
  if (!problem) return null

  return (
    <View testID={`storage-problem-${problem.kind}`} style={styles.card}>
      <Text style={styles.text}>{problem.detail}</Text>
      <View style={styles.actions}>
        {problem.kind === 'corrupt' && onImportJson ? (
          <Button small label="Import JSON" onPress={onImportJson} />
        ) : null}
        {problem.kind === 'full' && onExportJson ? (
          <Button small label="Export to JSON" tone="primary" onPress={onExportJson} />
        ) : null}
        {problem.kind === 'permission' && onOpenSettings ? (
          <Button small label="Open Settings" tone="primary" onPress={onOpenSettings} />
        ) : null}
        {problem.kind === 'unsupported' && onSwitchMode ? (
          <Button small label="Connect to a server" tone="primary" onPress={onSwitchMode} />
        ) : null}
        {onRetry ? <Button small label="Retry" onPress={onRetry} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
    backgroundColor: colour.dangerSoft,
    borderColor: colour.danger,
    borderWidth: 1,
    borderRadius: radius.card,
    margin: 16,
  },
  text: { fontFamily: font.ui, fontSize: 13.5, color: colour.text, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})

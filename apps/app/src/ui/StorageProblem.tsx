import { StyleSheet, Text, View } from 'react-native'
import { Button } from './Button'
import { theme } from './theme'
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
          <Button label="Import JSON" onPress={onImportJson} />
        ) : null}
        {problem.kind === 'full' && onExportJson ? (
          <Button label="Export to JSON" tone="primary" onPress={onExportJson} />
        ) : null}
        {problem.kind === 'permission' && onOpenSettings ? (
          <Button label="Open Settings" tone="primary" onPress={onOpenSettings} />
        ) : null}
        {problem.kind === 'unsupported' && onSwitchMode ? (
          <Button label="Connect to a server" tone="primary" onPress={onSwitchMode} />
        ) : null}
        {onRetry ? <Button label="Retry" onPress={onRetry} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: theme.gap,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: theme.danger,
    borderWidth: 1,
    borderRadius: theme.radius,
    margin: 16,
  },
  text: { color: theme.text, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: theme.gap, flexWrap: 'wrap' },
})

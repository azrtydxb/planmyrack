import { StyleSheet, Text, View } from 'react-native'
import { Button } from './Button'
import { theme } from './theme'

/** The store is unreachable. The layout stays readable; nothing pretends a save succeeded. */
export function OfflineBanner({
  message,
  onRetry,
  onSwitchToLocal,
}: {
  message: string | null
  onRetry?: () => void
  onSwitchToLocal?: () => void
}) {
  if (!message) return null

  return (
    <View testID="offline-banner" style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.actions}>
        {onRetry ? <Button label="Retry" onPress={onRetry} /> : null}
        {onSwitchToLocal ? <Button label="Switch to local mode" onPress={onSwitchToLocal} /> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    padding: 12,
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderBottomColor: theme.danger,
    borderBottomWidth: 1,
  },
  text: { color: theme.text, fontSize: 13 },
  actions: { flexDirection: 'row', gap: theme.gap, flexWrap: 'wrap' },
})

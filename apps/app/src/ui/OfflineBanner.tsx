import { StyleSheet, Text, View } from 'react-native'
import { Button } from './primitives'
import { colour, font, radius } from './theme'

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
        {onRetry ? <Button small label="Retry" onPress={onRetry} /> : null}
        {onSwitchToLocal ? (
          <Button small label="Switch to local mode" onPress={onSwitchToLocal} />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    padding: 12,
    gap: 8,
    backgroundColor: colour.dangerSoft,
    borderBottomColor: colour.danger,
    borderBottomWidth: 1,
    borderRadius: radius.button,
    margin: 12,
  },
  text: { fontFamily: font.ui, fontSize: 12.5, color: colour.text },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})

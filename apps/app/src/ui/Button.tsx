import { Pressable, StyleSheet, Text } from 'react-native'
import { theme } from './theme'

export function Button({
  label,
  onPress,
  tone = 'default',
  disabled,
}: {
  label: string
  onPress: () => void
  tone?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}) {
  const background =
    tone === 'primary' ? theme.accent : tone === 'danger' ? theme.danger : theme.panel
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: theme.touch,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.panelEdge,
  },
  label: { color: theme.text, fontSize: 15, fontWeight: '600' },
})

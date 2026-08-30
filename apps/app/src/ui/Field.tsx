import { StyleSheet, Text, TextInput, View } from 'react-native'
import { theme } from './theme'

export function TextField({
  label,
  value,
  onChange,
  keyboardType,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  keyboardType?: 'default' | 'numeric'
  placeholder?: string
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType ?? 'default'}
        placeholder={placeholder}
        placeholderTextColor={theme.dim}
        style={styles.input}
      />
    </View>
  )
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <TextField
      label={label}
      value={String(value)}
      keyboardType="numeric"
      onChange={(text) => {
        const parsed = Number(text.replace(/[^\d.]/g, ''))
        onChange(Number.isFinite(parsed) ? parsed : 0)
      }}
    />
  )
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: theme.dim, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  input: {
    minHeight: theme.touch,
    borderColor: theme.panelEdge,
    borderWidth: 1,
    borderRadius: theme.radius,
    paddingHorizontal: 12,
    color: theme.text,
    backgroundColor: theme.bg,
  },
})

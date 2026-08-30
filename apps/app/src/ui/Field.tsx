import { StyleSheet, Text, TextInput, View } from 'react-native'
import { TOUCH, colour, font, radius } from './theme'

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
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType ?? 'default'}
        placeholder={placeholder}
        placeholderTextColor={colour.icon}
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
  field: { gap: 5, flex: 1, minWidth: 96 },
  label: {
    fontFamily: font.monoBold,
    fontSize: 6.5,
    letterSpacing: 0.6,
    color: colour.icon,
  },
  input: {
    minHeight: TOUCH,
    borderColor: colour.borderInput,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    color: colour.text,
    backgroundColor: colour.surface,
    fontFamily: font.ui,
    fontSize: 14,
  },
})

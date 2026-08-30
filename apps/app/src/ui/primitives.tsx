import { Pressable, StyleSheet, Text, View } from 'react-native'
import { TOUCH, colour, font, radius } from './theme'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

/** Mono label: uppercase, tracked, muted — the design uses it for every meta line and number. */
export function Mono({
  children,
  size = 8.5,
  tone = colour.muted,
  weight = 'bold',
  style,
  testID,
}: {
  children: ReactNode
  size?: number
  tone?: string
  weight?: 'medium' | 'bold' | 'heavy'
  style?: StyleProp<ViewStyle>
  testID?: string
}) {
  const family = weight === 'heavy' ? font.monoHeavy : weight === 'bold' ? font.monoBold : font.mono
  return (
    <Text
      testID={testID}
      style={[
        { fontFamily: family, fontSize: size, color: tone, letterSpacing: size * 0.06 },
        style as never,
      ]}
    >
      {children}
    </Text>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <View accessibilityLabel={label} style={styles.segTrack}>
      {options.map((option) => {
        const on = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.seg, on && styles.segOn]}
          >
            <Text style={[styles.segText, on && styles.segTextOn]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggle, { backgroundColor: value ? colour.accent : colour.borderInput }]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  )
}

/** 34pt white rounded square with a glyph — undo, redo, more. */
export function IconButton({
  glyph,
  label,
  onPress,
  disabled,
  tone = colour.textSecondary,
}: {
  glyph: string
  label: string
  onPress?: () => void
  disabled?: boolean
  tone?: string
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={styles.iconButton}
    >
      <Text style={{ fontSize: 15, color: disabled ? colour.borderInput : tone }}>{glyph}</Text>
    </Pressable>
  )
}

export function Button({
  label,
  onPress,
  tone = 'default',
  disabled,
  small,
}: {
  label: string
  onPress: () => void
  tone?: 'default' | 'primary' | 'soft' | 'danger'
  disabled?: boolean
  small?: boolean
}) {
  const palette = {
    default: { bg: colour.surface, fg: colour.text, bd: colour.border },
    primary: { bg: colour.accent, fg: '#fff', bd: colour.accent },
    soft: { bg: colour.accentSoft, fg: colour.accent, bd: 'transparent' },
    danger: { bg: colour.dangerSoft, fg: colour.danger, bd: 'transparent' },
  }[tone]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        {
          backgroundColor: palette.bg,
          borderColor: palette.bd,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  )
}

/** Bordered figure box: a big value over a mono caption. */
export function StatTile({
  value,
  caption,
  testID,
}: {
  value: string
  caption: string
  testID?: string
}) {
  return (
    <View testID={testID} style={styles.stat}>
      <Mono size={6.5} tone={colour.icon} weight="bold">
        {caption.toUpperCase()}
      </Mono>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  segTrack: {
    flexDirection: 'row',
    backgroundColor: colour.sunken,
    borderRadius: radius.control,
    padding: 2,
  },
  seg: {
    minHeight: 30,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: { backgroundColor: colour.surface },
  segText: { fontFamily: font.ui, fontSize: 11, color: colour.muted },
  segTextOn: { fontFamily: font.uiBold, color: colour.text },
  toggle: { width: 34, height: 20, borderRadius: 10, justifyContent: 'center', padding: 2 },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.button,
    backgroundColor: colour.surface,
    borderWidth: 1,
    borderColor: colour.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: TOUCH,
    paddingHorizontal: 16,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: { minHeight: 34, paddingHorizontal: 12 },
  buttonText: { fontFamily: font.uiBold, fontSize: 12.5 },
  stat: {
    flex: 1,
    minWidth: 64,
    gap: 3,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.borderSoft,
    backgroundColor: colour.surface,
  },
  statValue: { fontFamily: font.uiBold, fontSize: 16, color: colour.text },
  card: {
    backgroundColor: colour.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colour.borderSoft,
  },
})

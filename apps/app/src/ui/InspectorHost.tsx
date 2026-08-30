import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { Inspector } from './Inspector'
import { useBreakpoint } from './useBreakpoint'
import { colour, font } from './theme'
import type { ComponentProps, ReactNode } from 'react'

type InspectorProps = ComponentProps<typeof Inspector>

/** A side panel takes a share of a small landscape screen rather than a fixed 330pt of it. */
export const panelWidth = (screenWidth: number): number =>
  Math.max(240, Math.min(330, Math.round(screenWidth * 0.4)))

/** Same inspector, two shapes: a sheet on phones, a side panel on tablet and desktop. */
export function InspectorHost({
  visible,
  onClose,
  footer,
  ...inspector
}: InspectorProps & { visible: boolean; onClose: () => void; footer?: ReactNode }) {
  const breakpoint = useBreakpoint()
  const { width } = useWindowDimensions()

  if (breakpoint === 'phone') {
    return (
      <BottomSheet title={inspector.device.name} visible={visible} onClose={onClose}>
        <Inspector {...inspector} />
      </BottomSheet>
    )
  }

  if (!visible) return null

  return (
    <View testID="inspector-panel" style={[styles.panel, { width: panelWidth(width) }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {inspector.device.name}
        </Text>
        <Inspector {...inspector} />
        {footer}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colour.surface,
    borderLeftColor: colour.borderSoft,
    borderLeftWidth: 1,
  },
  body: { padding: 18, gap: 12 },
  title: { fontFamily: font.uiBold, fontSize: 19, color: colour.text },
})

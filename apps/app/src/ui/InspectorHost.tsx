import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { Inspector } from './Inspector'
import { useBreakpoint } from './useBreakpoint'
import { colour, font } from './theme'
import type { ComponentProps, ReactNode } from 'react'

type InspectorProps = ComponentProps<typeof Inspector>

/** Same inspector, two shapes: a sheet on phones, a side panel on tablet and desktop. */
export function InspectorHost({
  visible,
  onClose,
  footer,
  ...inspector
}: InspectorProps & { visible: boolean; onClose: () => void; footer?: ReactNode }) {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'phone') {
    return (
      <BottomSheet title={inspector.device.name} visible={visible} onClose={onClose}>
        <Inspector {...inspector} />
      </BottomSheet>
    )
  }

  if (!visible) return null

  return (
    <View testID="inspector-panel" style={styles.panel}>
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
    width: 330,
    backgroundColor: colour.surface,
    borderLeftColor: colour.borderSoft,
    borderLeftWidth: 1,
  },
  body: { padding: 18, gap: 12 },
  title: { fontFamily: font.uiBold, fontSize: 19, color: colour.text },
})

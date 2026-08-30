import { StyleSheet, Text, View } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { Inspector } from './Inspector'
import { useBreakpoint } from './useBreakpoint'
import { theme } from './theme'
import type { ComponentProps } from 'react'

type InspectorProps = ComponentProps<typeof Inspector>

/** Same inspector, two shapes: a sheet on phones, a side panel on anything wider. */
export function InspectorHost({
  visible,
  onClose,
  ...inspector
}: InspectorProps & { visible: boolean; onClose: () => void }) {
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
      <Text style={styles.title} numberOfLines={1}>
        {inspector.device.name}
      </Text>
      <Inspector {...inspector} />
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    width: 340,
    padding: 16,
    backgroundColor: theme.panel,
    borderLeftColor: theme.panelEdge,
    borderLeftWidth: 1,
  },
  title: { color: theme.text, fontSize: 17, fontWeight: '700', marginBottom: 12 },
})

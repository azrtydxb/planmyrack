import { ScrollView, StyleSheet, View } from 'react-native'
import { RackFrame } from './RackFrame'
import { theme } from '../ui/theme'
import type { Device, Face, Layout } from '@planmyrack/core'

export function RackCanvas({
  layout,
  face,
  selectedId,
  dropHint,
  onSelect,
  onPortPress,
  onDeviceLongPress,
}: {
  layout: Layout
  face: Face
  selectedId?: string | null
  dropHint?: { rackId: string; posU: number; heightU: number; valid: boolean } | null
  onSelect?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onDeviceLongPress?: (device: Device) => void
}) {
  return (
    <ScrollView
      testID="canvas-scroll"
      horizontal
      contentContainerStyle={styles.content}
      style={styles.canvas}
    >
      <View testID="canvas-content" style={styles.row}>
        {layout.racks.map((rack) => (
          <RackFrame
            key={rack.id}
            rack={rack}
            layout={layout}
            face={face}
            devices={layout.devices.filter((d) => d.rackId === rack.id && d.face === face)}
            selectedId={selectedId}
            dropHint={dropHint?.rackId === rack.id ? dropHint : null}
            onSelect={onSelect}
            onPortPress={onPortPress}
            onDeviceLongPress={onDeviceLongPress}
          />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  canvas: { backgroundColor: theme.bg },
  content: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
})

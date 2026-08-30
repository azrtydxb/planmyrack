import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { theme } from './theme'
import type { ReactNode } from 'react'

/** Phone-shaped inspector: a sheet over the canvas, dismissed by tapping outside or the X. */
export function BottomSheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string
  visible: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View testID="inspector-sheet" style={styles.sheet}>
        <View style={styles.head}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close inspector"
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '70%',
    backgroundColor: theme.panel,
    borderTopColor: theme.panelEdge,
    borderTopWidth: 1,
    paddingBottom: 24,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { color: theme.text, fontSize: 17, fontWeight: '700', flexShrink: 1 },
  close: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: theme.text, fontSize: 24, lineHeight: 26 },
  body: { padding: 16, gap: theme.gap },
})

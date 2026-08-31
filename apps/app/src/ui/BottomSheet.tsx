import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { TOUCH, colour, font, radius } from './theme'
import { MODAL_ORIENTATIONS } from './modal'
import type { ReactNode } from 'react'

/** Phone-shaped panel: a sheet over the canvas with a grab handle, dismissed by tapping outside. */
export function BottomSheet({
  title,
  subtitle,
  visible,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  visible: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      supportedOrientations={MODAL_ORIENTATIONS}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View testID="inspector-sheet" style={styles.sheet}>
        <View style={styles.grab} />
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close inspector"
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeGlyph}>×</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(22,32,44,0.35)' },
  sheet: {
    maxHeight: '72%',
    backgroundColor: colour.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingBottom: 24,
  },
  grab: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colour.borderInput,
    marginTop: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headText: { flex: 1, gap: 2 },
  title: { fontFamily: font.uiBold, fontSize: 17, color: colour.text },
  subtitle: { fontFamily: font.mono, fontSize: 8.5, letterSpacing: 0.5, color: colour.muted },
  close: {
    width: TOUCH,
    height: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TOUCH / 2,
    backgroundColor: colour.sunkenSoft,
  },
  closeGlyph: { fontSize: 20, color: colour.textSecondary, lineHeight: 22 },
  body: { paddingHorizontal: 20, gap: 14 },
})

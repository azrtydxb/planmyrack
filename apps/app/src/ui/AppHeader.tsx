import { StyleSheet, Text, View } from 'react-native'
import { IconButton, Mono, Segmented, Toggle } from './primitives'
import { colour, font } from './theme'
import type { Face } from '@planmyrack/core'
import type { SaveState } from '../state/useLayoutEditor'

const STATE_TEXT: Record<SaveState, string> = {
  idle: 'AUTOSAVED',
  saving: 'SAVING…',
  error: 'NOT SAVED',
}

/** Layout identity and the controls that act on the whole canvas. */
export function AppHeader({
  name,
  mode,
  revision,
  saving,
  face,
  onFaceChange,
  showCables,
  onShowCablesChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onMore,
}: {
  name: string
  mode: string
  revision: number
  saving: SaveState
  face: Face
  onFaceChange: (face: Face) => void
  showCables: boolean
  onShowCablesChange: (value: boolean) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onMore?: () => void
}) {
  const dot =
    saving === 'error' ? colour.danger : saving === 'saving' ? colour.orange : colour.green

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: dot }]} />
            <Mono size={8.5} tone={colour.muted}>
              {`${mode.toUpperCase()} · ${STATE_TEXT[saving]} · REV ${revision}`}
            </Mono>
          </View>
        </View>
        <IconButton glyph="⟲" label="Undo" onPress={onUndo} disabled={!canUndo} />
        <IconButton glyph="⟳" label="Redo" onPress={onRedo} disabled={!canRedo} />
        <IconButton glyph="⋯" label="More" onPress={onMore} />
      </View>

      <View style={styles.controlRow}>
        <Segmented
          label="Rack face"
          value={face}
          onChange={onFaceChange}
          options={[
            { value: 'front', label: 'Front' },
            { value: 'rear', label: 'Rear' },
          ]}
        />
        <View style={styles.spacer} />
        <Text style={styles.cablesLabel}>Cables</Text>
        <Toggle label="Show cables" value={showCables} onChange={onShowCablesChange} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { backgroundColor: colour.appBg, paddingTop: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  identity: { flex: 1, minWidth: 0 },
  name: { fontFamily: font.uiBold, fontSize: 17, color: colour.text, letterSpacing: -0.2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  spacer: { flex: 1 },
  cablesLabel: { fontFamily: font.ui, fontSize: 11, color: colour.textSecondary },
})

import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { BrandMark } from './BrandMark'
import { Button, IconButton, Mono, Segmented, Toggle } from './primitives'
import { useBreakpoint } from './useBreakpoint'
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
  onExport,
  onRename,
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
  onExport?: () => void
  /** Renames the layout in place; the name is a label, nothing keys off it. */
  onRename?: (name: string) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const save = () => {
    const next = (draft ?? '').trim()
    if (next.length > 0) onRename?.(next)
    setDraft(null)
  }
  // 3a puts the whole console on one line; a phone has no room for it and keeps two.
  const oneRow = useBreakpoint() !== 'phone'
  const dot =
    saving === 'error' ? colour.danger : saving === 'saving' ? colour.orange : colour.green

  const identity = (
    <>
      <BrandMark />
      <View style={styles.identity}>
        {draft === null ? (
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.name}>
              {name}
            </Text>
            {onRename ? (
              <Button small label="Rename layout" onPress={() => setDraft(name)} />
            ) : null}
          </View>
        ) : (
          <View style={styles.nameRow}>
            <TextInput
              accessibilityLabel="Layout name"
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => save()}
              style={styles.nameInput}
            />
            <Button small tone="primary" label="Save" onPress={() => save()} />
            <Button small label="Cancel" onPress={() => setDraft(null)} />
          </View>
        )}
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <Mono size={8.5} tone={colour.muted}>
            {`${mode.toUpperCase()} · ${STATE_TEXT[saving]} · REV ${revision}`}
          </Mono>
        </View>
      </View>
    </>
  )

  const faceSwitch = (
    <Segmented
      label="Rack face"
      value={face}
      onChange={onFaceChange}
      options={[
        { value: 'front', label: 'Front' },
        { value: 'rear', label: 'Rear' },
      ]}
    />
  )

  const cables = (
    <>
      <Text style={styles.cablesLabel}>Cables</Text>
      <Toggle label="Show cables" value={showCables} onChange={onShowCablesChange} />
    </>
  )

  const historyButtons = (
    <>
      <IconButton glyph="⟲" label="Undo" onPress={onUndo} disabled={!canUndo} />
      <IconButton glyph="⟳" label="Redo" onPress={onRedo} disabled={!canRedo} />
      <IconButton glyph="⋯" label="More" onPress={onMore} />
    </>
  )

  if (oneRow) {
    return (
      <View style={styles.header}>
        <View style={styles.topRow}>
          {identity}
          {faceSwitch}
          {cables}
          {historyButtons}
          {onExport ? <Button small label="Export" tone="primary" onPress={onExport} /> : null}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {identity}
        {historyButtons}
      </View>

      <View style={styles.controlRow}>
        {faceSwitch}
        <View style={styles.spacer} />
        {cables}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { backgroundColor: colour.appBg, paddingTop: 8 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
  },
  identity: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    flex: 1,
    minWidth: 120,
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colour.borderInput,
    backgroundColor: colour.surface,
    fontFamily: font.uiBold,
    fontSize: 16,
    color: colour.text,
  },
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

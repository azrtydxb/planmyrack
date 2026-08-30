import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { exportJson, importJson, newLayout } from '@planmyrack/core'
import { BrandMark } from '../ui/BrandMark'
import { Button, Card, Mono } from '../ui/primitives'
import { TOUCH, colour, font, radius } from '../ui/theme'
import type { LayoutStore, LayoutSummary } from '@planmyrack/storage'

const when = (iso: string): string => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
}

export function LayoutsScreen({
  store,
  onOpen,
  onOpenSettings,
  onExport,
  pickJson,
}: {
  store: LayoutStore | null
  onOpen?: (id: string) => void
  onOpenSettings?: () => void
  onExport?: (filename: string, text: string) => void
  /** Supplied by the caller so the file picker stays out of this screen's tests. */
  pickJson?: () => Promise<string | null>
}) {
  // Nothing above this screen pads for the status bar since the navigator header is hidden.
  const insets = useSafeAreaInsets()
  const [rows, setRows] = useState<LayoutSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; draft: string } | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!store) return
    try {
      setRows(await store.list())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [store])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = async () => {
    if (!store) return
    const made = await store.create(newLayout('Untitled layout'))
    await refresh()
    onOpen?.(made.id!)
  }

  const importLayout = async (text: string) => {
    if (!store) return
    try {
      const imported = importJson(text)
      await store.create(imported)
      setImportError(null)
      await refresh()
    } catch (err) {
      // A refused import must leave the library exactly as it was.
      setImportError((err as Error).message)
    }
  }

  const rename = async (id: string, name: string) => {
    if (!store) return
    const trimmed = name.trim()
    // An empty name would leave a row with nothing to click on; keep the old one instead.
    if (trimmed.length > 0) await store.update({ ...(await store.get(id)), name: trimmed })
    setRenaming(null)
    await refresh()
  }

  const duplicate = async (id: string) => {
    if (!store) return
    const doc = await store.get(id)
    await store.create({ ...doc, id: null, revision: 0, name: `${doc.name} copy` })
    await refresh()
  }

  const destroy = async (id: string) => {
    if (!store) return
    await store.remove(id)
    setConfirmingDelete(null)
    await refresh()
  }

  const exportLayout = async (id: string) => {
    if (!store || !onExport) return
    const layout = await store.get(id)
    onExport(`${layout.name.replace(/[^\w.-]+/g, '-')}.json`, exportJson(layout))
  }

  return (
    <View style={styles.page}>
      <View style={[styles.head, { paddingTop: 16 + insets.top }]}>
        <BrandMark />
        <View style={styles.headText}>
          <Text style={styles.title}>Layouts</Text>
          <Mono size={8.5}>{`${rows.length} SAVED`}</Mono>
        </View>
        {onOpenSettings ? <Button small label="Settings" onPress={onOpenSettings} /> : null}
      </View>

      <View style={styles.toolbar}>
        <Button label="New layout" tone="primary" onPress={() => void create()} />
        {pickJson ? (
          <Button
            label="Import JSON"
            onPress={() => void pickJson().then((text) => (text ? importLayout(text) : undefined))}
          />
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {importError ? (
        <Text testID="import-error" style={styles.error}>
          {importError}
        </Text>
      ) : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={rows}
        keyExtractor={(row) => row.id}
        ListEmptyComponent={
          error ? null : <Text style={styles.empty}>No layouts yet. Start with a new one.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            {renaming?.id === item.id ? (
              <View style={styles.renameRow}>
                <TextInput
                  accessibilityLabel="Layout name"
                  autoFocus
                  value={renaming.draft}
                  onChangeText={(draft) => setRenaming({ id: item.id, draft })}
                  onSubmitEditing={() => void rename(item.id, renaming.draft)}
                  style={styles.renameInput}
                />
                <Button
                  small
                  tone="primary"
                  label="Save"
                  onPress={() => void rename(item.id, renaming.draft)}
                />
                <Button small label="Cancel" onPress={() => setRenaming(null)} />
              </View>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  testID={`layout-row-${item.id}`}
                  onPress={() => onOpen?.(item.id)}
                  style={styles.rowMain}
                >
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Mono size={7.5} tone={colour.muted} weight="medium">
                    {`REV ${item.revision} · UPDATED ${when(item.updatedAt).toUpperCase()}`}
                  </Mono>
                </Pressable>
                <View style={styles.rowActions}>
                  <Button
                    small
                    label="Rename"
                    onPress={() => setRenaming({ id: item.id, draft: item.name })}
                  />
                  <Button small label="Duplicate" onPress={() => void duplicate(item.id)} />
                  {onExport ? (
                    <Button small label="Export JSON" onPress={() => void exportLayout(item.id)} />
                  ) : null}
                  {confirmingDelete === item.id ? (
                    <>
                      <Button
                        small
                        tone="danger"
                        label="Delete for good"
                        onPress={() => void destroy(item.id)}
                      />
                      <Button small label="Keep" onPress={() => setConfirmingDelete(null)} />
                    </>
                  ) : (
                    <Button
                      small
                      tone="danger"
                      label="Delete"
                      onPress={() => setConfirmingDelete(item.id)}
                    />
                  )}
                </View>
              </>
            )}
          </Card>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colour.appBg },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 6 },
  headText: { flex: 1, gap: 3 },
  title: { fontFamily: font.uiBold, fontSize: 22, color: colour.text },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: { padding: 16, paddingTop: 4, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.card,
    flexWrap: 'wrap',
  },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  renameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  renameInput: {
    flex: 1,
    minWidth: 120,
    minHeight: TOUCH - 8,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.border,
    backgroundColor: colour.surface,
    fontFamily: font.ui,
    fontSize: 15,
    color: colour.text,
  },
  rowMain: { flex: 1, gap: 3, minHeight: TOUCH - 12, justifyContent: 'center' },
  rowName: { fontFamily: font.uiBold, fontSize: 15, color: colour.text },
  empty: { fontFamily: font.ui, fontSize: 13, color: colour.muted, padding: 8 },
  error: { fontFamily: font.ui, fontSize: 12.5, color: colour.danger, paddingHorizontal: 16 },
})

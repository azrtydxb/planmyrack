import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
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
  const [rows, setRows] = useState<LayoutSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

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

  const exportLayout = async (id: string) => {
    if (!store || !onExport) return
    const layout = await store.get(id)
    onExport(`${layout.name.replace(/[^\w.-]+/g, '-')}.json`, exportJson(layout))
  }

  return (
    <View style={styles.page}>
      <View style={styles.head}>
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
            {onExport ? (
              <Button small label="Export JSON" onPress={() => void exportLayout(item.id)} />
            ) : null}
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
  },
  rowMain: { flex: 1, gap: 3, minHeight: TOUCH - 12, justifyContent: 'center' },
  rowName: { fontFamily: font.uiBold, fontSize: 15, color: colour.text },
  empty: { fontFamily: font.ui, fontSize: 13, color: colour.muted, padding: 8 },
  error: { fontFamily: font.ui, fontSize: 12.5, color: colour.danger, paddingHorizontal: 16 },
})

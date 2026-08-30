import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { exportJson, importJson, newLayout } from '@planmyrack/core'
import { Button } from '../ui/Button'
import { theme } from '../ui/theme'
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
      <View style={styles.toolbar}>
        <Button label="New layout" tone="primary" onPress={() => void create()} />
        {pickJson ? (
          <Button
            label="Import JSON"
            onPress={() => void pickJson().then((text) => (text ? importLayout(text) : undefined))}
          />
        ) : null}
        {onOpenSettings ? <Button label="Settings" onPress={onOpenSettings} /> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {importError ? (
        <Text testID="import-error" style={styles.error}>
          {importError}
        </Text>
      ) : null}

      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        ListEmptyComponent={
          error ? null : <Text style={styles.empty}>No layouts yet. Start with a new one.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            testID={`layout-row-${item.id}`}
            onPress={() => onOpen?.(item.id)}
            style={styles.row}
          >
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowMeta}>Updated {when(item.updatedAt)}</Text>
            {onExport ? (
              <Button label="Export JSON" onPress={() => void exportLayout(item.id)} />
            ) : null}
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.bg, padding: 16, gap: theme.gap },
  toolbar: { flexDirection: 'row', gap: theme.gap, flexWrap: 'wrap' },
  row: {
    minHeight: theme.touch + 12,
    justifyContent: 'center',
    padding: 14,
    marginBottom: 10,
    backgroundColor: theme.panel,
    borderColor: theme.panelEdge,
    borderWidth: 1,
    borderRadius: theme.radius,
  },
  rowName: { color: theme.text, fontSize: 16, fontWeight: '600' },
  rowMeta: { color: theme.dim, fontSize: 12, marginTop: 4 },
  empty: { color: theme.dim, padding: 12 },
  error: { color: theme.danger, padding: 12 },
})

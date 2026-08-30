import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { probeServer } from '@planmyrack/storage'
import { Button } from '../ui/Button'
import { theme } from '../ui/theme'
import { describeMode } from '../storage/settings'
import type { LayoutStore, LayoutSummary } from '@planmyrack/storage'
import type { Mode } from '../storage/settings'

export function SettingsScreen({
  mode,
  store,
  onSetMode,
  storeForPreview,
}: {
  mode: Mode | null
  store: LayoutStore | null
  onSetMode: (mode: Mode) => void | Promise<void>
  /** Lets the screen list what a mode holds without the whole app switching first. */
  storeForPreview?: (mode: Mode) => LayoutStore
}) {
  const [active, setActive] = useState<Mode | null>(mode)
  const [url, setUrl] = useState(mode?.kind === 'server' ? mode.url : '')
  const [probe, setProbe] = useState<{ ok: boolean; message: string } | null>(null)
  const [summaries, setSummaries] = useState<LayoutSummary[]>([])
  const [listError, setListError] = useState<string | null>(null)

  const current = active ?? mode
  const activeStore = current && storeForPreview ? storeForPreview(current) : store

  useEffect(() => {
    let cancelled = false
    if (!activeStore) return
    setListError(null)
    activeStore
      .list()
      .then((rows) => !cancelled && setSummaries(rows))
      .catch((err: Error) => !cancelled && setListError(err.message))
    return () => {
      cancelled = true
    }
  }, [activeStore])

  const switchTo = async (next: Mode) => {
    setActive(next)
    await onSetMode(next)
  }

  const test = async () => {
    const result = await probeServer(url)
    setProbe({
      ok: result.ok,
      message: result.ok
        ? `Connected to PlanMyRack ${result.version ?? ''}`.trim()
        : `Can't reach the server. ${result.reason ?? ''}`.trim(),
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Where layouts live</Text>
        <Text testID="active-mode" style={styles.body}>
          {describeMode(current)}
        </Text>
        <Button label="Work on this device only" onPress={() => void switchTo({ kind: 'local' })} />
        <TextInput
          accessibilityLabel="Server address"
          placeholder="http://192.168.1.20:8787"
          placeholderTextColor={theme.dim}
          autoCapitalize="none"
          autoCorrect={false}
          value={url}
          onChangeText={setUrl}
          style={styles.input}
        />
        <View style={styles.row}>
          <Button label="Test connection" onPress={() => void test()} disabled={!url} />
          <Button
            label="Use this server"
            tone="primary"
            disabled={!url}
            onPress={() => void switchTo({ kind: 'server', url })}
          />
        </View>
        {probe ? (
          <Text style={[styles.body, { color: probe.ok ? theme.ok : theme.danger }]}>
            {probe.message}
          </Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Layouts in this store</Text>
        {listError ? <Text style={[styles.body, { color: theme.danger }]}>{listError}</Text> : null}
        {summaries.length === 0 && !listError ? (
          <Text style={styles.body}>Nothing saved here yet.</Text>
        ) : null}
        {summaries.map((summary) => (
          <Text key={summary.id} style={styles.body}>
            {summary.name}
          </Text>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: theme.gap, backgroundColor: theme.bg, flexGrow: 1 },
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  body: { color: theme.dim, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: theme.panel,
    borderColor: theme.panelEdge,
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: 16,
    gap: theme.gap,
  },
  cardTitle: { color: theme.text, fontSize: 17, fontWeight: '600' },
  input: {
    minHeight: theme.touch,
    borderColor: theme.panelEdge,
    borderWidth: 1,
    borderRadius: theme.radius,
    paddingHorizontal: 12,
    color: theme.text,
  },
  row: { flexDirection: 'row', gap: theme.gap, flexWrap: 'wrap' },
})

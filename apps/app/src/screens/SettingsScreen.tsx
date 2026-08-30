import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { probeServer } from '@planmyrack/storage'
import { Button, Card, Mono } from '../ui/primitives'
import { TOUCH, colour, font, radius } from '../ui/theme'
import { describeMode } from '../storage/settings'
import { lastServerStatus } from '../storage/capabilities'
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
  storeForPreview?: (mode: Mode) => LayoutStore
}) {
  const [active, setActive] = useState<Mode | null>(mode)
  const [url, setUrl] = useState(mode?.kind === 'server' ? mode.url : '')
  const [probe, setProbe] = useState<{ ok: boolean; message: string } | null>(null)
  const [summaries, setSummaries] = useState<LayoutSummary[]>([])
  const [listError, setListError] = useState<string | null>(null)

  const current = active ?? mode
  const activeStore = current && storeForPreview ? storeForPreview(current) : store
  const diagnostics = lastServerStatus()

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

      <Card style={styles.card}>
        <Mono size={7.5} tone={colour.icon}>
          WHERE LAYOUTS LIVE
        </Mono>
        <Text testID="active-mode" style={styles.value}>
          {describeMode(current)}
        </Text>
        <Button label="Work on this device only" onPress={() => void switchTo({ kind: 'local' })} />
        <TextInput
          accessibilityLabel="Server address"
          placeholder="http://192.168.1.20:8787"
          placeholderTextColor={colour.icon}
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
          <Text style={[styles.body, { color: probe.ok ? colour.green : colour.danger }]}>
            {probe.message}
          </Text>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Mono size={7.5} tone={colour.icon}>
          LAYOUTS IN THIS STORE
        </Mono>
        {listError ? (
          <Text style={[styles.body, { color: colour.danger }]}>{listError}</Text>
        ) : null}
        {summaries.length === 0 && !listError ? (
          <Text style={styles.body}>Nothing saved here yet.</Text>
        ) : null}
        {summaries.map((summary) => (
          <Text key={summary.id} style={styles.value}>
            {summary.name}
          </Text>
        ))}
      </Card>

      {diagnostics ? (
        <Card style={styles.card}>
          <Mono size={7.5} tone={colour.icon}>
            SERVER DIAGNOSTICS
          </Mono>
          <Mono size={9} tone={colour.textSecondary} testID="server-diagnostics">
            {`${diagnostics.url} · ${diagnostics.status ?? 'no answer'} · ${diagnostics.at}`}
          </Mono>
        </Card>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, backgroundColor: colour.appBg, flexGrow: 1 },
  title: { fontFamily: font.uiBold, fontSize: 22, color: colour.text },
  card: { padding: 16, gap: 10 },
  body: { fontFamily: font.ui, fontSize: 13, color: colour.muted, lineHeight: 19 },
  value: { fontFamily: font.ui, fontSize: 13.5, color: colour.text },
  input: {
    minHeight: TOUCH,
    borderColor: colour.borderInput,
    borderWidth: 1,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    color: colour.text,
    fontFamily: font.mono,
    fontSize: 12.5,
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})

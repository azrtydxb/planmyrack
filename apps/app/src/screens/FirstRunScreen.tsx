import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { probeServer } from '@planmyrack/storage'
import { Button } from '../ui/Button'
import { theme } from '../ui/theme'
import type { Mode } from '../storage/settings'

export function FirstRunScreen({ onChoose }: { onChoose: (mode: Mode) => void | Promise<void> }) {
  const [url, setUrl] = useState('')
  const [probing, setProbing] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const test = async () => {
    setProbing(true)
    setResult(null)
    const probe = await probeServer(url)
    setProbing(false)
    setResult({
      ok: probe.ok,
      message: probe.ok
        ? `Connected to PlanMyRack ${probe.version ?? ''}`.trim()
        : `Can't reach the server. ${probe.reason ?? ''}`.trim(),
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Where should your layouts live?</Text>
      <Text style={styles.body}>
        You can change this later in Settings. The two stores are separate — moving a layout between
        them means exporting and importing JSON.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Work on this device only</Text>
        <Text style={styles.body}>
          Layouts are stored on this device. No server, no network, works offline.
        </Text>
        <Button
          label="Work on this device only"
          tone="primary"
          onPress={() => void onChoose({ kind: 'local' })}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connect to a server</Text>
        <Text style={styles.body}>
          Several devices share the layouts held by a PlanMyRack server on your network.
        </Text>
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
          <Button
            label={probing ? 'Testing…' : 'Test connection'}
            onPress={() => void test()}
            disabled={!url || probing}
          />
          <Button
            label="Use this server"
            tone="primary"
            disabled={!result?.ok}
            onPress={() => void onChoose({ kind: 'server', url })}
          />
        </View>
        {result ? (
          <Text style={[styles.result, { color: result.ok ? theme.ok : theme.danger }]}>
            {result.message}
          </Text>
        ) : null}
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
  result: { fontSize: 14 },
})

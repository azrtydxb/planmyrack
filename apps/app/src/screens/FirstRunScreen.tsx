import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { probeServer } from '@planmyrack/storage'
import { BrandMark } from '../ui/BrandMark'
import { Button, Card, Mono } from '../ui/primitives'
import { TOUCH, colour, font, radius } from '../ui/theme'
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
      <View style={styles.brandRow}>
        <BrandMark size={44} />
        <Text style={styles.brandName}>PlanMyRack</Text>
      </View>
      <Text style={styles.title}>Where should your layouts live?</Text>
      <Text style={styles.body}>
        You can change this later in Settings. The two stores are separate — moving a layout between
        them means exporting and importing JSON.
      </Text>

      <Card style={styles.card}>
        <Mono size={7.5} tone={colour.icon}>
          ON THIS DEVICE
        </Mono>
        <Text style={styles.cardTitle}>Work on this device only</Text>
        <Text style={styles.body}>
          Layouts are stored on this device. No server, no network, works offline.
        </Text>
        <Button
          label="Work on this device only"
          tone="primary"
          onPress={() => void onChoose({ kind: 'local' })}
        />
      </Card>

      <Card style={styles.card}>
        <Mono size={7.5} tone={colour.icon}>
          SHARED
        </Mono>
        <Text style={styles.cardTitle}>Connect to a server</Text>
        <Text style={styles.body}>
          Several devices share the layouts held by a PlanMyRack server on your network.
        </Text>
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
          <Text style={[styles.result, { color: result.ok ? colour.green : colour.danger }]}>
            {result.message}
          </Text>
        ) : null}
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 14, backgroundColor: colour.appBg, flexGrow: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  brandName: { fontFamily: font.uiBold, fontSize: 20, color: colour.text },
  title: { fontFamily: font.uiBold, fontSize: 22, color: colour.text },
  body: { fontFamily: font.ui, fontSize: 13, lineHeight: 19, color: colour.muted },
  card: { padding: 16, gap: 10 },
  cardTitle: { fontFamily: font.uiBold, fontSize: 16, color: colour.text },
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
  result: { fontFamily: font.ui, fontSize: 12.5 },
})

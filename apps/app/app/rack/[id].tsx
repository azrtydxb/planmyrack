import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { RackEditorScreen } from '../../src/screens/RackEditorScreen'
import { useStoreContext } from '../../src/storage/StoreProvider'
import { theme } from '../../src/ui/theme'
import type { Layout } from '@planmyrack/core'

export default function RackRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { store, setMode } = useStoreContext()
  const router = useRouter()
  const [layout, setLayout] = useState<Layout | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!store || !id) return
    store
      .get(id)
      .then((found) => !cancelled && setLayout(found))
      .catch((err: Error) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [id, store])

  if (error) {
    return (
      <View style={styles.centre}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  if (!layout) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={theme.accent} />
      </View>
    )
  }

  return (
    <RackEditorScreen
      store={store}
      initial={layout}
      onSwitchToLocal={() => {
        void setMode({ kind: 'local' })
        router.replace('/')
      }}
    />
  )
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  error: { color: theme.danger, padding: 20, textAlign: 'center' },
})

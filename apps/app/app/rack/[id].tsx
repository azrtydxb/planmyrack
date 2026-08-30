import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { RackEditorScreen } from '../../src/screens/RackEditorScreen'
import { useStoreContext } from '../../src/storage/StoreProvider'
import { StorageProblem } from '../../src/ui/StorageProblem'
import { classifyStorageError } from '../../src/storage/capabilities'
import { colour } from '../../src/ui/theme'
import type { Layout } from '@planmyrack/core'

export default function RackRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { store, mode, setMode, problem, retry } = useStoreContext()
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

  // Without this the route sat on a spinner whenever the store could not be opened at all.
  if (problem || error) {
    return (
      <View style={styles.centre}>
        <StorageProblem
          problem={classifyStorageError(new Error(problem ?? error!))}
          onRetry={retry}
        />
      </View>
    )
  }

  if (!layout) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={colour.accent} />
      </View>
    )
  }

  return (
    <RackEditorScreen
      store={store}
      initial={layout}
      mode={mode?.kind === 'server' ? 'server' : 'local'}
      onOpenSettings={() => router.push('/settings')}
      onSwitchToLocal={() => {
        void setMode({ kind: 'local' })
        router.replace('/')
      }}
    />
  )
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colour.appBg,
  },
})

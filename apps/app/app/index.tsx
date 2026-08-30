import { useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { FirstRunScreen } from '../src/screens/FirstRunScreen'
import { LayoutsScreen } from '../src/screens/LayoutsScreen'
import { useStoreContext } from '../src/storage/StoreProvider'
import { shareText } from '../src/export/files'
import { StorageProblem } from '../src/ui/StorageProblem'
import { classifyStorageError } from '../src/storage/capabilities'
import { colour } from '../src/ui/theme'

export default function Index() {
  const { store, mode, ready, problem, setMode, retry } = useStoreContext()
  const router = useRouter()

  if (!ready) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={colour.accent} />
      </View>
    )
  }

  if (!mode) return <FirstRunScreen onChoose={setMode} />

  if (problem) {
    return (
      <View style={styles.centre}>
        <StorageProblem
          problem={classifyStorageError(new Error(problem))}
          onRetry={retry}
          onSwitchMode={() => void setMode({ kind: 'local' })}
        />
      </View>
    )
  }

  return (
    <LayoutsScreen
      store={store}
      onOpen={(layoutId) => router.push(`/rack/${layoutId}`)}
      onOpenSettings={() => router.push('/settings')}
      onExport={(filename, text) => void shareText(filename, text, 'application/json')}
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

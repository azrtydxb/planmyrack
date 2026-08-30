import { useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { FirstRunScreen } from '../src/screens/FirstRunScreen'
import { LayoutsScreen } from '../src/screens/LayoutsScreen'
import { useStoreContext } from '../src/storage/StoreProvider'
import { theme } from '../src/ui/theme'

export default function Index() {
  const { store, mode, ready, problem, setMode } = useStoreContext()
  const router = useRouter()

  if (!ready) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={theme.accent} />
      </View>
    )
  }

  if (!mode) return <FirstRunScreen onChoose={setMode} />

  if (problem) {
    return (
      <View style={styles.centre}>
        <Text style={styles.problem}>{problem}</Text>
      </View>
    )
  }

  return <LayoutsScreen store={store} onOpenSettings={() => router.push('/settings')} />
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg },
  problem: { color: theme.danger, padding: 20, textAlign: 'center' },
})

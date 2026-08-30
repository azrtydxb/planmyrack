import { useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { FirstRunScreen } from '../src/screens/FirstRunScreen'
import { LayoutsScreen } from '../src/screens/LayoutsScreen'
import { useStoreContext } from '../src/storage/StoreProvider'
import { shareText } from '../src/export/files'
import { colour, font } from '../src/ui/theme'

export default function Index() {
  const { store, mode, ready, problem, setMode } = useStoreContext()
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
        <Text style={styles.problem}>{problem}</Text>
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
  problem: { fontFamily: font.ui, color: colour.danger, padding: 20, textAlign: 'center' },
})

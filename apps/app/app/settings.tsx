import { useRouter } from 'expo-router'
import { SettingsScreen } from '../src/screens/SettingsScreen'
import { useStoreContext } from '../src/storage/StoreProvider'

export default function Settings() {
  const { store, mode, setMode } = useStoreContext()
  const router = useRouter()
  return (
    <SettingsScreen
      mode={mode}
      store={store}
      onSetMode={setMode}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    />
  )
}

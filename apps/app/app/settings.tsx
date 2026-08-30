import { SettingsScreen } from '../src/screens/SettingsScreen'
import { useStoreContext } from '../src/storage/StoreProvider'

export default function Settings() {
  const { store, mode, setMode } = useStoreContext()
  return <SettingsScreen mode={mode} store={store} onSetMode={setMode} />
}

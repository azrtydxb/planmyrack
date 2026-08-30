import AsyncStorage from '@react-native-async-storage/async-storage'

export type Mode = { kind: 'local' } | { kind: 'server'; url: string }

const KEY = 'planmyrack:mode'

/** null means the first-run chooser has never been answered. */
export async function loadMode(): Promise<Mode | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Mode
    if (parsed.kind === 'local') return parsed
    if (parsed.kind === 'server' && typeof parsed.url === 'string') return parsed
    return null
  } catch {
    return null
  }
}

export async function saveMode(mode: Mode): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(mode))
}

export const describeMode = (mode: Mode | null): string =>
  mode === null ? 'Not set up' : mode.kind === 'local' ? 'On this device' : `Server · ${mode.url}`

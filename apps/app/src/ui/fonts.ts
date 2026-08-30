import { useFonts } from 'expo-font'
import {
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import {
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono'

/** Manrope for the UI, IBM Plex Mono for every label, meta line and number. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    IBMPlexMono_700Bold,
  })
  return loaded
}

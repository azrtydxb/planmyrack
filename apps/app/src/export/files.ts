import { Platform } from 'react-native'

/**
 * Hand the user a file. Native goes through the share sheet; web triggers a download. Kept in one
 * place so every export path (JSON, CSV, PNG) behaves the same on each platform.
 */
export async function shareText(filename: string, text: string, mime: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
    return
  }

  const FileSystem = await import('expo-file-system')
  const Sharing = await import('expo-sharing')
  const path = `${FileSystem.Paths.cache.uri}${filename}`
  const file = new FileSystem.File(path)
  file.write(text)
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: mime })
  }
}

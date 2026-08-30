import { Platform } from 'react-native'
import { layoutPrintHtml } from '@planmyrack/core'
import type { Face, Layout } from '@planmyrack/core'

/** One page per face, from the same elevation the screen and the PNG use. */
export async function printLayout(
  layout: Layout,
  faces: Face[] = ['front', 'rear'],
): Promise<void> {
  const html = layoutPrintHtml(layout, faces)

  if (Platform.OS === 'web') {
    const frame = document.createElement('iframe')
    frame.style.position = 'fixed'
    frame.style.right = '0'
    frame.style.bottom = '0'
    frame.style.width = '0'
    frame.style.height = '0'
    document.body.appendChild(frame)
    frame.contentDocument?.write(html)
    frame.contentDocument?.close()
    frame.contentWindow?.print()
    setTimeout(() => frame.remove(), 1000)
    return
  }

  const Print = await import('expo-print')
  await Print.printAsync({ html })
}

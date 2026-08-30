import { Platform } from 'react-native'
import { layoutSvg } from '@planmyrack/core'
import type { Face, Layout } from '@planmyrack/core'

/**
 * PNG of the rack elevation.
 *
 * Web rasterises the pure SVG from core through a canvas — deliberately NOT react-native-view-shot,
 * whose web path goes via html2canvas and renders SVG only partially, which is most of this canvas.
 * Native captures the real view, where view-shot is reliable.
 */
export async function exportPng(
  layout: Layout,
  face: Face,
  filename: string,
  captureView?: () => Promise<string>,
): Promise<string> {
  try {
    if (Platform.OS !== 'web') {
      if (!captureView) throw new Error('no view to capture')
      return await captureView()
    }

    const svg = layoutSvg(layout, face)
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('the elevation could not be rasterised'))
      img.src = dataUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('this browser gave no 2d canvas')
    context.drawImage(image, 0, 0)

    const png = canvas.toDataURL('image/png')
    const anchor = document.createElement('a')
    anchor.href = png
    anchor.download = filename
    anchor.click()
    return png
  } catch (err) {
    throw new Error(`PNG export failed: ${(err as Error).message}`)
  }
}

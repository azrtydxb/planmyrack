import { useWindowDimensions } from 'react-native'

export const PHONE_MAX_WIDTH = 700
export const TABLET_MAX_WIDTH = 1180

export type Breakpoint = 'phone' | 'tablet' | 'desktop'

/**
 * Phones get bottom tabs and a sheet; tablets get an icon rail and a side panel; desktops get
 * the library panel beside the canvas as well, which is how the design lays out 3a and 3b.
 */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions()
  if (width < PHONE_MAX_WIDTH) return 'phone'
  return width < TABLET_MAX_WIDTH ? 'tablet' : 'desktop'
}

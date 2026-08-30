import { useWindowDimensions } from 'react-native'

/**
 * The app is locked to landscape, so the narrowest real screen is a small phone on its side —
 * 667pt. That gets the rail and a side panel, not the bottom sheet: at 375pt tall the sheet
 * covered the entire canvas and pushed the tab bar off the screen.
 */
export const PHONE_MAX_WIDTH = 600
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

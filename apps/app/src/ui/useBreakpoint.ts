import { useWindowDimensions } from 'react-native'

/** Phones get a bottom sheet, anything wider gets a side panel. */
export const PHONE_MAX_WIDTH = 700

export function useBreakpoint(): 'phone' | 'wide' {
  const { width } = useWindowDimensions()
  return width < PHONE_MAX_WIDTH ? 'phone' : 'wide'
}

import type { ModalProps } from 'react-native'

/**
 * Every Modal in the app must declare these.
 *
 * The app is locked to landscape. A Modal defaults to portrait-only, and iOS then throws
 * `UIApplicationInvalidInterfaceOrientation: Supported orientations has no common orientation
 * with the application` — the app terminates. Found on an iPhone simulator by tapping a port,
 * which is the app's central interaction.
 */
export const MODAL_ORIENTATIONS: NonNullable<ModalProps['supportedOrientations']> = [
  'landscape',
  'landscape-left',
  'landscape-right',
]

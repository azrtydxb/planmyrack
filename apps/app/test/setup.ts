// RNTL v12.4+ ships its matchers (toBeDisabled, toHaveTextContent) with the main entry point.

// AsyncStorage has no native module under jest; this is the mock the package ships.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

// Screens that draw their own header read the safe-area inset; no provider is mounted in tests.
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

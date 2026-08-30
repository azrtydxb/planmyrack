// RNTL v12.4+ ships its matchers (toBeDisabled, toHaveTextContent) with the main entry point.

// AsyncStorage has no native module under jest; this is the mock the package ships.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

import { describe, it, expect } from 'vitest'
import { findPlatformImports } from '../scripts/check-purity.mjs'

describe('TestSharedPackagesArePlatformFree', () => {
  it('flags a file importing react-native', async () => {
    expect(await findPlatformImports(['tests/fixtures/impure'])).toEqual([
      { file: 'tests/fixtures/impure/bad.ts', module: 'react-native' },
    ])
  })

  it('finds nothing in the shared packages', async () => {
    expect(await findPlatformImports(['packages'])).toEqual([])
  })
})

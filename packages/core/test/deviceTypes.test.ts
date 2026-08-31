import { describe, it, expect, vi } from 'vitest'
import { DEVICE_TYPES, UNIT_SIZES, newId, newLayout, nextLayoutName } from '../src/index.ts'

describe('TestDeviceTypeTableIsConsistent', () => {
  it('gives every type at least one size drawn from UNIT_SIZES', () => {
    for (const spec of Object.values(DEVICE_TYPES)) {
      expect(spec.sizes.length).toBeGreaterThan(0)
      expect(spec.sizes.every((s) => UNIT_SIZES.includes(s))).toBe(true)
    }
  })

  it('never defaults a device to more ports or outlets than it allows', () => {
    for (const spec of Object.values(DEVICE_TYPES)) {
      expect(spec.defaultPorts).toBeLessThanOrEqual(spec.maxPorts)
      expect(spec.defaultOutlets).toBeLessThanOrEqual(spec.maxOutlets)
    }
  })

  it('gives cable management, shelves and blanks no ports at all', () => {
    for (const t of ['hooks', 'brush', 'shelf', 'blank'] as const) {
      expect(DEVICE_TYPES[t].maxPorts).toBe(0)
    }
  })

  it('draws no power through the types that are not electrical', () => {
    for (const t of ['hooks', 'brush', 'shelf', 'blank'] as const) {
      expect(DEVICE_TYPES[t].drawsPower).toBe(false)
    }
    for (const t of ['equipment', 'server', 'switch', 'ups'] as const) {
      expect(DEVICE_TYPES[t].drawsPower).toBe(true)
    }
  })

  it('supplies outlets only from the types that distribute power', () => {
    expect(DEVICE_TYPES.pdu.maxOutlets).toBeGreaterThan(0)
    expect(DEVICE_TYPES.equipment.maxOutlets).toBe(0)
  })

  it('starts a new layout with one 19-inch rack and nothing in it', () => {
    const l = newLayout('Basement')
    expect(l.racks).toHaveLength(1)
    expect(l.racks[0]!.width).toBe(19)
    expect([l.devices.length, l.links.length, l.revision]).toEqual([0, 0, 0])
  })
})

describe('TestIdsAreUniqueWithOrWithoutCrypto', () => {
  it('mints 10000 distinct ids', () => {
    expect(new Set(Array.from({ length: 10_000 }, newId)).size).toBe(10_000)
  })

  it('still mints ids where crypto.randomUUID does not exist', () => {
    // Hermes exposes neither randomUUID nor getRandomValues by default
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })
    try {
      expect(new Set(Array.from({ length: 10_000 }, newId)).size).toBe(10_000)
    } finally {
      if (original) Object.defineProperty(globalThis, 'crypto', original)
    }
  })

  it('prefers crypto.randomUUID when the platform has it', () => {
    const randomUUID = vi.fn(() => '11111111-2222-3333-4444-555555555555')
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
    Object.defineProperty(globalThis, 'crypto', { value: { randomUUID }, configurable: true })
    try {
      expect(newId()).toBe('1111111122223333')
    } finally {
      if (original) Object.defineProperty(globalThis, 'crypto', original)
    }
    expect(randomUUID).toHaveBeenCalled()
  })
})

describe('TestANewLayoutGetsANameOfItsOwn', () => {
  it('numbers past the names already in the store', () => {
    expect(nextLayoutName([])).toBe('Untitled layout')
    expect(nextLayoutName(['Untitled layout'])).toBe('Untitled layout 2')
    expect(nextLayoutName(['Untitled layout', 'Untitled layout 2'])).toBe('Untitled layout 3')
  })

  it('leaves a gap alone rather than shuffling anything', () => {
    expect(nextLayoutName(['Untitled layout', 'Untitled layout 3'])).toBe('Untitled layout 2')
  })

  it('ignores names nobody generated', () => {
    expect(nextLayoutName(['Home lab', 'Basement'])).toBe('Untitled layout')
  })
})

import { describe, it, expect } from 'vitest'
import { DEVICE_TYPES, UNIT_SIZES } from '@planmyrack/core'
import { BUNDLED_CATALOG, catalogByVendor, deviceFromCatalog } from '../src/index.ts'

describe('TestBundledCatalogueShape', () => {
  it('ships the generic set and the named vendor families', () => {
    const vendors = new Set(BUNDLED_CATALOG.map((e) => e.vendor))
    for (const v of ['Generic', 'UniFi', 'MikroTik', 'TP-Link', 'Synology', 'QNAP', 'Cisco']) {
      expect(vendors).toContain(v)
    }
  })

  it('gives every entry a placeable height and a port count its type allows', () => {
    for (const e of BUNDLED_CATALOG) {
      expect(UNIT_SIZES).toContain(e.heightU)
      expect(DEVICE_TYPES[e.type].sizes).toContain(e.heightU)
      expect(e.ports).toBeGreaterThanOrEqual(0)
      expect(e.ports).toBeLessThanOrEqual(DEVICE_TYPES[e.type].maxPorts)
      expect(e.outlets).toBeLessThanOrEqual(DEVICE_TYPES[e.type].maxOutlets)
      expect(e.source).not.toBe('')
    }
  })

  it('uses unique ids', () => {
    expect(new Set(BUNDLED_CATALOG.map((e) => e.id)).size).toBe(BUNDLED_CATALOG.length)
  })

  it('says where every unverified wattage came from rather than inventing one', () => {
    for (const e of BUNDLED_CATALOG.filter((x) => x.watts === 0)) {
      expect(e.source).toMatch(/unknown|generic/i)
    }
  })

  it('groups entries by vendor for the palette', () => {
    expect([...catalogByVendor().keys()]).toContain('MikroTik')
  })

  it('places a catalogue entry as a device carrying its ports and watts', () => {
    const source = BUNDLED_CATALOG.find((e) => e.id === 'unifi-usw-24')!
    const d = deviceFromCatalog(source, { rackId: 'r1', face: 'front', posU: 0 })
    expect([d.ports, d.watts, d.heightU]).toEqual([source.ports, source.watts, source.heightU])
    expect(d.name).toBe('UniFi Switch 24')
  })
})

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

describe('TestKnownModelsCarryTheirShape', () => {
  it('gives a rack NAS its drive bays', () => {
    const nas = BUNDLED_CATALOG.find((e) => e.id === 'synology-rs1221plus')!
    expect(nas.faceplate).toBe('bays')
    expect(nas.bays).toBe(8)
  })

  it('gives switches their uplink cages, and PoE switches a PoE face', () => {
    const agg = BUNDLED_CATALOG.find((e) => e.id === 'unifi-usw-aggregation')!
    expect([agg.faceplate, agg.sfp]).toEqual(['sfp', 8])
    expect(BUNDLED_CATALOG.find((e) => e.id === 'unifi-usw-24-poe')!.faceplate).toBe('poe')
  })

  it('carries the shape onto the placed device', () => {
    const source = BUNDLED_CATALOG.find((e) => e.id === 'synology-rs2423plus')!
    const placed = deviceFromCatalog(source, { rackId: 'r1', face: 'front', posU: 0 })
    expect([placed.faceplate, placed.bays]).toEqual(['bays', 12])
  })

  it('counts uplink cages among the ports, never beside them', () => {
    // the cages used to be decoration: the two SFP ports of a UniFi Switch 24 could not be wired
    // at all, and an aggregation switch drew eight RJ45 sockets it does not have
    for (const e of BUNDLED_CATALOG) {
      expect([e.id, (e.sfp ?? 0) <= e.ports]).toEqual([e.id, true])
    }
    const agg = BUNDLED_CATALOG.find((e) => e.id === 'unifi-usw-aggregation')!
    expect([agg.ports, agg.sfp]).toEqual([8, 8])
    const usw24 = BUNDLED_CATALOG.find((e) => e.id === 'unifi-usw-24')!
    expect([usw24.ports, usw24.sfp]).toEqual([26, 2])
  })

  it('reads the layout MikroTik puts in its own model names', () => {
    // CRS309-1G-8S+ is one gigabit port and eight SFP+, not eight of each
    const crs309 = BUNDLED_CATALOG.find((e) => e.id === 'mikrotik-crs309')!
    expect([crs309.ports, crs309.sfp]).toEqual([9, 8])
    const crs326 = BUNDLED_CATALOG.find((e) => e.id === 'mikrotik-crs326-24g')!
    expect([crs326.ports, crs326.sfp]).toEqual([26, 2])
    const ccr = BUNDLED_CATALOG.find((e) => e.id === 'mikrotik-ccr2004')!
    expect([ccr.ports, ccr.sfp]).toEqual([15, 14])
  })

  it('leaves generic gear plain, since a generic switch has no particular front', () => {
    const generic = BUNDLED_CATALOG.find((e) => e.id === 'generic-switch')!
    expect(generic.faceplate).toBeUndefined()
  })
})

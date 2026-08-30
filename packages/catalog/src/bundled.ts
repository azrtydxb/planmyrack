import { COLOURS } from '@planmyrack/core'
import type { CatalogEntry } from './types.ts'

const GENERIC = 'generic rack sizes; nothing vendor-specific to verify'
const STRUCTURAL =
  'height and port count are the published structural specification; watts left at 0 (unknown) — set it from your own unit'

const entry = (
  id: string,
  vendor: string,
  model: string,
  type: CatalogEntry['type'],
  heightU: number,
  ports: number,
  outlets = 0,
  watts = 0,
  colour = COLOURS[0]!,
  source = STRUCTURAL,
): CatalogEntry => ({ id, vendor, model, type, heightU, ports, outlets, watts, colour, source })

/**
 * Starter gear so the palette is useful on a fresh install.
 *
 * The generic rows are shapes, not products. The vendor rows carry only the structural facts —
 * how many units tall, how many ports — because those are stable and checkable. Wattage is left
 * at 0 rather than guessed: a made-up figure in a power total is worse than an obvious gap.
 */
export const BUNDLED_CATALOG: CatalogEntry[] = [
  // Generic shapes
  entry('generic-server-1u', 'Generic', 'Server 1U', 'server', 1, 2, 0, 0, COLOURS[1]!, GENERIC),
  entry('generic-server-2u', 'Generic', 'Server 2U', 'server', 2, 2, 0, 0, COLOURS[1]!, GENERIC),
  entry('generic-server-4u', 'Generic', 'Server 4U', 'server', 4, 2, 0, 0, COLOURS[1]!, GENERIC),
  entry('generic-switch-8', 'Generic', 'Switch 8-port', 'switch', 1, 8, 0, 0, COLOURS[5]!, GENERIC),
  entry(
    'generic-switch-16',
    'Generic',
    'Switch 16-port',
    'switch',
    1,
    16,
    0,
    0,
    COLOURS[5]!,
    GENERIC,
  ),
  entry(
    'generic-switch-24',
    'Generic',
    'Switch 24-port',
    'switch',
    1,
    24,
    0,
    0,
    COLOURS[5]!,
    GENERIC,
  ),
  entry(
    'generic-switch-48',
    'Generic',
    'Switch 48-port',
    'switch',
    1,
    48,
    0,
    0,
    COLOURS[5]!,
    GENERIC,
  ),
  entry(
    'generic-patch-24',
    'Generic',
    'Patch panel 24-port',
    'patch',
    1,
    24,
    0,
    0,
    COLOURS[8]!,
    GENERIC,
  ),
  entry(
    'generic-patch-48',
    'Generic',
    'Patch panel 48-port',
    'patch',
    2,
    48,
    0,
    0,
    COLOURS[8]!,
    GENERIC,
  ),
  entry('generic-pdu-8', 'Generic', 'PDU 8-way', 'pdu', 1, 0, 8, 0, COLOURS[4]!, GENERIC),
  entry('generic-ups-2u', 'Generic', 'UPS 2U', 'ups', 2, 1, 4, 0, COLOURS[3]!, GENERIC),
  entry('generic-shelf-1u', 'Generic', 'Shelf 1U', 'shelf', 1, 0, 0, 0, COLOURS[8]!, GENERIC),
  entry('generic-shelf-2u', 'Generic', 'Shelf 2U', 'shelf', 2, 0, 0, 0, COLOURS[8]!, GENERIC),
  entry(
    'generic-blank-05u',
    'Generic',
    'Blank panel ½U',
    'blank',
    0.5,
    0,
    0,
    0,
    COLOURS[8]!,
    GENERIC,
  ),
  entry('generic-blank-1u', 'Generic', 'Blank panel 1U', 'blank', 1, 0, 0, 0, COLOURS[8]!, GENERIC),
  entry('generic-blank-2u', 'Generic', 'Blank panel 2U', 'blank', 2, 0, 0, 0, COLOURS[8]!, GENERIC),
  entry(
    'generic-hooks-05u',
    'Generic',
    'Cable hooks ½U',
    'hooks',
    0.5,
    0,
    0,
    0,
    COLOURS[7]!,
    GENERIC,
  ),
  entry('generic-hooks-1u', 'Generic', 'Cable hooks 1U', 'hooks', 1, 0, 0, 0, COLOURS[7]!, GENERIC),
  entry(
    'generic-brush-05u',
    'Generic',
    'Cable brush ½U',
    'brush',
    0.5,
    0,
    0,
    0,
    COLOURS[7]!,
    GENERIC,
  ),
  entry('generic-brush-1u', 'Generic', 'Cable brush 1U', 'brush', 1, 0, 0, 0, COLOURS[7]!, GENERIC),

  // UniFi
  entry('unifi-udm-pro', 'UniFi', 'Dream Machine Pro', 'equipment', 1, 8),
  entry('unifi-udm-se', 'UniFi', 'Dream Machine SE', 'equipment', 1, 8),
  entry('unifi-usw-24', 'UniFi', 'Switch 24', 'switch', 1, 24),
  entry('unifi-usw-24-poe', 'UniFi', 'Switch 24 PoE', 'switch', 1, 24),
  entry('unifi-usw-48', 'UniFi', 'Switch 48', 'switch', 1, 48),
  entry('unifi-usw-aggregation', 'UniFi', 'Switch Aggregation', 'switch', 1, 8),

  // MikroTik
  entry('mikrotik-crs326-24g', 'MikroTik', 'CRS326-24G-2S+RM', 'switch', 1, 24),
  entry('mikrotik-crs328-24p', 'MikroTik', 'CRS328-24P-4S+RM', 'switch', 1, 24),
  entry('mikrotik-crs309', 'MikroTik', 'CRS309-1G-8S+', 'switch', 1, 8),
  entry('mikrotik-ccr2004', 'MikroTik', 'CCR2004-1G-12S+2XS', 'equipment', 1, 8),
  entry('mikrotik-rb5009', 'MikroTik', 'RB5009UG+S+', 'equipment', 1, 8),

  // TP-Link
  entry('tplink-tl-sg1024', 'TP-Link', 'TL-SG1024', 'switch', 1, 24),
  entry('tplink-tl-sg1016', 'TP-Link', 'TL-SG1016', 'switch', 1, 16),
  entry('tplink-tl-sg3428', 'TP-Link', 'TL-SG3428', 'switch', 1, 24),
  entry('tplink-omada-oc200', 'TP-Link', 'Omada OC200', 'equipment', 1, 2),

  // Synology
  entry('synology-rs1221plus', 'Synology', 'RS1221+', 'server', 1, 4),
  entry('synology-rs822plus', 'Synology', 'RS822+', 'server', 1, 2),
  entry('synology-rs2423plus', 'Synology', 'RS2423+', 'server', 2, 4),

  // QNAP
  entry('qnap-ts-464u', 'QNAP', 'TS-464U', 'server', 1, 2),
  entry('qnap-ts-873au', 'QNAP', 'TS-873AU', 'server', 2, 2),

  // Cisco
  entry('cisco-sg350-28', 'Cisco', 'SG350-28', 'switch', 1, 28),
  entry('cisco-sg250-26', 'Cisco', 'SG250-26', 'switch', 1, 26),
  entry('cisco-sg550x-24', 'Cisco', 'SG550X-24', 'switch', 1, 24),
]

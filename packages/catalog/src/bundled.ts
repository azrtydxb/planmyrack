import { COLOURS } from '@planmyrack/core'
import type { CatalogEntry } from './types.ts'

const GENERIC = 'generic rack sizes; nothing vendor-specific to verify'
const STRUCTURAL =
  'height and port count are the published structural specification; watts left at 0 (unknown) — set it from your own unit'

/** Every vendor row in this file is rack-mount gear built to the 19" standard. */
const NINETEEN = { width: 19 } as const

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
  face: Pick<CatalogEntry, 'faceplate' | 'bays' | 'sfp' | 'slots' | 'width'> = {},
): CatalogEntry => ({
  id,
  vendor,
  model,
  type,
  heightU,
  ports,
  outlets,
  watts,
  colour,
  source,
  ...face,
})

/**
 * Starter gear so the palette is useful on a fresh install.
 *
 * The generic rows are shapes, not products. The vendor rows carry only the structural facts —
 * how many units tall, how many ports — because those are stable and checkable. Wattage is left
 * at 0 rather than guessed: a made-up figure in a power total is worse than an obvious gap.
 */
export const BUNDLED_CATALOG: CatalogEntry[] = [
  // Generic shapes. One row per type: the count is set with a stepper in the library rather than
  // by shipping a separate entry for every port count anyone might want.
  entry('generic-server', 'Generic', 'Server', 'server', 1, 2, 0, 0, COLOURS[1]!, GENERIC),
  entry('generic-switch', 'Generic', 'Switch', 'switch', 1, 24, 0, 0, COLOURS[5]!, GENERIC),
  entry('generic-patch', 'Generic', 'Patch panel', 'patch', 1, 24, 0, 0, COLOURS[8]!, GENERIC),
  entry('generic-pdu', 'Generic', 'PDU', 'pdu', 1, 0, 8, 0, COLOURS[4]!, GENERIC, {
    faceplate: 'outlets',
  }),
  entry('generic-ups', 'Generic', 'UPS', 'ups', 2, 1, 4, 0, COLOURS[3]!, GENERIC),
  entry('generic-equipment', 'Generic', 'Equipment', 'equipment', 1, 0, 0, 0, COLOURS[0]!, GENERIC),
  entry('generic-shelf', 'Generic', 'Shelf', 'shelf', 1, 0, 0, 0, COLOURS[8]!, GENERIC),
  // A tray of cut-outs for single-board computers. They come in many shapes; the number of
  // cut-outs is dialled in with the stepper rather than shipped as a row per variant.
  entry('generic-mount', 'Generic', 'SBC mount', 'mount', 1, 0, 0, 0, COLOURS[6]!, GENERIC, {
    slots: 2,
  }),
  entry('generic-blank', 'Generic', 'Blank panel', 'blank', 1, 0, 0, 0, COLOURS[8]!, GENERIC),
  entry('generic-hooks', 'Generic', 'Cable hooks', 'hooks', 1, 0, 0, 0, COLOURS[7]!, GENERIC),
  entry('generic-brush', 'Generic', 'Cable brush', 'brush', 1, 0, 0, 0, COLOURS[7]!, GENERIC),

  // UniFi
  entry(
    'unifi-udm-pro',
    'UniFi',
    'Dream Machine Pro',
    'gateway',
    1,
    10,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'display', bays: 1, sfp: 2 },
  ),
  entry(
    'unifi-udm-se',
    'UniFi',
    'Dream Machine SE',
    'gateway',
    1,
    10,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'display', bays: 1, sfp: 2 },
  ),
  entry('unifi-usw-24', 'UniFi', 'Switch 24', 'switch', 1, 26, 0, 0, COLOURS[0]!, STRUCTURAL, {
    ...NINETEEN,
    faceplate: 'sfp',
    sfp: 2,
  }),
  entry(
    'unifi-usw-24-poe',
    'UniFi',
    'Switch 24 PoE',
    'switch',
    1,
    26,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'poe', sfp: 2 },
  ),
  entry('unifi-usw-48', 'UniFi', 'Switch 48', 'switch', 1, 52, 0, 0, COLOURS[0]!, STRUCTURAL, {
    ...NINETEEN,
    faceplate: 'sfp',
    sfp: 4,
  }),
  entry(
    'unifi-usw-aggregation',
    'UniFi',
    'Switch Aggregation',
    'switch',
    1,
    8,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'sfp', sfp: 8 },
  ),

  // MikroTik
  entry(
    'mikrotik-crs326-24g',
    'MikroTik',
    'CRS326-24G-2S+RM',
    'switch',
    1,
    26,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'sfp', sfp: 2 },
  ),
  entry(
    'mikrotik-crs328-24p',
    'MikroTik',
    'CRS328-24P-4S+RM',
    'switch',
    1,
    28,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'poe', sfp: 4 },
  ),
  entry(
    'mikrotik-crs309',
    'MikroTik',
    'CRS309-1G-8S+',
    'switch',
    1,
    9,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'sfp', sfp: 8 },
  ),
  entry(
    'mikrotik-ccr2004',
    'MikroTik',
    'CCR2004-1G-12S+2XS',
    'gateway',
    1,
    15,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'sfp', sfp: 14 },
  ),
  entry(
    'mikrotik-rb5009',
    'MikroTik',
    'RB5009UG+S+',
    'gateway',
    1,
    9,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    {
      faceplate: 'sfp',
      sfp: 1,
    },
  ),

  // TP-Link
  entry(
    'tplink-tl-sg1024',
    'TP-Link',
    'TL-SG1024',
    'switch',
    1,
    24,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),
  entry(
    'tplink-tl-sg1016',
    'TP-Link',
    'TL-SG1016',
    'switch',
    1,
    16,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),
  entry(
    'tplink-tl-sg3428',
    'TP-Link',
    'TL-SG3428',
    'switch',
    1,
    24,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),
  entry(
    'tplink-omada-oc200',
    'TP-Link',
    'Omada OC200',
    'gateway',
    1,
    2,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),

  // Synology
  entry(
    'synology-rs1221plus',
    'Synology',
    'RS1221+',
    'server',
    1,
    4,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'bays', bays: 8 },
  ),
  entry('synology-rs822plus', 'Synology', 'RS822+', 'server', 1, 2, 0, 0, COLOURS[0]!, STRUCTURAL, {
    ...NINETEEN,
    faceplate: 'bays',
    bays: 4,
  }),
  entry(
    'synology-rs2423plus',
    'Synology',
    'RS2423+',
    'server',
    2,
    4,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    { ...NINETEEN, faceplate: 'bays', bays: 12 },
  ),

  // QNAP
  entry('qnap-ts-464u', 'QNAP', 'TS-464U', 'server', 1, 2, 0, 0, COLOURS[0]!, STRUCTURAL, {
    ...NINETEEN,
    faceplate: 'bays',
    bays: 4,
  }),
  entry('qnap-ts-873au', 'QNAP', 'TS-873AU', 'server', 2, 2, 0, 0, COLOURS[0]!, STRUCTURAL, {
    ...NINETEEN,
    faceplate: 'bays',
    bays: 8,
  }),

  // Single-board computers, for the mounts. Port counts are what the boards carry on the board
  // itself: an Orange Pi 5 Plus has two 2.5GbE, a Raspberry Pi one gigabit.
  entry('rpi-5', 'Raspberry Pi', 'Pi 5', 'sbc', 1, 1, 0, 0, COLOURS[2]!, STRUCTURAL),
  entry('rpi-4b', 'Raspberry Pi', 'Pi 4 Model B', 'sbc', 1, 1, 0, 0, COLOURS[2]!, STRUCTURAL),
  entry('orangepi-5-plus', 'Orange Pi', '5 Plus', 'sbc', 1, 2, 0, 0, COLOURS[3]!, STRUCTURAL),

  // Cisco
  entry(
    'cisco-sg350-28',
    'Cisco',
    'SG350-28',
    'switch',
    1,
    28,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),
  entry(
    'cisco-sg250-26',
    'Cisco',
    'SG250-26',
    'switch',
    1,
    26,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),
  entry(
    'cisco-sg550x-24',
    'Cisco',
    'SG550X-24',
    'switch',
    1,
    24,
    0,
    0,
    COLOURS[0]!,
    STRUCTURAL,
    NINETEEN,
  ),
]

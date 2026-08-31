/**
 * Tokens taken from the design doc (docs/design.md — direction 2a "Console").
 * The workspace is light; only the rack hardware is dark.
 */
export const colour = {
  appBg: '#eef1f5',
  canvasBg: '#f2f5f9',
  surface: '#ffffff',
  sunken: '#e2e7ee',
  sunkenSoft: '#f0f3f6',
  border: '#e0e6ec',
  borderSoft: '#e4e9ef',
  borderInput: '#d6dde6',
  text: '#16202c',
  textSecondary: '#495666',
  muted: '#6b7787',
  mutedSoft: '#8b98a8',
  icon: '#98a4b3',
  accent: '#1479ff',
  accentSoft: '#e8f1ff',
  green: '#22c55e',
  orange: '#ff8a3d',
  purple: '#8b5cf6',
  danger: '#ef4444',
  dangerSoft: '#fdeced',
} as const

/** Rack hardware — the only dark surfaces in the app. */
export const rack = {
  body: '#1a1f26',
  railLight: '#3a424c',
  railDark: '#2b323a',
  screw: '#10141a',
  cap: '#2b323a',
  faceTop: '#2d353f',
  faceBottom: '#20262e',
  faceBorder: '#14181d',
  blank: '#20262e',
  brush: '#232a32',
  shelfTop: '#99a2ad',
  shelfBottom: '#77828e',
  faceText: '#f2f5f9',
  faceMeta: '#98a4b3',
  portFree: '#05070a',
  /** The bright edge of an SFP cage, which is deeper and wider than an RJ45 slot. */
  cage: '#4a5462',
  portFreeShine: 'inset 0 1px 0 rgba(255,255,255,.12)',
} as const

/** Cable colours, cycled as cables are created. */
export const CABLE_COLOURS = [colour.accent, colour.orange, colour.green, colour.purple] as const

export const font = {
  ui: 'Manrope_700Bold',
  uiSemi: 'Manrope_600SemiBold',
  uiBold: 'Manrope_800ExtraBold',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_600SemiBold',
  monoHeavy: 'IBMPlexMono_700Bold',
} as const

export const radius = { face: 2, chip: 7, control: 9, button: 10, card: 14, sheet: 20 } as const

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22 } as const

/** Every tappable target is at least this tall: fingers, not mice. */
export const TOUCH = 44

export const theme = { colour, rack, font, radius, space, TOUCH }

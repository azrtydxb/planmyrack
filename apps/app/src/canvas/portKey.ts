import type { LinkKind } from '@planmyrack/core'

/** One id shape for a port, shared by the grid, the picker and the cable overlay. */
export const portKey = (deviceId: string, port: number, kind: LinkKind): string =>
  `port-${deviceId}-${kind}-${port}`

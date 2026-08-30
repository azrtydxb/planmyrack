import type { DeviceType } from '@planmyrack/core'

export interface CatalogEntry {
  id: string
  vendor: string
  model: string
  type: DeviceType
  heightU: number
  ports: number
  outlets: number
  /**
   * Typical draw in watts, or 0 when no verified figure was available. 0 means "unknown", not
   * "draws nothing" — set it from your own kit rather than trusting a guess.
   */
  watts: number
  colour: string
  /** Where the numbers came from, so a wrong row can be traced and corrected. */
  source: string
}

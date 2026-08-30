import type { DeviceType, Faceplate } from '@planmyrack/core'

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
  /** How the front is drawn: drive bays, a display, SFP cages. Schematic, not a photograph. */
  faceplate?: Faceplate
  /** Drive bays, for the models that have them. */
  bays?: number
  /** SFP/SFP+ uplink cages, counted separately from the RJ45 ports. */
  sfp?: number
}

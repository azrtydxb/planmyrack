import type { DeviceType, Layout } from '@planmyrack/core'

export interface LayoutSummary {
  id: string
  name: string
  revision: number
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  type: DeviceType
  heightU: number
  ports: number
  outlets: number
  watts: number
  weightKg: number
  depthMm: number
  colour: string
}

/**
 * The one storage interface. Local mode and server mode are different implementations of this
 * and nothing else, which is what makes them interchangeable — every implementation must pass
 * runStoreContract.
 */
export interface LayoutStore {
  list(): Promise<LayoutSummary[]>
  get(id: string): Promise<Layout>
  /** Assigns an id and revision 1. */
  create(layout: Layout): Promise<Layout>
  /** Requires layout.revision to match what is stored; returns the document at revision + 1. */
  update(layout: Layout): Promise<Layout>
  remove(id: string): Promise<void>
  listTemplates(): Promise<Template[]>
  saveTemplate(template: Template): Promise<Template>
  removeTemplate(id: string): Promise<void>
}

export const STALE_SAVE_MESSAGE =
  'This layout changed on another device. Reload it, or export your version to JSON first.'
export const SERVER_DOWN_MESSAGE = "Can't reach the server."

/** The save was built on an older revision; `current` is what the store holds now. */
export class StaleRevisionError extends Error {
  readonly code = 'stale-revision'
  readonly current: Layout

  constructor(current: Layout) {
    super(STALE_SAVE_MESSAGE)
    this.name = 'StaleRevisionError'
    this.current = current
  }
}

export class NotFoundError extends Error {
  readonly code = 'not-found'

  constructor(id: string) {
    super(`No layout ${id} in this store.`)
    this.name = 'NotFoundError'
  }
}

/** The store could not be reached or read at all — never confused with "the layout is missing". */
export class StoreUnavailableError extends Error {
  readonly code = 'store-unavailable'

  constructor(detail: string, options?: { cause?: unknown }) {
    super(`${SERVER_DOWN_MESSAGE} ${detail}`.trim(), options)
    this.name = 'StoreUnavailableError'
  }
}

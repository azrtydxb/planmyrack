import { Platform } from 'react-native'

export interface Capability {
  ok: boolean
  reason?: string
}

/**
 * Whether this platform can actually keep a local database.
 *
 * On web, expo-sqlite persists through OPFS, which needs the page cross-origin isolated. Without
 * that the data would vanish on refresh — so local mode is refused with a reason rather than
 * offered and silently lost.
 */
export async function canUseLocalStore(): Promise<Capability> {
  if (Platform.OS !== 'web') return { ok: true }

  const isolated = (globalThis as { crossOriginIsolated?: boolean }).crossOriginIsolated
  const hasOpfs =
    typeof navigator !== 'undefined' &&
    typeof (navigator as { storage?: { getDirectory?: unknown } }).storage?.getDirectory ===
      'function'

  if (!hasOpfs) {
    return {
      ok: false,
      reason:
        "This browser can't store layouts on your device (no origin private file system). Connect to a server instead.",
    }
  }
  if (!isolated) {
    return {
      ok: false,
      reason:
        "This page isn't cross-origin isolated, so the browser won't let the app store layouts here. Serve it from the PlanMyRack server, or connect to one.",
    }
  }
  return { ok: true }
}

export type StorageProblemKind = 'corrupt' | 'unsupported' | 'full' | 'permission' | 'busy'

/**
 * The database on this device is held by one page at a time. A second tab does not fail to open
 * it — it waits forever, which on screen is an endless spinner and no explanation.
 */
export const STORE_BUSY_MESSAGE =
  'PlanMyRack is already open in another tab. Layouts kept on this device can only be opened by one tab at a time — close the other one and retry.'

export interface StorageProblem {
  kind: StorageProblemKind
  detail: string
}

const FULL = /disk (is )?full|quota|SQLITE_FULL|no space/i
const CORRUPT = /not a database|malformed|corrupt|SQLITE_CORRUPT|file is encrypted/i
const PERMISSION = /NSLocalNetworkDenied|local network|permission denied/i
// The two ways the same situation arrives: our own deadline, and OPFS refusing a second access
// handle when another page still holds one.
const BUSY =
  /already open in another tab|NoModificationAllowedError|Access Handles? cannot be created|another open Access Handle/i

/** Turns a raw driver or network error into something the user can act on. */
export function classifyStorageError(error: Error): StorageProblem {
  const message = error.message
  if (CORRUPT.test(message)) {
    return {
      kind: 'corrupt',
      detail:
        "PlanMyRack couldn't read the layouts stored on this device. Nothing has been deleted — import a JSON backup to carry on.",
    }
  }
  if (FULL.test(message)) {
    return {
      kind: 'full',
      detail: 'There is no room left to save. Export this layout to JSON before you lose it.',
    }
  }
  if (BUSY.test(message)) return { kind: 'busy', detail: STORE_BUSY_MESSAGE }
  if (PERMISSION.test(message)) {
    return {
      kind: 'permission',
      detail:
        'Local network access is turned off for this app, so it cannot reach a server on your network. Turn it on in Settings.',
    }
  }
  return { kind: 'unsupported', detail: message }
}

/** Last server call, kept for the settings diagnostics block. */
export interface ServerStatus {
  url: string
  status: number | null
  at: string
}

let lastStatus: ServerStatus | null = null
export const recordServerStatus = (status: ServerStatus): void => {
  lastStatus = status
}
export const lastServerStatus = (): ServerStatus | null => lastStatus

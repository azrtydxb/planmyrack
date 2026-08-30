import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createHttpStore } from '@planmyrack/storage'
import { STORE_BUSY_MESSAGE } from './capabilities'
import { createExpoSqliteStore } from './sqliteStore'
import { loadMode, saveMode } from './settings'
import type { ReactNode } from 'react'
import type { LayoutStore } from '@planmyrack/storage'
import type { Mode } from './settings'

interface StoreContextValue {
  store: LayoutStore | null
  mode: Mode | null
  /** Set once the stored mode has been read, so the first-run chooser does not flash. */
  ready: boolean
  problem: string | null
  setMode(mode: Mode): Promise<void>
  /** Opens the store again after a failure — the other tab may since have been closed. */
  retry(): void
}

const StoreContext = createContext<StoreContextValue | null>(null)

/** How long one attempt at opening the on-device database may take. */
export const LOCAL_OPEN_TIMEOUT_MS = 2000

/** How many attempts before the app says the database is held by another tab. */
export const LOCAL_OPEN_ATTEMPTS = 3

export function StoreProvider({
  children,
  makeLocalStore = createExpoSqliteStore,
  makeServerStore = createHttpStore,
  localOpenTimeoutMs = LOCAL_OPEN_TIMEOUT_MS,
}: {
  children: ReactNode
  makeLocalStore?: (name?: string) => Promise<LayoutStore>
  makeServerStore?: (url: string) => LayoutStore
  localOpenTimeoutMs?: number
}) {
  const [mode, setModeState] = useState<Mode | null>(null)
  const [store, setStore] = useState<LayoutStore | null>(null)
  const [ready, setReady] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    void loadMode().then((stored) => {
      if (cancelled) return
      setModeState(stored)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Rebuilding the store is the whole of switching modes: nothing else in the app knows which
  // kind it is talking to.
  useEffect(() => {
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    if (!mode) {
      setStore(null)
      return
    }
    setProblem(null)
    if (mode.kind === 'server') {
      setStore(makeServerStore(mode.url))
      return
    }
    /**
     * expo-sqlite's OPFS driver does not reject while another page holds the database: it waits,
     * and the app sat on a spinner with nothing to say. Waiting for it now has a deadline.
     *
     * The attempts wait on the SAME open, they do not start another one. Reloading the page
     * reliably loses the first few seconds — the handle from the page being replaced has not been
     * released yet — and the open then succeeds on its own. Opening the database a second time
     * would hand back the same cached connection, so abandoning or closing one breaks the other:
     * that mistake surfaced as "Error code 21: bad parameter or other API misuse".
     */
    const opening = makeLocalStore()
    const waitForIt = (): Promise<LayoutStore> => {
      const deadline = new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error(STORE_BUSY_MESSAGE)), localOpenTimeoutMs)
      })
      return Promise.race([opening, deadline]).finally(() => clearTimeout(timeout))
    }

    void (async () => {
      let last: Error | null = null
      for (let tries = 0; tries < LOCAL_OPEN_ATTEMPTS && !cancelled; tries += 1) {
        try {
          const built = await waitForIt()
          if (!cancelled) setStore(built)
          return
        } catch (err) {
          last = err as Error
        }
      }
      if (cancelled) return
      setStore(null)
      setProblem(last?.message ?? STORE_BUSY_MESSAGE)
    })()
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [attempt, localOpenTimeoutMs, makeLocalStore, makeServerStore, mode])

  const setMode = useCallback(async (next: Mode) => {
    await saveMode(next)
    setModeState(next)
  }, [])

  const retry = useCallback(() => {
    setProblem(null)
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({ store, mode, ready, problem, setMode, retry }),
    [store, mode, ready, problem, setMode, retry],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStoreContext(): StoreContextValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStoreContext must be used inside a StoreProvider')
  return value
}

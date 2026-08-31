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
export const LOCAL_OPEN_TIMEOUT_MS = 1500

/**
 * How many attempts before the app says the database is held by another tab. Eight of them, with
 * a pause between, is about fifteen seconds: reloading a page can leave the handle from the page
 * being replaced held for most of that, and saying "another tab has it" when nothing else is open
 * is worse than a few more seconds of waiting.
 */
export const LOCAL_OPEN_ATTEMPTS = 8

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
     * expo-sqlite's OPFS driver refuses to open a database another page still holds, and reloading
     * the page reliably hits that: the handle from the page being replaced is released a moment
     * later. So each attempt opens again rather than waiting longer on the first one — waiting is
     * useless when the answer was already "no".
     *
     * Nothing closes an attempt that lands late. Opening the same database twice hands back the
     * same cached connection, so closing one breaks the other: that mistake surfaced on screen as
     * "Error code 21: bad parameter or other API misuse".
     */
    const opening: Promise<LayoutStore>[] = []
    const attemptOpen = (): Promise<LayoutStore> => {
      // every open still in flight stays in the race: a database that is merely slow is allowed
      // to finish, while a refusal does not stop a later attempt from succeeding
      opening.push(makeLocalStore())
      const deadline = new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error(STORE_BUSY_MESSAGE)), localOpenTimeoutMs)
      })
      return Promise.race([
        Promise.any(opening).catch((err: AggregateError) => {
          throw (err.errors?.[0] as Error) ?? new Error(STORE_BUSY_MESSAGE)
        }),
        deadline,
      ]).finally(() => clearTimeout(timeout))
    }

    void (async () => {
      let last: Error | null = null
      for (let tries = 0; tries < LOCAL_OPEN_ATTEMPTS && !cancelled; tries += 1) {
        if (tries > 0) await new Promise((resolve) => setTimeout(resolve, localOpenTimeoutMs / 4))
        if (cancelled) return
        try {
          const built = await attemptOpen()
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

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createHttpStore } from '@planmyrack/storage'
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
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({
  children,
  makeLocalStore = createExpoSqliteStore,
  makeServerStore = createHttpStore,
}: {
  children: ReactNode
  makeLocalStore?: (name?: string) => Promise<LayoutStore>
  makeServerStore?: (url: string) => LayoutStore
}) {
  const [mode, setModeState] = useState<Mode | null>(null)
  const [store, setStore] = useState<LayoutStore | null>(null)
  const [ready, setReady] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

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
    if (!mode) {
      setStore(null)
      return
    }
    setProblem(null)
    if (mode.kind === 'server') {
      setStore(makeServerStore(mode.url))
      return
    }
    void makeLocalStore()
      .then((built) => {
        if (!cancelled) setStore(built)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setStore(null)
        setProblem(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [mode, makeLocalStore, makeServerStore])

  const setMode = useCallback(async (next: Mode) => {
    await saveMode(next)
    setModeState(next)
  }, [])

  const value = useMemo(
    () => ({ store, mode, ready, problem, setMode }),
    [store, mode, ready, problem, setMode],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStoreContext(): StoreContextValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStoreContext must be used inside a StoreProvider')
  return value
}

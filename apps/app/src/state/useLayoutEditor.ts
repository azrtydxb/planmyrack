import { useCallback, useEffect, useRef, useState } from 'react'
import { canRedo, canUndo, commit, initHistory, redo, undo } from '@planmyrack/core'
import { StaleRevisionError, StoreUnavailableError } from '@planmyrack/storage'
import type { History, Layout } from '@planmyrack/core'
import type { LayoutStore } from '@planmyrack/storage'

export type SaveState = 'idle' | 'saving' | 'error'

const AUTOSAVE_MS = 600

/**
 * Holds the layout being edited: undo/redo history, debounced autosave, and the two failures
 * that must never look like success — a stale revision and an unreachable store. On either the
 * edit stays on screen and the user is offered a way out.
 */
export function useLayoutEditor(store: LayoutStore | null, initial: Layout) {
  const [history, setHistory] = useState<History<Layout>>(() => initHistory(initial))
  const [saving, setSaving] = useState<SaveState>('idle')
  const [conflict, setConflict] = useState<Layout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Layout | null>(null)

  const layout = history.present

  const save = useCallback(
    async (next: Layout) => {
      if (!store || !next.id) return
      setSaving('saving')
      try {
        const saved = await store.update(next)
        setHistory((h) => ({ ...h, present: { ...h.present, revision: saved.revision } }))
        setSaving('idle')
        setError(null)
      } catch (err) {
        setSaving('error')
        if (err instanceof StaleRevisionError) setConflict(err.current)
        setError(
          err instanceof StaleRevisionError || err instanceof StoreUnavailableError
            ? err.message
            : (err as Error).message,
        )
      }
    },
    [store],
  )

  const apply = useCallback((change: (current: Layout) => Layout) => {
    setHistory((current) => {
      let next: Layout
      try {
        next = change(current.present)
      } catch (err) {
        setError((err as Error).message)
        return current
      }
      pending.current = next
      return commit(current, next)
    })
  }, [])

  // Debounced, so a name being typed does not write on every keystroke.
  useEffect(() => {
    if (pending.current === null) return
    if (timer.current) clearTimeout(timer.current)
    const next = pending.current
    timer.current = setTimeout(() => void save(next), AUTOSAVE_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [layout, save])

  const reload = useCallback(() => {
    if (!conflict) return
    setHistory(initHistory(conflict))
    setConflict(null)
    setSaving('idle')
    setError(null)
  }, [conflict])

  return {
    layout,
    apply,
    undo: () => setHistory((h) => undo(h)),
    redo: () => setHistory((h) => redo(h)),
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    saving,
    conflict,
    error,
    reload,
    saveNow: () => save(layout),
  }
}

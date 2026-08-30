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
  const dirty = useRef(false)
  /** One write at a time: a retry that overlaps the debounced save would be refused as stale. */
  const inFlight = useRef<Promise<void> | null>(null)
  const queued = useRef(false)
  /** State updates after unmount are pointless, and the flush save runs past that point. */
  const alive = useRef(true)
  /**
   * The newest layout INCLUDING the revision the store last handed back. The debounced save reads
   * this rather than the snapshot taken when the edit was made: two quick edits would otherwise
   * send the second one at the revision the first had already superseded, and the store would
   * rightly refuse it as stale — the app conflicting with itself on a single device.
   */
  const latest = useRef<Layout>(initial)

  const layout = history.present
  latest.current = layout

  const save = useCallback(
    (next: Layout): Promise<void> => {
      if (!store || !next.id) return Promise.resolve()
      // Two writes of the same revision cannot both succeed: the second is stale by definition,
      // and the app would raise a conflict against itself. Queue instead, then save whatever is
      // newest once the write in flight lands.
      if (inFlight.current) {
        queued.current = true
        return inFlight.current
      }

      const run = (async () => {
        setSaving('saving')
        try {
          const saved = await store.update(next)
          latest.current = { ...latest.current, revision: saved.revision }
          if (!alive.current) return
          setHistory((h) => ({ ...h, present: { ...h.present, revision: saved.revision } }))
          setSaving('idle')
          setError(null)
        } catch (err) {
          if (!alive.current) return
          setSaving('error')
          if (err instanceof StaleRevisionError) setConflict(err.current)
          setError(
            err instanceof StaleRevisionError || err instanceof StoreUnavailableError
              ? err.message
              : (err as Error).message,
          )
        }
      })().finally(() => {
        inFlight.current = null
        if (queued.current) {
          queued.current = false
          void save(latest.current)
        }
      })

      inFlight.current = run
      return run
    },
    [store],
  )

  const apply = useCallback((change: (current: Layout) => Layout) => {
    // The change runs here rather than inside the updater: setting error state from within a
    // state updater is a side effect React may discard, which is how a refused connection used
    // to fail silently — nothing happened and nothing said why.
    let next: Layout
    try {
      next = change(latest.current)
    } catch (err) {
      setError((err as Error).message)
      return
    }
    dirty.current = true
    setError(null)
    setHistory((current) => commit(current, next))
  }, [])

  /**
   * Debounced, so a name being typed does not write on every keystroke.
   *
   * `dirty` is cleared when the write is dispatched, NOT when the edit is made. A successful save
   * hands back a new revision, which changes `layout` and re-runs this effect; without clearing
   * the flag the effect would schedule another save, that save would bump the revision again, and
   * the layout would autosave forever — revisions climbing about twice a second with nobody
   * touching the app.
   */
  useEffect(() => {
    if (!dirty.current) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      dirty.current = false
      void save(latest.current)
    }, AUTOSAVE_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [layout, save])

  /**
   * An edit made and then left within the debounce window used to be dropped: the effect above
   * clears the timer on unmount, and the timer was the only thing that saved.
   */
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      if (!dirty.current) return
      dirty.current = false
      void save(latest.current)
    }
  }, [save])

  const reload = useCallback(() => {
    if (!conflict) return
    latest.current = conflict
    dirty.current = false
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
    saveNow: () => {
      // Retry, not "write again": with nothing pending and nothing failed there is no reason to
      // spend a revision. Otherwise it replaces the debounced write rather than racing it.
      if (!dirty.current && saving !== 'error') return Promise.resolve()
      if (timer.current) clearTimeout(timer.current)
      dirty.current = false
      return save(latest.current)
    },
  }
}

/** Undo/redo as three plain values; the layout itself stays immutable, so no cloning is needed. */
export interface History<T> {
  present: T
  past: T[]
  future: T[]
}

const LIMIT = 100

export const initHistory = <T>(present: T): History<T> => ({ present, past: [], future: [] })

/** Records an edit. A no-op edit (same value back) is not worth an undo step. */
export function commit<T>(history: History<T>, next: T): History<T> {
  if (next === history.present) return history
  return {
    present: next,
    past: [...history.past, history.present].slice(-LIMIT),
    future: [],
  }
}

export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1)
  if (previous === undefined) return history
  return {
    present: previous,
    past: history.past.slice(0, -1),
    future: [history.present, ...history.future],
  }
}

export function redo<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future
  if (next === undefined) return history
  return { present: next, past: [...history.past, history.present], future: rest }
}

export const canUndo = <T>(history: History<T>): boolean => history.past.length > 0
export const canRedo = <T>(history: History<T>): boolean => history.future.length > 0

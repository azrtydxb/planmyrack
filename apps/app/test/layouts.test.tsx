import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native'
import { DatabaseSync } from 'node:sqlite'
import {
  addDevice,
  exportJson,
  newDevice,
  newLayout,
  newRack,
  updateDevice,
} from '@planmyrack/core'
import { createMemoryStore } from '@planmyrack/storage'
import { LayoutsScreen } from '../src/screens/LayoutsScreen'
import { ConflictDialog } from '../src/ui/ConflictDialog'
import { useLayoutEditor } from '../src/state/useLayoutEditor'
import { createStoreOn } from '../src/storage/sqliteStore'
import type { SqliteLike } from '../src/storage/sqliteStore'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore } from '@planmyrack/storage'

const rack = newRack({ id: 'R', units: 12 })
const seeded: Layout = addDevice(
  newLayout('Basement', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 2, type: 'server' }),
)

const nodeSqlite = (): SqliteLike => {
  const db = new DatabaseSync(':memory:')
  return {
    async execAsync(source) {
      db.exec(source)
    },
    async runAsync(source, ...params) {
      return { changes: Number(db.prepare(source).run(...(params as never[])).changes) }
    },
    async getAllAsync<T>(source: string, ...params: unknown[]) {
      return db.prepare(source).all(...(params as never[])) as T[]
    },
    async getFirstAsync<T>(source: string, ...params: unknown[]) {
      return (db.prepare(source).get(...(params as never[])) ?? null) as T | null
    },
    async closeAsync() {
      db.close()
    },
  }
}

const makeStores: [string, () => Promise<LayoutStore>][] = [
  ['local', async () => createStoreOn(nodeSqlite())],
  ['memory', async () => createMemoryStore()],
]

describe('TestLayoutCrudInBothModes — through the UI', () => {
  it.each(makeStores)('lists, creates and opens in %s mode', async (_mode, make) => {
    const store = await make()
    await store.create(newLayout('Existing rack'))
    const onOpen = jest.fn()

    render(<LayoutsScreen store={store} onOpen={onOpen} />)
    await screen.findByText('Existing rack')

    fireEvent.press(screen.getByRole('button', { name: 'New layout' }))
    await waitFor(() => expect(onOpen).toHaveBeenCalled())
    expect((await store.list()).length).toBe(2)
  })
})

describe('TestLocalModePersistsWithoutNetwork', () => {
  it('keeps edits with fetch disabled, across a fresh mount', async () => {
    const originalFetch = global.fetch
    const fetchSpy = jest.fn(() => {
      throw new Error('network disabled')
    })
    global.fetch = fetchSpy as unknown as typeof fetch

    try {
      const store = await createStoreOn(nodeSqlite())
      const saved = await store.create(seeded)

      const first = renderHook(() => useLayoutEditor(store, saved))
      act(() => first.result.current.apply((l) => updateDevice(l, 'd1', { name: 'Offline NAS' })))
      await waitFor(
        async () => expect((await store.get(saved.id!)).devices[0]!.name).toBe('Offline NAS'),
        { timeout: 3000 },
      )
      first.unmount()

      const reopened = await store.get(saved.id!)
      const second = renderHook(() => useLayoutEditor(store, reopened))
      expect(second.result.current.layout.devices[0]!.name).toBe('Offline NAS')
      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      global.fetch = originalFetch
    }
  })
})

describe('TestStaleSaveRejected — through the UI', () => {
  it('shows the conflict dialog and offers reload or JSON export', async () => {
    const store = createMemoryStore()
    const saved = await store.create(seeded)
    // another device saves first, so this editor's revision is now stale
    await store.update({ ...saved, name: 'theirs' })

    const { result } = renderHook(() => useLayoutEditor(store, saved))
    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'mine' })))

    await waitFor(() => expect(result.current.conflict).not.toBeNull(), { timeout: 3000 })
    expect(result.current.layout.devices[0]!.name).toBe('mine')

    const onExportJson = jest.fn()
    render(
      <ConflictDialog
        current={result.current.conflict}
        onReload={result.current.reload}
        onExportJson={onExportJson}
      />,
    )
    expect(screen.getByText(/changed on another device/)).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'Export to JSON' }))
    expect(onExportJson).toHaveBeenCalled()

    act(() => result.current.reload())
    expect(result.current.layout.name).toBe('theirs')
  })
})

describe('TestImportRejectsBadSchema — through the UI', () => {
  it('names the problem and adds nothing to the list', async () => {
    const store = createMemoryStore()
    render(<LayoutsScreen store={store} pickJson={async () => 'nonsense{'} />)

    fireEvent.press(screen.getByRole('button', { name: 'Import JSON' }))

    await screen.findByTestId('import-error')
    expect(screen.getByTestId('import-error')).toHaveTextContent(
      /That file isn't a layout this version can open/,
    )
    expect(await store.list()).toHaveLength(0)
  })
})

describe('TestImportOfDuplicateNameKeepsBoth', () => {
  it('imports a layout whose name already exists without overwriting the first', async () => {
    const store = createMemoryStore()
    const existing = await store.create(seeded)

    render(<LayoutsScreen store={store} pickJson={async () => exportJson(existing)} />)
    fireEvent.press(screen.getByRole('button', { name: 'Import JSON' }))

    await waitFor(async () => expect(await store.list()).toHaveLength(2))
    const names = (await store.list()).map((s) => s.name)
    expect(names).toEqual(['Basement', 'Basement'])
  })
})

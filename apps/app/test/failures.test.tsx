import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native'
import { Platform } from 'react-native'
import { addDevice, newDevice, newLayout, newRack, updateDevice } from '@planmyrack/core'
import { createHttpStore, StoreUnavailableError } from '@planmyrack/storage'
import {
  canUseLocalStore,
  classifyStorageError,
  lastServerStatus,
  recordServerStatus,
} from '../src/storage/capabilities'
import { StorageProblem } from '../src/ui/StorageProblem'
import { useLayoutEditor } from '../src/state/useLayoutEditor'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore } from '@planmyrack/storage'

const rack = newRack({ id: 'R', units: 12 })
const seeded: Layout = addDevice(
  newLayout('Basement', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'server' }),
)

const withWeb = async (run: () => Promise<void>) => {
  const original = Platform.OS
  Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
  try {
    await run()
  } finally {
    Object.defineProperty(Platform, 'OS', { value: original, configurable: true })
  }
}

describe('TestCorruptLocalDatabaseIsReported', () => {
  it('says the database could not be read, offers JSON import, and deletes nothing', () => {
    const problem = classifyStorageError(new Error('file is not a database'))
    expect(problem.kind).toBe('corrupt')
    expect(problem.detail).toMatch(/couldn't read the layouts stored on this device/i)
    expect(problem.detail).toMatch(/Nothing has been deleted/i)

    const onImportJson = jest.fn()
    render(<StorageProblem problem={problem} onImportJson={onImportJson} />)
    fireEvent.press(screen.getByRole('button', { name: 'Import JSON' }))
    expect(onImportJson).toHaveBeenCalled()
  })
})

describe('TestBrowserWithoutOpfsRefusesLocalMode', () => {
  it('refuses when the page is not cross-origin isolated, and says why', async () => {
    await withWeb(async () => {
      Object.defineProperty(globalThis, 'crossOriginIsolated', { value: false, configurable: true })
      Object.defineProperty(globalThis, 'navigator', {
        value: { storage: { getDirectory: () => undefined } },
        configurable: true,
      })

      const capability = await canUseLocalStore()
      expect(capability.ok).toBe(false)
      expect(capability.reason).toMatch(/cross-origin isolated/i)
    })
  })

  it('refuses when the browser has no OPFS at all', async () => {
    await withWeb(async () => {
      Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true })
      const capability = await canUseLocalStore()
      expect(capability.ok).toBe(false)
      expect(capability.reason).toMatch(/can't store layouts on your device/i)
    })
  })

  it('offers server mode instead of losing data on refresh', () => {
    const onSwitchMode = jest.fn()
    render(
      <StorageProblem
        problem={{ kind: 'unsupported', detail: 'no OPFS here' }}
        onSwitchMode={onSwitchMode}
      />,
    )
    fireEvent.press(screen.getByRole('button', { name: 'Connect to a server' }))
    expect(onSwitchMode).toHaveBeenCalled()
  })

  it('says nothing on native, where there is always a local database', async () => {
    expect(await canUseLocalStore()).toEqual({ ok: true })
  })
})

describe('TestQuotaExceededKeepsTheLayoutInMemory', () => {
  it('fails loudly, keeps the edit on screen and offers JSON export', async () => {
    const store: LayoutStore = {
      list: async () => [],
      get: async () => seeded,
      create: async (l) => ({ ...l, id: 'x', revision: 1 }),
      update: async () => {
        throw new Error('database or disk is full')
      },
      remove: async () => undefined,
      listTemplates: async () => [],
      saveTemplate: async (t) => t,
      removeTemplate: async () => undefined,
    }

    const { result } = renderHook(() => useLayoutEditor(store, { ...seeded, id: 'x', revision: 1 }))
    act(() => result.current.apply((l) => updateDevice(l, 'd1', { name: 'Kept' })))

    await waitFor(() => expect(result.current.saving).toBe('error'), { timeout: 3000 })
    expect(result.current.layout.devices[0]!.name).toBe('Kept')

    const problem = classifyStorageError(new Error(result.current.error ?? ''))
    expect(problem.kind).toBe('full')

    const onExportJson = jest.fn()
    render(<StorageProblem problem={problem} onExportJson={onExportJson} />)
    fireEvent.press(screen.getByRole('button', { name: 'Export to JSON' }))
    expect(onExportJson).toHaveBeenCalled()
  })
})

describe('TestIosLocalNetworkDenialIsNamed', () => {
  it('says the permission was denied rather than showing a generic timeout', () => {
    const problem = classifyStorageError(new Error('NSLocalNetworkDenied'))
    expect(problem.kind).toBe('permission')
    expect(problem.detail).toMatch(/local network access is turned off/i)

    const onOpenSettings = jest.fn()
    render(<StorageProblem problem={problem} onOpenSettings={onOpenSettings} />)
    fireEvent.press(screen.getByRole('button', { name: 'Open Settings' }))
    expect(onOpenSettings).toHaveBeenCalled()
  })
})

describe('TestServerErrorsAreShownForDiagnosis', () => {
  it('treats a 500 as unreachable and records the status for settings', async () => {
    const broken = (async () => new Response('boom', { status: 500 })) as unknown as typeof fetch
    const store = createHttpStore('http://example.test', broken)

    await expect(store.list()).rejects.toThrow(StoreUnavailableError)

    recordServerStatus({ url: 'http://example.test', status: 500, at: '2026-08-30T12:00:00Z' })
    expect(lastServerStatus()).toMatchObject({ status: 500, url: 'http://example.test' })
  })
})

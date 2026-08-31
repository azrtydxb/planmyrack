import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Text } from 'react-native'
import { createMemoryStore } from '@planmyrack/storage'
import { LOCAL_OPEN_ATTEMPTS, StoreProvider, useStoreContext } from '../src/storage/StoreProvider'
import { STORE_BUSY_MESSAGE, classifyStorageError } from '../src/storage/capabilities'
import { StorageProblem } from '../src/ui/StorageProblem'
import { FirstRunScreen } from '../src/screens/FirstRunScreen'
import { SettingsScreen } from '../src/screens/SettingsScreen'
import { loadMode, saveMode } from '../src/storage/settings'
import type { LayoutStore } from '@planmyrack/storage'
import type { Mode } from '../src/storage/settings'

jest.mock('@planmyrack/storage', () => {
  const actual = jest.requireActual('@planmyrack/storage')
  return { ...actual, probeServer: jest.fn() }
})
const { probeServer } = jest.requireMock('@planmyrack/storage') as {
  probeServer: jest.Mock
}

/** Renders whatever the provider is offering, so a test can assert on it. */
function Probe() {
  const { store, problem, retry } = useStoreContext()
  if (problem) {
    return <StorageProblem problem={classifyStorageError(new Error(problem))} onRetry={retry} />
  }
  return <Text>{store ? 'store ready' : 'opening'}</Text>
}

const seedStore = async (name: string): Promise<LayoutStore> => {
  const { newLayout } = jest.requireActual('@planmyrack/core')
  const store = createMemoryStore()
  await store.create(newLayout(name))
  return store
}

describe('TestModeChooserAndHealthProbe', () => {
  beforeEach(() => probeServer.mockReset())

  it('stores the picked mode when the user chooses this device', async () => {
    const onChoose = jest.fn(async (mode: Mode) => saveMode(mode))
    render(<FirstRunScreen onChoose={onChoose} />)

    fireEvent.press(screen.getByRole('button', { name: 'Work on this device only' }))

    await waitFor(() => expect(onChoose).toHaveBeenCalledWith({ kind: 'local' }))
    await expect(loadMode()).resolves.toEqual({ kind: 'local' })
  })

  it('reports a failed connection test by name and refuses to use that server', async () => {
    probeServer.mockResolvedValue({ ok: false, reason: 'No answer from that address.' })
    render(<FirstRunScreen onChoose={jest.fn()} />)

    fireEvent.changeText(
      screen.getByPlaceholderText('http://192.168.1.20:8787'),
      'http://127.0.0.1:1',
    )
    fireEvent.press(screen.getByText('Test connection'))

    await screen.findByText(/Can't reach the server/)
    expect(screen.getByText('Use this server')).toBeDisabled()
  })

  it('enables the server once the probe succeeds', async () => {
    probeServer.mockResolvedValue({ ok: true, version: '0.1.0' })
    const onChoose = jest.fn()
    render(<FirstRunScreen onChoose={onChoose} />)

    fireEvent.changeText(
      screen.getByPlaceholderText('http://192.168.1.20:8787'),
      'http://rack:8787',
    )
    fireEvent.press(screen.getByRole('button', { name: 'Test connection' }))
    await screen.findByText(/Connected to PlanMyRack/)

    fireEvent.press(screen.getByRole('button', { name: 'Use this server' }))
    expect(onChoose).toHaveBeenCalledWith({ kind: 'server', url: 'http://rack:8787' })
  })
})

describe('TestSecondTabSaysWhyInsteadOfSpinning', () => {
  it('reports the database as held elsewhere when it will not open', async () => {
    // expo-sqlite's OPFS driver does not reject while another tab holds the database — it waits,
    // and the app showed a spinner for ever with nothing to say
    const held = () => new Promise<LayoutStore>(() => {})
    await saveMode({ kind: 'local' })

    render(
      <StoreProvider makeLocalStore={held} localOpenTimeoutMs={20}>
        <Probe />
      </StoreProvider>,
    )

    await screen.findByText(STORE_BUSY_MESSAGE)
    expect(screen.getByTestId('storage-problem-busy')).toBeTruthy()
  })

  it("recognises the browser's own words for a database another page holds", () => {
    const raw = new Error(
      "NoModificationAllowedError: Failed to execute 'createSyncAccessHandle' on " +
        "'FileSystemFileHandle': Access Handles cannot be created if there is another open " +
        'Access Handle or Writable stream associated with the same file.',
    )
    expect(classifyStorageError(raw)).toEqual({ kind: 'busy', detail: STORE_BUSY_MESSAGE })
  })

  it('opens without complaint when the database is merely slow', async () => {
    // reloading the page always loses the first attempt: the handle from the page being replaced
    // has not been released yet, and the open lands a moment later
    await saveMode({ kind: 'local' })
    const slow = () =>
      new Promise<LayoutStore>((resolve) => setTimeout(() => resolve(createMemoryStore()), 40))

    render(
      <StoreProvider makeLocalStore={slow} localOpenTimeoutMs={20}>
        <Probe />
      </StoreProvider>,
    )

    await screen.findByText('store ready')
    expect(screen.queryByText(STORE_BUSY_MESSAGE)).toBeNull()
  })

  it('opens the store again when the other tab has gone', async () => {
    await saveMode({ kind: 'local' })
    let opens = 0
    // every attempt of the first mount hangs; the tab holding the database closes before Retry
    const openOnRetry = () => {
      opens += 1
      return opens <= LOCAL_OPEN_ATTEMPTS
        ? new Promise<LayoutStore>(() => {})
        : Promise.resolve(createMemoryStore())
    }

    render(
      <StoreProvider makeLocalStore={openOnRetry} localOpenTimeoutMs={20}>
        <Probe />
      </StoreProvider>,
    )
    await screen.findByText(STORE_BUSY_MESSAGE)

    fireEvent.press(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByText('store ready')
  })

  it('opens again on each attempt rather than waiting longer on the first', async () => {
    // the driver refuses a database another page holds; waiting longer on a refusal changes
    // nothing, so each attempt asks again
    await saveMode({ kind: 'local' })
    let opens = 0
    const refuseThenOpen = async () => {
      opens += 1
      if (opens < 3) throw new Error('NoModificationAllowedError: another open Access Handle')
      return createMemoryStore()
    }

    render(
      <StoreProvider makeLocalStore={refuseThenOpen} localOpenTimeoutMs={20}>
        <Probe />
      </StoreProvider>,
    )

    await screen.findByText('store ready')
    expect(opens).toBe(3)
  })

  it('closes nothing it opened: the same database twice is the same connection', async () => {
    // closing an attempt that landed late broke the one in use — "Error code 21: bad parameter"
    await saveMode({ kind: 'local' })
    const close = jest.fn()
    const store = { ...createMemoryStore(), close } as unknown as LayoutStore
    let opens = 0
    const slowThenSame = async () => {
      opens += 1
      if (opens === 1) await new Promise((resolve) => setTimeout(resolve, 60))
      return store
    }

    render(
      <StoreProvider makeLocalStore={slowThenSame} localOpenTimeoutMs={20}>
        <Probe />
      </StoreProvider>,
    )

    await screen.findByText('store ready')
    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(close).not.toHaveBeenCalled()
  })
})

describe('TestModeSwitchRelistsLayouts', () => {
  it("lists the other store's layouts after switching mode in settings", async () => {
    probeServer.mockResolvedValue({ ok: true, version: '0.1.0' })
    const local = await seedStore('Local rack')
    const server = await seedStore('Server rack')

    render(
      <SettingsScreen
        mode={{ kind: 'local' }}
        store={local}
        onSetMode={jest.fn()}
        storeForPreview={(mode) => (mode.kind === 'local' ? local : server)}
      />,
    )
    await screen.findByText('Local rack')

    fireEvent.changeText(screen.getByLabelText('Server address'), 'http://rack:8787')
    fireEvent.press(screen.getByRole('button', { name: 'Use this server' }))

    await screen.findByText('Server rack')
    expect(screen.queryByText('Local rack')).toBeNull()
  })
})

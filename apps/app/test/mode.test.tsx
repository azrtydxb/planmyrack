import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { createMemoryStore } from '@planmyrack/storage'
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

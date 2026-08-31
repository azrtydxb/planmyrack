import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { addDevice, addRack, newDevice, newLayout, newRack } from '@planmyrack/core'
import { createMemoryStore } from '@planmyrack/storage'
import { RackEditorScreen, nextRackName } from '../src/screens/RackEditorScreen'
import type { Layout } from '@planmyrack/core'

const rack = newRack({ id: 'R', name: 'Rack A', units: 12 })
const seeded: Layout = addDevice(
  newLayout('Basement', [rack]),
  newDevice({ id: 'd1', rackId: 'R', face: 'front', posU: 8, heightU: 2, type: 'server' }),
)

const setWidth = (width: number) =>
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width, height: 900, scale: 2, fontScale: 2 })

const openRackSettings = () => fireEvent.press(screen.getByTestId('rack-settings-R'))

describe('TestRackNamesAreTellableApart', () => {
  it('names each new rack after the next free letter', () => {
    expect(nextRackName([])).toBe('Rack A')
    expect(nextRackName([{ name: 'Rack A' }])).toBe('Rack B')
    expect(nextRackName([{ name: 'Rack A' }, { name: 'Rack B' }])).toBe('Rack C')
  })
})

describe('TestRackCanBeRenamedResizedAndRemoved', () => {
  afterEach(() => jest.restoreAllMocks())

  it('exposes the settings gear as its own control, not merged into the chip', () => {
    // iOS merges an accessible view's children into one element: on an iPad the gear was drawn
    // but VoiceOver — and every automation — could only see the chip
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)
    expect(screen.getByLabelText('Rack settings for Rack A')).toBeTruthy()
    expect(screen.getByLabelText('Rack A, 12U')).toBeTruthy()
  })

  it('renames a rack and switches it to the 10-inch standard', async () => {
    setWidth(1440)
    const store = createMemoryStore()
    render(<RackEditorScreen store={store} initial={seeded} />)

    openRackSettings()
    // the name is shown once, and edited in place behind a Rename button
    fireEvent.press(screen.getByRole('button', { name: 'Rename rack' }))
    fireEvent.changeText(screen.getByLabelText('Rack name'), 'Comms cupboard')
    fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    fireEvent.press(screen.getByLabelText('10" rack'))

    await waitFor(() => expect(screen.getAllByText('Comms cupboard').length).toBeGreaterThan(0))
    expect(screen.getByTestId('rack-R').props.style).toBeTruthy()
    // 10" bodies are narrower than 19" ones; the canvas must have re-measured
    const style = screen.getByTestId('rack-R').props.style as { width: number }[]
    expect(JSON.stringify(style)).toContain('139')
  })

  it('shows the rack name once, not twice', () => {
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)
    openRackSettings()

    // the panel title was the name, and a RACK NAME field under it repeated it
    expect(screen.queryAllByDisplayValue('Rack A')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Rename rack' })).toBeTruthy()
  })

  it('keeps every device and cable attached when a rack is renamed', async () => {
    setWidth(1440)
    const store = createMemoryStore()
    render(<RackEditorScreen store={store} initial={seeded} />)

    openRackSettings()
    fireEvent.press(screen.getByRole('button', { name: 'Rename rack' }))
    fireEvent.changeText(screen.getByLabelText('Rack name'), 'Loft')
    fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getAllByText('Loft').length).toBeGreaterThan(0))
    // the device is still in the rack it was in: a rack is referred to by id, never by name
    expect(screen.getByLabelText(/Server 2U, 2U at U9/)).toBeTruthy()
  })

  it('refuses a resize that would strand a device and says why', () => {
    setWidth(1440)
    const store = createMemoryStore()
    render(<RackEditorScreen store={store} initial={seeded} />)

    openRackSettings()
    fireEvent.press(screen.getByLabelText('6U rack'))

    expect(screen.getByTestId('rack-error')).toBeTruthy()
    expect(screen.getByText(/move them first/)).toBeTruthy()
    // the rack keeps its height rather than dropping the device off the top
    expect(screen.getByLabelText('Rack A, 12U')).toBeTruthy()
  })

  it('removes a rack with its devices once confirmed', async () => {
    setWidth(1440)
    const store = createMemoryStore()
    const two = addRack(seeded, newRack({ id: 'R2', name: 'Rack B', units: 9 }))
    render(<RackEditorScreen store={store} initial={two} />)

    openRackSettings()
    fireEvent.press(screen.getByRole('button', { name: 'Delete rack' }))
    fireEvent.press(screen.getByRole('button', { name: 'Delete rack for good' }))

    await waitFor(() => expect(screen.queryByLabelText('Rack A, 12U')).toBeNull())
    expect(screen.getByLabelText('Rack B, 9U')).toBeTruthy()
  })

  it('keeps the last rack: there is nothing to plan without one', () => {
    setWidth(1440)
    const store = createMemoryStore()
    render(<RackEditorScreen store={store} initial={seeded} />)

    openRackSettings()
    expect(screen.queryByRole('button', { name: 'Delete rack' })).toBeNull()
  })
})

describe('TestWidePanelsLeaveRoomForTheCanvas', () => {
  afterEach(() => jest.restoreAllMocks())

  it('opens the library beside the canvas on a desktop', () => {
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)
    expect(screen.getByTestId('library-panel')).toBeTruthy()
  })

  it('closes the library while a side panel is open on a tablet', () => {
    // an iPad in portrait left the canvas 130px wide with both panels open
    setWidth(820)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)
    expect(screen.queryByTestId('library-panel')).toBeNull()

    fireEvent.press(screen.getByRole('button', { name: 'Library' }))
    expect(screen.getByTestId('library-panel')).toBeTruthy()

    openRackSettings()
    expect(screen.queryByTestId('library-panel')).toBeNull()
    expect(screen.getByTestId('rack-panel')).toBeTruthy()
  })

  it('reaches the cable schedule and the exports at desktop width', () => {
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)

    fireEvent.press(screen.getByRole('button', { name: 'Cables' }))
    expect(screen.getByText('Export CSV')).toBeTruthy()

    fireEvent.press(screen.getByRole('button', { name: 'Stats' }))
    expect(screen.getByText('Parts CSV')).toBeTruthy()
  })
})

describe('TestNamesAreShownOnceAndEditedInPlace', () => {
  afterEach(() => jest.restoreAllMocks())

  it('renames the layout from the header', async () => {
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)

    fireEvent.press(screen.getByRole('button', { name: 'Rename layout' }))
    fireEvent.changeText(screen.getByLabelText('Layout name'), 'Home lab')
    fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getByText('Home lab')).toBeTruthy())
  })

  it('renames the rack from the summary panel, where its name is shown', async () => {
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)

    // nothing selected: the right panel is the rack summary
    expect(screen.getByTestId('summary-panel')).toBeTruthy()
    // the summary card inside the panel used to repeat the panel's own title
    expect(within(screen.getByTestId('summary-panel')).getAllByText('Rack A')).toHaveLength(1)

    fireEvent.press(screen.getByRole('button', { name: 'Rename rack' }))
    fireEvent.changeText(screen.getByLabelText('Rack name'), 'Loft')
    fireEvent.press(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.getAllByText('Loft').length).toBeGreaterThan(0))
  })

  it('opens and closes the library from the rail instead of repeating the canvas', () => {
    // Racks and Library showed the identical screen on a desktop, where the library is always open
    setWidth(1440)
    render(<RackEditorScreen store={createMemoryStore()} initial={seeded} />)
    expect(screen.getByTestId('library-panel')).toBeTruthy()

    fireEvent.press(screen.getByRole('button', { name: 'Library' }))
    expect(screen.queryByTestId('library-panel')).toBeNull()

    fireEvent.press(screen.getByRole('button', { name: 'Library' }))
    expect(screen.getByTestId('library-panel')).toBeTruthy()
  })
})

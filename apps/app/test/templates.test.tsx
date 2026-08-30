import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native'
import { deviceFromTemplate, newDevice } from '@planmyrack/core'
import { createMemoryStore } from '@planmyrack/storage'
import { Palette } from '../src/ui/Palette'
import { useTemplates } from '../src/state/useTemplates'

const configured = newDevice({
  rackId: 'R',
  face: 'front',
  posU: 0,
  heightU: 1,
  type: 'switch',
  name: 'UDM Pro',
  ports: 10,
  watts: 33,
  colour: '#a855f7',
})

describe('TestTemplateRoundTrip', () => {
  it('saves a configured device and drops it into another layout unchanged', async () => {
    const store = createMemoryStore()
    const { result } = renderHook(() => useTemplates(store))

    await act(() => result.current.save(configured))
    await waitFor(() => expect(result.current.templates).toHaveLength(1))

    const placed = deviceFromTemplate(result.current.templates[0]!, {
      rackId: 'r2',
      face: 'front',
      posU: 0,
    })
    expect(placed).toMatchObject({
      name: 'UDM Pro',
      ports: 10,
      watts: 33,
      colour: '#a855f7',
      rackId: 'r2',
    })
  })

  it('shows saved gear in the palette and removes it again', async () => {
    const store = createMemoryStore()
    const { result } = renderHook(() => useTemplates(store))
    await act(() => result.current.save(configured))
    await waitFor(() => expect(result.current.templates).toHaveLength(1))

    render(<Palette templates={result.current.templates} onPick={jest.fn()} />)
    // saved gear sits behind the Saved tab in the design's library
    fireEvent.press(screen.getByRole('button', { name: 'Saved' }))
    expect(screen.getByText('MY GEAR')).toBeTruthy()
    expect(screen.getByLabelText('UDM Pro')).toBeTruthy()

    await act(() => result.current.remove(result.current.templates[0]!.id))
    await waitFor(() => expect(result.current.templates).toHaveLength(0))
  })
})

describe('TestBundledCatalogueShape — in the palette', () => {
  it('lists catalogue entries before any template is saved', () => {
    render(<Palette templates={[]} onPick={jest.fn()} />)
    expect(screen.getByText('UNIFI')).toBeTruthy()
    expect(screen.getByText('MIKROTIK')).toBeTruthy()
    expect(screen.getAllByTestId(/^catalog-entry-/).length).toBeGreaterThan(10)
    expect(screen.queryByText('MY GEAR')).toBeNull()
  })

  it('offers every device type and size as a bare shape too', () => {
    render(<Palette templates={[]} onPick={jest.fn()} />)
    expect(screen.getByTestId('palette-hooks-0.5')).toBeTruthy()
    expect(screen.getByTestId('palette-switch-2')).toBeTruthy()
  })
})

import { fireEvent, render, screen } from '@testing-library/react-native'
import { Dimensions } from 'react-native'
import { addDevice, addToMount, newDevice, newLayout, newRack } from '@planmyrack/core'
import { createMemoryStore } from '@planmyrack/storage'
import { RackEditorScreen } from '../src/screens/RackEditorScreen'
import { RackCanvas } from '../src/canvas/RackCanvas'
import { labelGutter, slotRects } from '../src/canvas/metrics'
import { slotUnder } from '../src/canvas/origins'
import type { Layout } from '@planmyrack/core'

const rack = newRack({ id: 'R', units: 12 })
const tray = newDevice({
  id: 'tray',
  rackId: 'R',
  face: 'front',
  posU: 0,
  heightU: 1,
  type: 'mount',
  name: 'Pi tray',
  slots: 2,
})
const withTray: Layout = addDevice(newLayout('mounts', [rack]), tray)
const board = (id: string) =>
  newDevice({
    id,
    rackId: 'R',
    face: 'front',
    posU: 0,
    heightU: 1,
    type: 'sbc',
    name: id,
    ports: 2,
  })

describe('TestMountShowsItsCutOutsAndWhatIsInThem', () => {
  it('draws an empty cut-out per slot, and the board that fills one', () => {
    render(<RackCanvas layout={withTray} face="front" />)
    expect(screen.getByTestId('mount-slot-tray-0')).toBeTruthy()
    expect(screen.getByTestId('mount-slot-tray-1')).toBeTruthy()
    // iOS announced the cut-out as its "+" glyph until it carried its own label
    expect(screen.getByLabelText(/Pi tray slot 1, empty/)).toBeTruthy()

    const loaded = addToMount(withTray, tray, 0, board('pi'))
    screen.rerender(<RackCanvas layout={loaded} face="front" />)
    expect(screen.getByTestId('mounted-pi')).toBeTruthy()
    expect(screen.getByTestId('mount-slot-tray-1')).toBeTruthy()
    expect(screen.queryByTestId('mount-slot-tray-0')).toBeNull()
  })

  it('gives a mounted board its own ports, wired like any other device', () => {
    const loaded = addToMount(withTray, tray, 0, board('pi'))
    const onPortPress = jest.fn()
    render(<RackCanvas layout={loaded} face="front" onPortPress={onPortPress} />)

    fireEvent.press(screen.getByLabelText('pi port 2, free'))
    expect(onPortPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'pi' }), 1, 'network')
  })

  it('divides the tray into as many cut-outs as it has slots', () => {
    expect(slotRects({ ...tray, slots: 2 }, 264, 34)).toHaveLength(2)
    expect(slotRects({ ...tray, slots: 4 }, 264, 34)).toHaveLength(4)
    expect(slotRects({ ...tray, slots: 0 }, 264, 34)).toHaveLength(0)
    const [first, second] = slotRects({ ...tray, slots: 2 }, 264, 34)
    expect(second!.x).toBeGreaterThan(first!.x + first!.width - 1)
    // the tray's own name is drawn at the left, so the cut-outs start after the gutter
    expect(first!.x).toBeGreaterThanOrEqual(labelGutter(264))
    expect(second!.x + second!.width).toBeLessThanOrEqual(264)
  })
})

describe('TestBoardDroppedOnACutOutLandsInIt', () => {
  const origins = { R: { x: 0, y: 0 } }

  it('finds the cut-out under the pointer and says whether it is free', () => {
    const rects = slotRects(tray, 264, 34)
    // the tray is at the bottom of a 12U rack: 11 units down the canvas
    const y = (12 - 1) * 34 + rects[0]!.y + 2
    const hit = slotUnder(withTray, 'front', origins, { x: rects[0]!.x + 2, y })
    expect(hit).toMatchObject({ slot: 0, taken: false })
    expect(hit!.mount.id).toBe('tray')

    const loaded = addToMount(withTray, tray, 0, board('pi'))
    expect(slotUnder(loaded, 'front', origins, { x: rects[0]!.x + 2, y })).toMatchObject({
      taken: true,
    })
  })

  it('is null away from any tray', () => {
    expect(slotUnder(withTray, 'front', origins, { x: 5, y: 5 })).toBeNull()
    // and on the rear face, where the tray is not
    const rects = slotRects(tray, 264, 34)
    const y = (12 - 1) * 34 + rects[0]!.y + 2
    expect(slotUnder(withTray, 'rear', origins, { x: rects[0]!.x + 2, y })).toBeNull()
  })
})

describe('TestMountIsPlacedAndFilledFromTheLibrary', () => {
  afterEach(() => jest.restoreAllMocks())

  it('offers a tray whose cut-out count is dialled in before it is dragged', () => {
    jest
      .spyOn(Dimensions, 'get')
      .mockReturnValue({ width: 1440, height: 900, scale: 2, fontScale: 2 })
    render(<RackEditorScreen store={createMemoryStore()} initial={newLayout('empty', [rack])} />)

    expect(screen.getByTestId('catalog-entry-generic-mount')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'SBC mount: one more slots' })).toBeTruthy()
  })

  it('lists the boards that go in one', () => {
    jest
      .spyOn(Dimensions, 'get')
      .mockReturnValue({ width: 1440, height: 900, scale: 2, fontScale: 2 })
    render(<RackEditorScreen store={createMemoryStore()} initial={newLayout('empty', [rack])} />)

    expect(screen.getByTestId('catalog-entry-rpi-5')).toBeTruthy()
    expect(screen.getByTestId('catalog-entry-orangepi-5-plus')).toBeTruthy()
  })
})

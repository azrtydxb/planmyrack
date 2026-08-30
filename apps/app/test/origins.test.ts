import { bodyOrigins, canvasPoint, rackUnder } from '../src/canvas/origins'

describe('TestCableOriginsSumTheLayoutChain', () => {
  it('adds the body position to its frame position', () => {
    // onLayout is parent-relative: the body sits inside the frame, the frame inside the row
    const origins = bodyOrigins({ A: { x: 16, y: 8 } }, { A: { x: 30, y: 8 } })
    expect(origins.A).toEqual({ x: 46, y: 16 })
  })

  it('ignores a rack whose frame has not been measured yet', () => {
    expect(bodyOrigins({}, { A: { x: 30, y: 8 } })).toEqual({})
  })

  it('keeps racks apart rather than reusing one offset', () => {
    const origins = bodyOrigins(
      { A: { x: 16, y: 8 }, B: { x: 400, y: 8 } },
      { A: { x: 30, y: 8 }, B: { x: 30, y: 8 } },
    )
    expect(origins.A!.x).toBe(46)
    expect(origins.B!.x).toBe(430)
  })
})

describe('TestDropLandsOnTheRackUnderTheFinger', () => {
  const rack = { id: 'A', width: 19 as const, units: 12 }
  const other = { id: 'B', width: 10 as const, units: 6 }
  const origins = { A: { x: 30, y: 20 }, B: { x: 400, y: 20 } }

  it('finds the rack whose body contains the point', () => {
    expect(rackUnder([rack, other], origins, { x: 100, y: 100 })?.rack.id).toBe('A')
    expect(rackUnder([rack, other], origins, { x: 460, y: 100 })?.rack.id).toBe('B')
  })

  it('reports the body top, which is what a drop position is measured from', () => {
    expect(rackUnder([rack], origins, { x: 100, y: 100 })?.topY).toBe(20)
  })

  it('is null in the gap between racks and below the last unit', () => {
    expect(rackUnder([rack, other], origins, { x: 350, y: 100 })).toBeNull()
    expect(rackUnder([rack], origins, { x: 100, y: 20 + 12 * 34 + 1 })).toBeNull()
  })

  it('ignores a rack that has not reported its layout yet', () => {
    expect(rackUnder([rack], {}, { x: 100, y: 100 })).toBeNull()
  })
})

describe('TestCanvasPointFollowsScrollAndZoom', () => {
  const view = { origin: { x: 100, y: 50 }, scrollX: 0, scale: 1, translate: { x: 0, y: 0 } }

  it('is the offset from the stage when nothing is scrolled or zoomed', () => {
    expect(canvasPoint({ x: 140, y: 90 }, view)).toEqual({ x: 40, y: 40 })
  })

  it('adds the horizontal scroll, which moves the content under a fixed stage', () => {
    expect(canvasPoint({ x: 140, y: 90 }, { ...view, scrollX: 200 })).toEqual({ x: 240, y: 40 })
  })

  it('divides out the zoom, so a drop lands where the pointer looks', () => {
    expect(canvasPoint({ x: 140, y: 90 }, { ...view, scale: 2 })).toEqual({ x: 20, y: 20 })
  })

  it('subtracts a two-finger pan before dividing', () => {
    expect(
      canvasPoint({ x: 140, y: 90 }, { ...view, scale: 2, translate: { x: 20, y: 10 } }),
    ).toEqual({ x: 10, y: 15 })
  })
})

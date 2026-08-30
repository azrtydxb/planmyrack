import { bodyOrigins } from '../src/canvas/origins'

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

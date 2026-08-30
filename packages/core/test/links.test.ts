import { describe, it, expect } from 'vitest'
import {
  PortBusyError,
  addDevice,
  connect,
  disconnect,
  newDevice,
  newLayout,
  newRack,
  portLink,
  removeDevice,
  updateDevice,
} from '../src/index.js'
import type { Layout } from '../src/index.js'

/** The failure code is the contract; the message is for humans and may be reworded. */
const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn()
  } catch (err) {
    return (err as { code?: string }).code
  }
  return undefined
}

const rack = newRack({ id: 'R', units: 24 })
const seed = (): Layout => {
  let l = newLayout('wiring', [rack])
  for (const [id, type, posU, heightU] of [
    ['sw', 'switch', 0, 1],
    ['nas', 'server', 2, 2],
    ['pc', 'equipment', 6, 1],
    ['pdu', 'pdu', 10, 1],
  ] as const) {
    l = addDevice(l, newDevice({ id, rackId: 'R', face: 'front', posU, heightU, type }))
  }
  return updateDevice(l, 'pc', { ports: 4 })
}
const base = seed()
const wired = connect(base, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'nas', port: 1 })

describe('TestConnectFreePorts', () => {
  it('creates one link and marks both ends connected', () => {
    expect(wired.links).toHaveLength(1)
    expect(portLink(wired, 'network', { deviceId: 'nas', port: 1 })!.a.deviceId).toBe('sw')
    expect(portLink(wired, 'network', { deviceId: 'sw', port: 0 })).toBeDefined()
  })

  it('leaves other ports free', () => {
    expect(portLink(wired, 'network', { deviceId: 'sw', port: 1 })).toBeUndefined()
  })
})

describe('TestPickerBlocksTakenPorts', () => {
  it('refuses a second cable on a port that already has one', () => {
    expect(() =>
      connect(wired, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'pc', port: 0 }),
    ).toThrow(PortBusyError)
  })

  it('refuses a port index the device does not have', () => {
    expect(
      codeOf(() =>
        connect(base, 'network', { deviceId: 'nas', port: 99 }, { deviceId: 'sw', port: 2 }),
      ),
    ).toBe('no-such-port')
  })

  it('refuses connecting a port to itself', () => {
    expect(() =>
      connect(base, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'sw', port: 0 }),
    ).toThrow(/itself/)
  })
})

describe('TestDisconnectClearsBothEnds', () => {
  it('leaves both ports free and the link gone', () => {
    const after = disconnect(wired, wired.links[0]!.id)
    expect(after.links).toHaveLength(0)
    expect(portLink(after, 'network', { deviceId: 'sw', port: 0 })).toBeUndefined()
    expect(portLink(after, 'network', { deviceId: 'nas', port: 1 })).toBeUndefined()
  })
})

describe('TestPduOutletSingleOccupancy', () => {
  it('lets one device take an outlet and refuses the next', () => {
    const one = connect(base, 'power', { deviceId: 'pdu', port: 3 }, { deviceId: 'nas', port: 0 })
    expect(one.links).toHaveLength(1)
    expect(() =>
      connect(one, 'power', { deviceId: 'pdu', port: 3 }, { deviceId: 'sw', port: 0 }),
    ).toThrow(PortBusyError)
  })

  it('keeps power and network links on separate books', () => {
    const mixed = connect(
      wired,
      'power',
      { deviceId: 'pdu', port: 0 },
      { deviceId: 'nas', port: 0 },
    )
    expect(mixed.links.filter((l) => l.kind === 'power')).toHaveLength(1)
    expect(mixed.links.filter((l) => l.kind === 'network')).toHaveLength(1)
  })

  it('refuses to draw power into something with no inlet', () => {
    const withShelf = addDevice(
      base,
      newDevice({ id: 'sh', rackId: 'R', face: 'front', posU: 14, heightU: 1, type: 'shelf' }),
    )
    expect(
      codeOf(() =>
        connect(withShelf, 'power', { deviceId: 'pdu', port: 1 }, { deviceId: 'sh', port: 0 }),
      ),
    ).toBe('no-such-port')
  })
})

describe('TestPortReductionPrunesExactLinks', () => {
  const twoWired = connect(
    wired,
    'network',
    { deviceId: 'sw', port: 5 },
    { deviceId: 'pc', port: 0 },
  )

  it('drops only the cables whose port disappeared', () => {
    const after = updateDevice(twoWired, 'sw', { ports: 1 })
    expect(after.links).toHaveLength(1)
    expect(after.links[0]!.a.port).toBe(0)
  })

  it('drops every cable when the type can no longer carry ports', () => {
    expect(updateDevice(twoWired, 'sw', { type: 'blank' }).links).toHaveLength(0)
  })
})

describe('TestDeleteDevicePrunesLinks', () => {
  it('leaves no endpoint pointing at a missing device', () => {
    const after = removeDevice(wired, 'sw')
    const ids = new Set(after.devices.map((d) => d.id))
    expect(after.links.every((l) => ids.has(l.a.deviceId) && ids.has(l.b.deviceId))).toBe(true)
    expect(after.links).toHaveLength(0)
  })
})

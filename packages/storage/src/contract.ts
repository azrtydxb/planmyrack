import { addDevice, connect, newDevice, newLayout, newRack } from '@planmyrack/core'
import { NotFoundError, StaleRevisionError } from './types.ts'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore, Template } from './types.ts'

/**
 * The suite every LayoutStore must pass — in-memory, node:sqlite on the server, expo-sqlite on
 * the device, and HTTP in between. It deliberately imports NO test runner: it uses the ambient
 * describe/it/expect so the same file runs under vitest in packages/* and under jest in the app.
 * If it imported vitest, the app could never prove its own adapter behaves the same.
 */
declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => unknown) => void
declare const expect: (value: unknown) => {
  toBe(v: unknown): void
  toEqual(v: unknown): void
  toBeTruthy(): void
  toHaveLength(n: number): void
  not: { toBe(v: unknown): void }
}

export interface StoreUnderTest {
  store: LayoutStore
  dispose?: () => Promise<void>
}

const seeded = (name: string): Layout => {
  const rack = newRack({ id: 'R', units: 12 })
  let layout = newLayout(name, [rack])
  layout = addDevice(
    layout,
    newDevice({ id: 'sw', rackId: 'R', face: 'front', posU: 0, heightU: 1, type: 'switch' }),
  )
  layout = addDevice(
    layout,
    newDevice({ id: 'nas', rackId: 'R', face: 'front', posU: 2, heightU: 2, type: 'server' }),
  )
  return connect(layout, 'network', { deviceId: 'sw', port: 0 }, { deviceId: 'nas', port: 1 })
}

const template = (): Template => ({
  id: '',
  name: 'UDM Pro',
  type: 'switch',
  heightU: 1,
  ports: 10,
  outlets: 0,
  watts: 33,
  weightKg: 3.9,
  depthMm: 285,
  colour: '#a855f7',
})

export function runStoreContract(name: string, make: () => Promise<StoreUnderTest>): void {
  describe(`TestLayoutCrudInBothModes — ${name}`, () => {
    it('creates, lists, opens, renames, duplicates and deletes', async () => {
      const { store, dispose } = await make()
      try {
        const made = await store.create(newLayout('Basement'))
        expect(made.id).toBeTruthy()
        expect(made.revision).toBe(1)

        expect((await store.list()).map((s) => s.name)).toEqual(['Basement'])
        expect((await store.get(made.id!)).name).toBe('Basement')

        const copy = await store.create({ ...made, id: null, name: 'Basement copy' })
        expect(copy.id).not.toBe(made.id)

        const renamed = await store.update({ ...made, name: 'Rack A' })
        expect([renamed.name, renamed.revision]).toEqual(['Rack A', 2])

        await store.remove(copy.id!)
        expect((await store.list()).length).toBe(1)

        let missing: unknown
        await store.get(copy.id!).catch((err) => (missing = err))
        expect(missing instanceof NotFoundError).toBe(true)
      } finally {
        await dispose?.()
      }
    })

    it('round-trips racks, devices and links through storage', async () => {
      const { store, dispose } = await make()
      try {
        const saved = await store.create(seeded('Wired'))
        const back = await store.get(saved.id!)
        expect(back.racks).toEqual(saved.racks)
        expect(back.devices).toEqual(saved.devices)
        expect(back.links).toEqual(saved.links)
      } finally {
        await dispose?.()
      }
    })

    it('stores and removes equipment templates', async () => {
      const { store, dispose } = await make()
      try {
        const saved = await store.saveTemplate(template())
        expect(saved.id).toBeTruthy()
        expect((await store.listTemplates()).length).toBe(1)
        expect((await store.listTemplates())[0]!.ports).toBe(10)
        await store.removeTemplate(saved.id)
        expect((await store.listTemplates()).length).toBe(0)
      } finally {
        await dispose?.()
      }
    })
  })

  describe(`TestStaleSaveRejected — ${name}`, () => {
    it('refuses a save built on an old revision and hands back the current document', async () => {
      const { store, dispose } = await make()
      try {
        const saved = await store.create(newLayout('Shared'))
        const mine = { ...saved, name: 'mine' }
        await store.update({ ...saved, name: 'theirs' })

        let error: unknown
        await store.update(mine).catch((err) => (error = err))
        expect(error instanceof StaleRevisionError).toBe(true)
        expect((error as StaleRevisionError).current.name).toBe('theirs')
        expect((await store.get(saved.id!)).name).toBe('theirs')
      } finally {
        await dispose?.()
      }
    })
  })
}

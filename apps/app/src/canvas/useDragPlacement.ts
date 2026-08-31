import { useCallback, useRef, useState } from 'react'
import {
  PlacementError,
  addDevice,
  addToMount,
  findFreeSlot,
  moveDevice,
  newDevice,
  snapHalfU,
} from '@planmyrack/core'
import { U_PX } from './metrics'
import type { Device, DeviceType, Face, Layout, NewDeviceInput, Rack } from '@planmyrack/core'

export interface Point {
  x: number
  y: number
}

/** A rack body's position on screen, registered by the canvas as it lays out. */
export interface RackHit {
  rack: Rack
  face: Face
  topY: number
}

export interface DragTarget {
  rackId: string
  face: Face
  posU: number
  heightU: number
  valid: boolean
  /** Set when the target is a cut-out on a mount rather than a place on the rails. */
  slot?: { mountId: string; index: number }
}

export interface DragState {
  kind: 'new' | 'move'
  heightU: number
  type: DeviceType
  deviceId?: string
  /** Name, ports, colour and the rest of the library row being dragged. */
  template?: Partial<NewDeviceInput>
  at: Point
  target: DragTarget | null
}

/**
 * Where a device should sit if dropped with the pointer at `pointerY`: centred on the finger,
 * snapped to the half-unit grid, and clamped so it cannot hang off either end of the rack.
 */
export function positionFromPoint(
  rack: Rack,
  rackTopY: number,
  pointerY: number,
  heightU: number,
): number {
  const fromTop = (pointerY - rackTopY) / U_PX
  const posU = rack.units - fromTop - heightU / 2
  return Math.min(Math.max(snapHalfU(posU), 0), rack.units - heightU)
}

export function useDragPlacement({
  layout,
  resolve,
  resolveSlot,
  onCommit,
}: {
  layout: Layout
  resolve: (point: Point) => RackHit | null
  /** A mount cut-out under the pointer: a board dropped there is bolted in rather than racked. */
  resolveSlot?: (point: Point) => { mount: Device; slot: number; taken: boolean } | null
  onCommit: (next: Layout) => void
}) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const set = useCallback((next: DragState | null) => {
    dragRef.current = next
    setDrag(next)
  }, [])

  const targetFor = useCallback(
    (state: DragState, point: Point): DragTarget | null => {
      // a board over an empty cut-out lands there; everything else lands on the rails
      const slot = state.type === 'sbc' ? resolveSlot?.(point) : null
      if (slot) {
        return {
          rackId: slot.mount.rackId,
          face: slot.mount.face,
          posU: slot.mount.posU,
          heightU: slot.mount.heightU,
          valid: !slot.taken,
          slot: { mountId: slot.mount.id, index: slot.slot },
        }
      }
      const hit = resolve(point)
      if (!hit) return null
      const wanted = positionFromPoint(hit.rack, hit.topY, point.y, state.heightU)
      const free = findFreeSlot(layout.devices, hit.rack, {
        id: state.deviceId,
        face: hit.face,
        posU: wanted,
        heightU: state.heightU,
      })
      return {
        rackId: hit.rack.id,
        face: hit.face,
        posU: free ?? wanted,
        heightU: state.heightU,
        valid: free !== null,
      }
    },
    [layout.devices, resolve, resolveSlot],
  )

  const startNew = useCallback(
    (type: DeviceType, heightU: number, at: Point, template?: Partial<NewDeviceInput>) => {
      const state: DragState = {
        kind: 'new',
        type,
        heightU,
        at,
        target: null,
        ...(template ? { template } : {}),
      }
      set({ ...state, target: targetFor(state, at) })
    },
    [set, targetFor],
  )

  const startMove = useCallback(
    (device: Device, at: Point) => {
      const state: DragState = {
        kind: 'move',
        type: device.type,
        heightU: device.heightU,
        deviceId: device.id,
        at,
        target: null,
      }
      set({ ...state, target: targetFor(state, at) })
    },
    [set, targetFor],
  )

  const moveTo = useCallback(
    (at: Point) => {
      const current = dragRef.current
      if (!current) return
      set({ ...current, at, target: targetFor(current, at) })
    },
    [set, targetFor],
  )

  /** A drag that cannot land changes nothing: no partial placement, no silent overlap. */
  const drop = useCallback(() => {
    const current = dragRef.current
    set(null)
    if (!current?.target?.valid) return

    const { rackId, face, posU } = current.target
    try {
      const landing = current.target.slot
      if (landing) {
        const mount = layout.devices.find((d) => d.id === landing.mountId)
        if (!mount) return
        onCommit(
          addToMount(
            layout,
            mount,
            landing.index,
            newDevice({
              ...current.template,
              rackId: mount.rackId,
              face: mount.face,
              posU: mount.posU,
              heightU: mount.heightU,
              type: current.type,
            }),
          ),
        )
        return
      }
      if (current.kind === 'move' && current.deviceId) {
        onCommit(moveDevice(layout, current.deviceId, { rackId, face, posU }))
      } else {
        onCommit(
          addDevice(
            layout,
            newDevice({
              ...current.template,
              rackId,
              face,
              posU,
              heightU: current.heightU,
              type: current.type,
            }),
          ),
        )
      }
    } catch (err) {
      if (!(err instanceof PlacementError)) throw err
    }
  }, [layout, onCommit, set])

  /** Called when the drag is interrupted — backgrounding, an incoming call, a cancelled gesture. */
  const cancel = useCallback(() => set(null), [set])

  return { drag, startNew, startMove, moveTo, drop, cancel }
}

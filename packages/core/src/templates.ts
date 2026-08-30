import { newDevice } from './factories.ts'
import type { Device, DeviceType, Face, Faceplate } from './types.ts'

/**
 * A device saved for reuse. Deliberately not a Device: position, rack and face belong to where it
 * was placed, not to the gear itself.
 */
export interface DeviceTemplate {
  id: string
  name: string
  type: DeviceType
  heightU: number
  ports: number
  outlets: number
  watts: number
  weightKg: number
  depthMm: number
  colour: string
  /** Kept so a saved NAS comes back with its drive bays rather than as a blank plate. */
  faceplate?: Faceplate
  bays?: number
  sfp?: number
}

export const templateFromDevice = (device: Device, id = ''): DeviceTemplate => ({
  id,
  name: device.name,
  type: device.type,
  heightU: device.heightU,
  ports: device.ports,
  outlets: device.outlets,
  watts: device.watts,
  weightKg: device.weightKg,
  depthMm: device.depthMm,
  colour: device.colour,
  ...(device.faceplate ? { faceplate: device.faceplate } : {}),
  ...(device.bays === undefined ? {} : { bays: device.bays }),
  ...(device.sfp === undefined ? {} : { sfp: device.sfp }),
})

export const deviceFromTemplate = (
  template: DeviceTemplate,
  at: { rackId: string; face: Face; posU: number },
): Device =>
  newDevice({
    ...at,
    heightU: template.heightU,
    type: template.type,
    name: template.name,
    ports: template.ports,
    outlets: template.outlets,
    watts: template.watts,
    weightKg: template.weightKg,
    depthMm: template.depthMm,
    colour: template.colour,
    ...(template.faceplate ? { faceplate: template.faceplate } : {}),
    ...(template.bays === undefined ? {} : { bays: template.bays }),
    ...(template.sfp === undefined ? {} : { sfp: template.sfp }),
  })

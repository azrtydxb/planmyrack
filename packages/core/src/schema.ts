import { z } from 'zod'
import { MAX_RACK_UNITS } from './types.ts'

const halfUnit = z
  .number()
  .nonnegative()
  .refine((n) => Number.isInteger(n * 2), { message: 'must be a multiple of 0.5' })

const deviceType = z.enum([
  'equipment',
  'server',
  'switch',
  'patch',
  'pdu',
  'ups',
  'shelf',
  'blank',
  'hooks',
  'brush',
])

export const rackSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  width: z.union([z.literal(19), z.literal(10)]),
  units: z.number().int().min(1).max(MAX_RACK_UNITS),
  depthMm: z.number().nonnegative(),
})

export const deviceSchema = z.object({
  id: z.string().min(1),
  rackId: z.string().min(1),
  face: z.enum(['front', 'rear']),
  posU: halfUnit,
  heightU: halfUnit.refine((n) => n > 0, { message: 'must be taller than zero' }),
  type: deviceType,
  name: z.string(),
  colour: z.string(),
  ports: z.number().int().nonnegative(),
  outlets: z.number().int().nonnegative(),
  watts: z.number().nonnegative(),
  weightKg: z.number().nonnegative(),
  depthMm: z.number().nonnegative(),
  notes: z.string(),
  faceplate: z.enum(['plain', 'bays', 'display', 'sfp', 'poe', 'outlets']).optional(),
  bays: z.number().int().nonnegative().optional(),
  sfp: z.number().int().nonnegative().optional(),
})

const linkEnd = z.object({ deviceId: z.string().min(1), port: z.number().int().nonnegative() })

export const linkSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['network', 'power']),
  a: linkEnd,
  b: linkEnd,
  label: z.string(),
  colour: z.string(),
  cableType: z.enum(['cat5e', 'cat6', 'cat6a', 'fibre', 'dac', 'power']),
})

export const layoutSchema = z.object({
  schemaVersion: z.number().int().positive(),
  id: z.string().nullable().optional(),
  name: z.string().min(1),
  revision: z.number().int().nonnegative().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  racks: z.array(rackSchema),
  devices: z.array(deviceSchema),
  links: z.array(linkSchema),
})

/**
 * What a client may POST as a saved template. The id may be absent or empty — the store mints one
 * either way, which is the contract every adapter is tested against.
 */
export const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: deviceType,
  heightU: halfUnit.refine((n) => n > 0, { message: 'must be taller than zero' }),
  ports: z.number().int().nonnegative(),
  outlets: z.number().int().nonnegative(),
  watts: z.number().nonnegative(),
  weightKg: z.number().nonnegative(),
  depthMm: z.number().nonnegative(),
  colour: z.string(),
  faceplate: z.enum(['plain', 'bays', 'display', 'sfp', 'poe', 'outlets']).optional(),
  bays: z.number().int().nonnegative().optional(),
  sfp: z.number().int().nonnegative().optional(),
})

import { describe, it, expect } from 'vitest'
import { deviceFromTemplate, newDevice, templateFromDevice } from '../src/index.ts'

const configured = newDevice({
  rackId: 'R',
  face: 'front',
  posU: 4,
  heightU: 1,
  type: 'switch',
  name: 'UDM Pro',
  ports: 10,
  watts: 33,
  weightKg: 3.9,
  depthMm: 285,
  colour: '#a855f7',
})

describe('TestTemplateRoundTrip', () => {
  it('keeps every reusable property and drops the placement', () => {
    const template = templateFromDevice(configured, 't1')
    expect(template).toMatchObject({
      name: 'UDM Pro',
      type: 'switch',
      heightU: 1,
      ports: 10,
      watts: 33,
      colour: '#a855f7',
    })
    expect(template).not.toHaveProperty('posU')
    expect(template).not.toHaveProperty('rackId')
  })

  it('places the template into another rack unchanged', () => {
    const placed = deviceFromTemplate(templateFromDevice(configured, 't1'), {
      rackId: 'OTHER',
      face: 'rear',
      posU: 0,
    })
    expect(placed).toMatchObject({
      name: 'UDM Pro',
      ports: 10,
      watts: 33,
      colour: '#a855f7',
      rackId: 'OTHER',
      face: 'rear',
      posU: 0,
    })
    expect(placed.id).not.toBe(configured.id)
  })
})

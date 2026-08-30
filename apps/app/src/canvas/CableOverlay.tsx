import Svg, { Path } from 'react-native-svg'
import { StyleSheet, View } from 'react-native'
import { deviceRect, portRects } from './metrics'
import { cablePath } from './cablePath'
import type { Face, Layout, LinkEnd } from '@planmyrack/core'
import type { Point } from './cablePath'

/**
 * Draws only cables whose two ends are both rendered on the visible face. A cable to another rack
 * or the other face has no line to draw — the schedule still lists it, which is why the schedule
 * is not built from this.
 */
export function CableOverlay({
  layout,
  face,
  rackOffsets,
  width,
  height,
}: {
  layout: Layout
  face: Face
  /** Left offset of each rack body within the canvas, keyed by rack id. */
  rackOffsets: Record<string, { x: number; y: number }>
  width: number
  height: number
}) {
  const centreOf = (end: LinkEnd): Point | null => {
    const device = layout.devices.find((d) => d.id === end.deviceId)
    if (!device || device.face !== face) return null
    const rack = layout.racks.find((r) => r.id === device.rackId)
    const offset = rack ? rackOffsets[rack.id] : undefined
    if (!rack || !offset) return null

    const box = deviceRect(rack, device)
    const port = portRects(device, box.width, box.height)[end.port]
    if (!port) return null
    return {
      x: offset.x + port.x + port.size / 2,
      y: offset.y + box.top + port.y + port.size / 2,
    }
  }

  const paths = layout.links.flatMap((link) => {
    const a = centreOf(link.a)
    const b = centreOf(link.b)
    return a && b ? [{ id: link.id, colour: link.colour, d: cablePath(a, b) }] : []
  })

  return (
    <View pointerEvents="none" style={[styles.layer, { width, height }]}>
      <Svg width={width} height={height}>
        {paths.map((path) => (
          <Path
            key={path.id}
            testID={`cable-path-${path.id}`}
            d={path.d}
            stroke={path.colour}
            strokeWidth={2}
            fill="none"
            opacity={0.9}
          />
        ))}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0 },
})

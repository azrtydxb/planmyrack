import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { RackFrame } from './RackFrame'
import { CableOverlay } from './CableOverlay'
import { DotGrid } from './DotGrid'
import { RACK_INNER_PX, RAIL_PX, SCALE_PX, CAP_PX, rackHeightPx } from './metrics'
import { colour } from '../ui/theme'
import type { Device, Face, Layout } from '@planmyrack/core'

const GAP = 28

/** Left offset of each rack's inner area inside the canvas, so cables can be drawn over it. */
function rackOffsets(layout: Layout): Record<string, { x: number; y: number }> {
  const offsets: Record<string, { x: number; y: number }> = {}
  let x = 16
  for (const rack of layout.racks) {
    offsets[rack.id] = { x: x + SCALE_PX + RAIL_PX, y: 16 + CAP_PX }
    x += SCALE_PX + RAIL_PX * 2 + RACK_INNER_PX[rack.width] + GAP
  }
  return offsets
}

export function RackCanvas({
  layout,
  face,
  selectedId,
  dropHint,
  showCables = true,
  onSelect,
  onPortPress,
  onDeviceLongPress,
}: {
  layout: Layout
  face: Face
  selectedId?: string | null
  dropHint?: { rackId: string; posU: number; heightU: number; valid: boolean } | null
  showCables?: boolean
  onSelect?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onDeviceLongPress?: (device: Device) => void
}) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const offsets = rackOffsets(layout)
  const contentHeight = 32 + CAP_PX * 2 + Math.max(0, ...layout.racks.map(rackHeightPx))
  const contentWidth =
    32 +
    layout.racks.reduce(
      (sum, rack) => sum + SCALE_PX + RAIL_PX * 2 + RACK_INNER_PX[rack.width] + GAP,
      0,
    )
  // the workspace fills the pane it is given, so the dotted grid reaches the edges
  const width = Math.max(contentWidth, viewport.width)
  const height = Math.max(contentHeight, viewport.height)

  return (
    <ScrollView
      testID="canvas-scroll"
      horizontal
      style={styles.canvas}
      contentContainerStyle={styles.content}
      onLayout={(event) => {
        const { width: w, height: h } = event.nativeEvent.layout
        setViewport((current) =>
          current.width === w && current.height === h ? current : { width: w, height: h },
        )
      }}
    >
      <View testID="canvas-content" style={[styles.stage, { width, height }]}>
        <DotGrid width={width} height={height} />
        <View style={styles.row}>
          {layout.racks.map((rack) => (
            <RackFrame
              key={rack.id}
              rack={rack}
              layout={layout}
              face={face}
              devices={layout.devices.filter((d) => d.rackId === rack.id && d.face === face)}
              selectedId={selectedId}
              dropHint={dropHint?.rackId === rack.id ? dropHint : null}
              onSelect={onSelect}
              onPortPress={onPortPress}
              onDeviceLongPress={onDeviceLongPress}
            />
          ))}
        </View>
        {showCables ? (
          <CableOverlay
            layout={layout}
            face={face}
            rackOffsets={offsets}
            width={width}
            height={height}
          />
        ) : null}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  canvas: { backgroundColor: colour.canvasBg },
  content: { padding: 16, flexGrow: 1 },
  stage: { position: 'relative' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
})

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { RackFrame } from './RackFrame'
import { CableOverlay } from './CableOverlay'
import { DotGrid } from './DotGrid'
import { CAP_PX, RACK_INNER_PX, RAIL_PX, SCALE_PX, rackHeightPx } from './metrics'
import { CanvasGestures } from './CanvasGestures'
import { bodyOrigins, canvasPoint, rackUnder } from './origins'
import type { Origin } from './origins'
import { Mono } from '../ui/primitives'
import { TOUCH, colour, font, radius } from '../ui/theme'
import type { DragSource } from './useDragSource'
import type { Point, RackHit } from './useDragPlacement'
import type { Device, Face, Layout } from '@planmyrack/core'

/**
 * What a drag needs from the canvas: where the pointer is in canvas space, and which rack body
 * sits under it. Screen coordinates are the only thing a gesture on another component (a library
 * row) and a gesture on a rack have in common.
 */
export interface CanvasGeometry {
  toLocal(screen: Point): Point
  resolve(local: Point): RackHit | null
}

const GAP = 28

export function RackCanvas({
  layout,
  face,
  selectedId,
  dropHint,
  showCables = true,
  onSelect,
  onPortPress,
  onDeviceLongPress,
  onGeometry,
  drag,
}: {
  layout: Layout
  face: Face
  selectedId?: string | null
  dropHint?: { rackId: string; posU: number; heightU: number; valid: boolean } | null
  showCables?: boolean
  onSelect?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onDeviceLongPress?: (device: Device) => void
  onGeometry?: (geometry: CanvasGeometry) => void
  drag?: DragSource<Device>
}) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const stage = useRef<View | null>(null)
  // Where the stage sits on screen, and how far the canvas is scrolled: together they turn a
  // finger position anywhere on screen into a point in canvas space.
  const stageOrigin = useRef<Point>({ x: 0, y: 0 })
  const scrollX = useRef(0)
  const transform = useRef({ scale: 1, x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [scaleTo, setScaleTo] = useState<number | undefined>(undefined)
  /**
   * Where each rack body actually sits, measured rather than computed. Deriving it from padding
   * and rail widths drifted whenever the surrounding layout changed — a rack caption wider than
   * its rack was enough to shift the frame and leave every cable ending beside its port.
   */
  const [frames, setFrames] = useState<Record<string, Origin>>({})
  const [bodies, setBodies] = useState<Record<string, Origin>>({})

  const note = (set: typeof setFrames) => (rackId: string, origin: Origin) => {
    set((current) => {
      const known = current[rackId]
      if (known && known.x === origin.x && known.y === origin.y) return current
      return { ...current, [rackId]: origin }
    })
  }
  const noteFrame = useCallback(note(setFrames), [])
  const noteBody = useCallback(note(setBodies), [])
  const offsets = bodyOrigins(frames, bodies)

  const toLocal = useCallback(
    (screen: Point): Point =>
      canvasPoint(screen, {
        origin: stageOrigin.current,
        scrollX: scrollX.current,
        scale: transform.current.scale,
        translate: { x: transform.current.x, y: transform.current.y },
      }),
    [],
  )

  const noteTransform = useCallback((next: { scale: number; x: number; y: number }) => {
    transform.current = next
    setZoom((current) => (current === next.scale ? current : next.scale))
  }, [])

  const resolve = useCallback(
    (local: Point): RackHit | null => {
      const hit = rackUnder(layout.racks, offsets, local)
      return hit ? { rack: hit.rack, face, topY: hit.topY } : null
    },
    [face, layout.racks, offsets],
  )

  useEffect(() => {
    onGeometry?.({ toLocal, resolve })
  }, [onGeometry, resolve, toLocal])
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

  const fit = () => {
    if (viewport.width === 0 || viewport.height === 0) return
    setScaleTo(Math.min(viewport.width / contentWidth, viewport.height / contentHeight, 1))
  }

  return (
    <View style={styles.canvas}>
      <ScrollView
        testID="canvas-scroll"
        horizontal
        style={styles.scroller}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={(event) => {
          scrollX.current = event.nativeEvent.contentOffset.x
        }}
        onLayout={(event) => {
          const { width: w, height: h } = event.nativeEvent.layout
          setViewport((current) =>
            current.width === w && current.height === h ? current : { width: w, height: h },
          )
        }}
      >
        <CanvasGestures onTransform={noteTransform} scaleTo={scaleTo}>
          <View
            testID="canvas-content"
            ref={stage}
            onLayout={() =>
              stage.current?.measureInWindow((x, y) => {
                stageOrigin.current = { x, y }
              })
            }
            style={[styles.stage, { width, height }]}
          >
            <DotGrid width={width} height={height} />
            <View style={styles.row}>
              {layout.racks.map((rack) => (
                <View
                  key={rack.id}
                  onLayout={(event) => noteFrame(rack.id, event.nativeEvent.layout)}
                >
                  <RackFrame
                    rack={rack}
                    layout={layout}
                    face={face}
                    devices={layout.devices.filter((d) => d.rackId === rack.id && d.face === face)}
                    selectedId={selectedId}
                    dropHint={dropHint?.rackId === rack.id ? dropHint : null}
                    onSelect={onSelect}
                    onPortPress={onPortPress}
                    onDeviceLongPress={onDeviceLongPress}
                    drag={drag}
                    onBodyLayout={noteBody}
                  />
                </View>
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
        </CanvasGestures>
      </ScrollView>

      {/* 3a's zoom readout, bottom left of the workspace */}
      <View style={styles.zoomBar} pointerEvents="box-none">
        <Pressable
          testID="zoom-reset"
          accessibilityRole="button"
          accessibilityLabel="Zoom to 100 percent"
          onPress={() => setScaleTo(1)}
          style={styles.zoomButton}
        >
          <Text style={styles.zoomText}>{`${Math.round(zoom * 100)}%`}</Text>
          <Mono size={7.5} tone={colour.icon}>
            ⌖
          </Mono>
        </Pressable>
        <Pressable
          testID="zoom-fit"
          accessibilityRole="button"
          accessibilityLabel="Fit the racks on screen"
          onPress={fit}
          style={styles.zoomButton}
        >
          <Text style={styles.zoomText}>FIT</Text>
          <Mono size={7.5} tone={colour.icon}>
            ⛶
          </Mono>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: colour.canvasBg },
  scroller: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
  stage: { position: 'relative' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  zoomBar: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH - 12,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.border,
    backgroundColor: colour.surface,
  },
  zoomText: { fontFamily: font.uiBold, fontSize: 11.5, color: colour.textSecondary },
})

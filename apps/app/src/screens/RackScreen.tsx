import { useCallback, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { CanvasGestures } from '../canvas/CanvasGestures'
import { RackCanvas } from '../canvas/RackCanvas'
import { useDragPlacement } from '../canvas/useDragPlacement'
import { theme } from '../ui/theme'
import type { Device, Face, Layout, Rack } from '@planmyrack/core'
import type { Point, RackHit } from '../canvas/useDragPlacement'

export function RackScreen({
  layout,
  onChange,
  face = 'front',
  onSelect,
  onPortPress,
  onScaleChange,
}: {
  layout: Layout
  onChange: (next: Layout) => void
  face?: Face
  onSelect?: (id: string) => void
  onPortPress?: (device: Device, port: number, kind: 'network' | 'power') => void
  onScaleChange?: (scale: number) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)

  // Where each rack body sits on screen, so a drop can tell which rack it is over.
  const rackHits = useRef(
    new Map<string, { rack: Rack; face: Face; topY: number; left: number; right: number }>(),
  )

  const resolve = useCallback((point: Point): RackHit | null => {
    for (const hit of rackHits.current.values()) {
      if (point.x >= hit.left && point.x <= hit.right) {
        return { rack: hit.rack, face: hit.face, topY: hit.topY }
      }
    }
    return null
  }, [])

  const { drag } = useDragPlacement({ layout, resolve, onCommit: onChange })

  const select = useCallback(
    (id: string) => {
      setSelectedId(id)
      onSelect?.(id)
    },
    [onSelect],
  )

  return (
    <View style={styles.screen}>
      <CanvasGestures
        onScaleChange={(next) => {
          setScale(next)
          onScaleChange?.(next)
        }}
      >
        <RackCanvas
          layout={layout}
          face={face}
          selectedId={selectedId}
          dropHint={drag?.target ?? null}
          onSelect={select}
          onPortPress={onPortPress}
        />
      </CanvasGestures>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
})

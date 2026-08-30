import { useEffect, useMemo, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import type { ReactNode } from 'react'

const MIN_SCALE = 0.4
const MAX_SCALE = 3

/**
 * Pinch to zoom, two fingers to pan. Both compose simultaneously, and a device drag (declared on
 * the device itself) is a single-finger gesture that requires two pointers to be absent — so two
 * fingers landing on a device zoom the canvas instead of dragging the device out of the rack.
 *
 * Deliberately RN's own Animated rather than Reanimated: the transform is one node, the native
 * driver handles it, and Reanimated 4 cannot initialise under jest, which would have made the
 * pinch-versus-drag rule untestable.
 */
export function CanvasGestures({
  children,
  onTransform,
  scaleTo,
}: {
  children: ReactNode
  /** Reports the live transform so screen coordinates can be turned back into canvas ones. */
  onTransform?: (transform: { scale: number; x: number; y: number }) => void
  /** A zoom set from outside — the 100% and Fit buttons. */
  scaleTo?: number
}) {
  const scale = useRef(new Animated.Value(1)).current
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const current = useRef({ scale: 1, x: 0, y: 0 })

  useEffect(() => {
    if (scaleTo === undefined || scaleTo === current.current.scale) return
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scaleTo))
    current.current = { scale: next, x: 0, y: 0 }
    scale.setValue(next)
    translateX.setValue(0)
    translateY.setValue(0)
    onTransform?.({ scale: next, x: 0, y: 0 })
  }, [onTransform, scale, scaleTo, translateX, translateY])

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .withTestId('pinch')
      .onUpdate((event) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.current.scale * event.scale))
        scale.setValue(next)
        onTransform?.({ ...current.current, scale: next })
      })
      .onEnd(() => {
        current.current.scale = (scale as unknown as { _value: number })._value
        onTransform?.({ ...current.current })
      })

    const pan = Gesture.Pan()
      .withTestId('canvas-pan')
      .minPointers(2)
      .onUpdate((event) => {
        translateX.setValue(current.current.x + event.translationX)
        translateY.setValue(current.current.y + event.translationY)
        onTransform?.({
          scale: current.current.scale,
          x: current.current.x + event.translationX,
          y: current.current.y + event.translationY,
        })
      })
      .onEnd((event) => {
        current.current.x += event.translationX
        current.current.y += event.translationY
        onTransform?.({ ...current.current })
      })

    return Gesture.Simultaneous(pinch, pan)
  }, [onTransform, scale, translateX, translateY])

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        testID="canvas-transform"
        // top left, so a point in canvas space is the screen point minus the stage origin
        // divided by the scale — the maths canvasPoint does.
        style={[
          styles.fill,
          { transformOrigin: 'top left', transform: [{ translateX }, { translateY }, { scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

// The stage inside carries its own width and height; stretching this wrapper instead pushed the
// racks down the canvas and left a band of empty workspace above them.
const styles = StyleSheet.create({ fill: { alignSelf: 'flex-start' } })

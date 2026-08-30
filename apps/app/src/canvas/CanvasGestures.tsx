import { useMemo, useRef } from 'react'
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
  onScaleChange,
}: {
  children: ReactNode
  onScaleChange?: (scale: number) => void
}) {
  const scale = useRef(new Animated.Value(1)).current
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const current = useRef({ scale: 1, x: 0, y: 0 })

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .withTestId('pinch')
      .onUpdate((event) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.current.scale * event.scale))
        scale.setValue(next)
        onScaleChange?.(next)
      })
      .onEnd(() => {
        current.current.scale = (scale as unknown as { _value: number })._value
      })

    const pan = Gesture.Pan()
      .withTestId('canvas-pan')
      .minPointers(2)
      .onUpdate((event) => {
        translateX.setValue(current.current.x + event.translationX)
        translateY.setValue(current.current.y + event.translationY)
      })
      .onEnd((event) => {
        current.current.x += event.translationX
        current.current.y += event.translationY
      })

    return Gesture.Simultaneous(pinch, pan)
  }, [onScaleChange, scale, translateX, translateY])

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        testID="canvas-transform"
        style={[styles.fill, { transform: [{ translateX }, { translateY }, { scale }] }]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({ fill: { flex: 1 } })

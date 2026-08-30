import { useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import type { Point } from './useDragPlacement'

/** Pointer callbacks a drag source reports in screen coordinates. */
export interface DragSource<T> {
  onStart: (subject: T, screen: Point) => void
  onMove: (screen: Point) => void
  onEnd: () => void
  onCancel: () => void
}

/** How far the finger travels before a press becomes a drag rather than a tap. */
export const SLOP = 6

/**
 * A library row or a placed faceplate you can drag onto a rack face.
 *
 * Gesture Handler rather than PanResponder: react-native-web's responder system never granted
 * these gestures in a browser, so a PanResponder version passed its tests and did nothing in the
 * built app. `runOnJS` because the handlers touch React state, not shared values.
 */
export function useDragSource<T>(subject: T, drag?: DragSource<T>, testId?: string) {
  return useMemo(
    () =>
      Gesture.Pan()
        .withTestId(testId ?? 'drag')
        .enabled(Boolean(drag))
        .minDistance(SLOP)
        .runOnJS(true)
        .onStart((event) => drag?.onStart(subject, { x: event.absoluteX, y: event.absoluteY }))
        .onUpdate((event) => drag?.onMove({ x: event.absoluteX, y: event.absoluteY }))
        .onEnd(() => drag?.onEnd())
        .onFinalize((_event, success) => {
          if (!success) drag?.onCancel()
        }),
    [drag, subject, testId],
  )
}

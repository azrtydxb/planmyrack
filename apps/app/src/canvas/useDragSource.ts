import { useMemo, useRef } from 'react'
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
  /**
   * Read at gesture time, not captured when the gesture was built. A library row's subject
   * changes as its stepper is turned: capturing it dragged the port count the row had when it
   * first rendered.
   */
  const latest = useRef(subject)
  latest.current = subject

  /**
   * Set the moment the pan activates, cleared at the start of every press. Web fires a click
   * after the pointer comes up even when the gesture was a drag, so without this a library row
   * dragged onto a rack placed the device twice: once where it was dropped, once wherever the
   * tap handler puts it.
   */
  const dragged = useRef(false)

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .withTestId(testId ?? 'drag')
        .enabled(Boolean(drag))
        .minDistance(SLOP)
        .runOnJS(true)
        .onBegin(() => {
          dragged.current = false
        })
        .onStart((event) => {
          dragged.current = true
          drag?.onStart(latest.current, { x: event.absoluteX, y: event.absoluteY })
        })
        .onUpdate((event) => drag?.onMove({ x: event.absoluteX, y: event.absoluteY }))
        .onEnd(() => drag?.onEnd())
        .onFinalize((_event, success) => {
          if (!success) drag?.onCancel()
        }),
    [drag, testId],
  )

  /** True when the press that just landed is the tail of a drag and should be ignored. */
  const pressWasDrag = () => dragged.current

  return { gesture, pressWasDrag }
}

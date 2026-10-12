/**
 * A tiny mutable bus for pointer state that must be shared between the DOM
 * layer (which owns drag gestures) and the 3D layer (which owns link hits).
 * Keeping it out of React means neither has to re-render the other.
 */
export const input = {
  /** The pointer is currently pulling a page across. */
  dragging: false,
  /** A 3D hit-test has already claimed this gesture (a printed link). */
  consumed: false,
  /** Pointer position in normalised device coordinates. */
  ndc: { x: 0, y: 0 },
  /** Smoothed pointer position, −1 … 1, used for parallax. */
  easedX: 0,
  easedY: 0,
}

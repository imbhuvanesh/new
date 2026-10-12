import { LEAF_COUNT } from './constants'

/**
 * A tiny shared, mutable motion bus. GSAP writes to it from timelines; the
 * render loop reads it every frame. Keeping it out of React means a page turn
 * costs zero re-renders.
 */
export const motion = {
  /** 0 = front cover shut, 1 = open flat. */
  open: 0,
  /** Continuous number of leaves turned, 0 … LEAF_COUNT. */
  turned: 0,
  /** Camera (world units). */
  cam: { x: 3.4, y: 2.9, z: 3.2 },
  target: { x: 0.65, y: 0.12, z: 0 },
  /** Pointer parallax, each in −1 … 1. */
  px: 0,
  py: 0,
  /** How strongly the book leans toward the pointer (0 = off). */
  sway: 1,
  /** 0 … 1, used to fade the studio down when the book closes. */
  ambiance: 0,
}

export type CamState = { d: number; elev: number; azim: number; tx: number; ty: number; tz: number }

export const CAM = {
  /** Very wide, low, cinematic. */
  introWide: { d: 9.6, elev: 13, azim: 34, tx: 0.62, ty: 0.1, tz: 0 } as CamState,
  /** The closed book, three-quarter view. */
  closed: { d: 5.2, elev: 27, azim: 40, tx: 0.62, ty: 0.12, tz: 0 } as CamState,
  /** Settled, reading the spread. */
  reading: { d: 4.9, elev: 55, azim: 7, tx: 0, ty: 0.13, tz: 0 } as CamState,
  /** Portrait phone: a single page at a time, viewed along the book's length. */
  readingMobile: { d: 6.2, elev: 42, azim: 62, tx: 0.72, ty: 0.12, tz: 0 } as CamState,
  /** The finale — the book closed for good. */
  finale: { d: 6.6, elev: 22, azim: 38, tx: 0.62, ty: 0.12, tz: 0 } as CamState,
} as const

/** The settled reading pose, which depends on the shape of the viewport. */
export function readingCam(): CamState {
  const portrait =
    typeof window !== 'undefined' && window.innerHeight > window.innerWidth * 1.05
  return portrait ? CAM.readingMobile : CAM.reading
}

export function camPos(s: CamState) {
  const e = (s.elev * Math.PI) / 180
  const a = (s.azim * Math.PI) / 180
  return {
    x: s.tx + s.d * Math.cos(e) * Math.sin(a),
    y: s.ty + s.d * Math.sin(e),
    z: s.tz + s.d * Math.cos(e) * Math.cos(a),
  }
}

export function applyCam(s: CamState) {
  const p = camPos(s)
  motion.cam.x = p.x
  motion.cam.y = p.y
  motion.cam.z = p.z
  motion.target.x = s.tx
  motion.target.y = s.ty
  motion.target.z = s.tz
}

export const MAX_TURN = LEAF_COUNT

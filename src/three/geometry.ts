import * as THREE from 'three'
import { BOARD_RADIUS } from './constants'

/* ─────────────────────────────────────────────────────────────────────────────
   The handful of shapes the book is assembled from. Everything is built so that
   `x = 0` is the binding edge and `x = width` is the fore-edge.
   ───────────────────────────────────────────────────────────────────────────── */

/** A rounded rectangle centred on the origin. */
export function roundedRectShape(w: number, h: number, r = BOARD_RADIUS): THREE.Shape {
  const s = new THREE.Shape()
  const rr = Math.min(r, w / 2, h / 2)
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + rr, y)
  s.lineTo(x + w - rr, y)
  s.quadraticCurveTo(x + w, y, x + w, y + rr)
  s.lineTo(x + w, y + h - rr)
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  s.lineTo(x + rr, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - rr)
  s.lineTo(x, y + rr)
  s.quadraticCurveTo(x, y, x + rr, y)
  return s
}

/** Rounded-rect plane in the XY plane, spanning x ∈ [0, w]. UVs run 0…1. */
export function boardFaceGeometry(w: number, h: number, r = BOARD_RADIUS) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r))
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h)
  }
  uv.needsUpdate = true
  geo.translate(w / 2, 0, 0)
  geo.computeVertexNormals()
  return geo
}

/**
 * The board itself: a rounded slab `t` thick, lying in XZ, spanning x ∈ [0, w].
 * Its faces sit at y = ±t/2.
 */
export function boardSlabGeometry(w: number, h: number, t: number, r = BOARD_RADIUS) {
  const bevel = t * 0.16
  const shape = roundedRectShape(w, h, r)
  const geo = new THREE.ExtrudeGeometry(shape, {
    // three adds the bevel *outside* `depth`, so shrink the core to compensate:
    // the finished slab is exactly `t` thick.
    depth: t - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeBoundingBox()
  const bb = geo.boundingBox
  if (bb) {
    geo.translate(
      w / 2 - (bb.min.x + bb.max.x) / 2,
      -(bb.min.y + bb.max.y) / 2,
      -(bb.min.z + bb.max.z) / 2,
    )
  }
  geo.computeVertexNormals()
  return geo
}

/**
 * The rounded spine: a half-cylinder of unit radius and unit length, bulging
 * towards −x. Scale it as `(radius, radius, height)`.
 */
export function spineGeometry(segments = 40) {
  const pos: number[] = []
  const norm: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const theta = Math.PI / 2 + t * Math.PI
    const x = Math.cos(theta)
    const y = Math.sin(theta)
    pos.push(x, y, -0.5, x, y, 0.5)
    // canvas top (uv.y = 1) maps to −Z, matching every page, so the spine
    // lettering is never upside down.
    uv.push(t, 1, t, 0)
    // outward normal of a circle centred on the origin
    norm.push(x, y, 0, x, y, 0)
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3
    idx.push(a, c, b, b, c, d)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  return geo
}

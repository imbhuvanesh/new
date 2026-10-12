/** Physical dimensions of the book, in world units (1 unit ≈ 15 cm). */

export const PAGE_W = 1.42
export const PAGE_H = 1.98

/** Hardcover boards overhang the page block on three sides. */
export const BOARD_OVERHANG_X = 0.05
export const BOARD_OVERHANG_Z = 0.06
export const BOARD_W = PAGE_W + BOARD_OVERHANG_X
export const BOARD_H = PAGE_H + BOARD_OVERHANG_Z
export const BOARD_T = 0.05

export const BOARD_RADIUS = 0.045

/** One physical leaf per chapter. */
export const LEAF_COUNT = 8
export const LEAF_SPACING = 0.031
export const LEAF_T = 0.004

export const BLOCK_H = LEAF_COUNT * LEAF_SPACING

/** Where the desk surface sits, relative to the book origin. */
export const DESK_Y = -BOARD_T - 0.0025

/** Vertical centre of leaf `i` while it is still in the right-hand stack. */
export const leafHeightRight = (i: number) => (LEAF_COUNT - i - 0.5) * LEAF_SPACING
/** Vertical centre of leaf `i` once it has been turned into the left stack. */
export const leafHeightLeft = (i: number) => (i + 0.5) * LEAF_SPACING

/** Outer face of the top of a shut book's page block. */
export const STACK_TOP_CLOSED = leafHeightRight(0) + LEAF_T / 2

export const COVER_HINGE_CLOSED = STACK_TOP_CLOSED + BOARD_T / 2
export const COVER_HINGE_OPEN = -BOARD_T / 2

/** Touch/pointer drag distance (px) required to commit a page turn. */
export const DRAG_THRESHOLD = 54

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Height of the two page blocks for a given continuous turn position.
 *
 * A leaf lifts out of the right-hand block only after it has cleared the
 * others, and lands in the left-hand block only once it is nearly down — so
 * the blocks never intersect the sheet that is in flight.
 */
export function stackTops(turned: number) {
  const base = Math.floor(turned + 1e-6)
  const f = turned - base
  const lifted = base + smoothstep(0.05, 0.45, f)
  const landed = base + smoothstep(0.55, 0.95, f)
  return {
    right: Math.max(0, (LEAF_COUNT - lifted - 0.5) * LEAF_SPACING - LEAF_T / 2),
    left: Math.max(0, (landed - 0.5) * LEAF_SPACING - LEAF_T / 2),
  }
}

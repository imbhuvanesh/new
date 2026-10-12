import * as THREE from 'three'
import type { LinkRect } from './engine'
import { renderPage, type Side } from './pages'

export type { LinkRect, Side }

/* ─────────────────────────────────────────────────────────────────────────────
   Page textures are rasterised on demand and kept in a small LRU cache, so the
   book never holds sixteen full-page bitmaps in GPU memory at once.
   ───────────────────────────────────────────────────────────────────────────── */

const FONT_SPECS = [
  '400 16px Inter',
  '500 16px Inter',
  '600 16px Inter',
  '400 16px "Cormorant Garamond"',
  '500 16px "Cormorant Garamond"',
  '600 16px "Cormorant Garamond"',
  '700 16px "Cormorant Garamond"',
  'italic 400 16px "Cormorant Garamond"',
  '400 16px "JetBrains Mono"',
  '500 16px "JetBrains Mono"',
  '400 16px Caveat',
  '600 16px Caveat',
]

export async function loadFonts(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  await Promise.all(FONT_SPECS.map((spec) => document.fonts.load(spec).catch(() => undefined)))
  try {
    await document.fonts.ready
  } catch {
    /* older browsers: the fallbacks are fine */
  }
}

type Entry = { texture: THREE.CanvasTexture; links: LinkRect[] }

const cache = new Map<string, Entry>()
const MAX_ENTRIES = 8

let printScale = 1

const keyOf = (chapter: number, side: Side) => `${chapter}:${side}`

function build(chapter: number, side: Side): Entry {
  const art = renderPage(chapter, side, printScale)
  const texture = new THREE.CanvasTexture(art.canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  if (side === 'verso') {
    // The back of a leaf is seen after it flips about the spine, which mirrors
    // it. Undo that here so left-hand pages read the right way round.
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.x = -1
    texture.offset.x = 1
  } else {
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
  }
  return { texture, links: art.links }
}

export function getPage(chapter: number, side: Side): Entry {
  const key = keyOf(chapter, side)
  const hit = cache.get(key)
  if (hit) {
    cache.delete(key)
    cache.set(key, hit)
    return hit
  }
  const entry = build(chapter, side)
  cache.set(key, entry)
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value as string | undefined
    if (oldest === undefined) break
    cache.get(oldest)?.texture.dispose()
    cache.delete(oldest)
  }
  return entry
}

export function hasPage(chapter: number, side: Side) {
  return cache.has(keyOf(chapter, side))
}

export function pageLinks(chapter: number, side: Side): LinkRect[] {
  return getPage(chapter, side).links
}

export function setPrintScale(scale: number) {
  if (scale === printScale) return
  clearPageCache()
  printScale = scale
}

export function clearPageCache() {
  for (const entry of cache.values()) entry.texture.dispose()
  cache.clear()
}

/**
 * Warm the cache for a list of pages without blocking the main thread.
 * Yields between pages so the opening animation never stutters.
 */
export function prefetch(pages: Array<[number, Side]>, onDone?: () => void) {
  let i = 0
  const step = () => {
    if (i >= pages.length) {
      onDone?.()
      return
    }
    const [chapter, side] = pages[i++]
    if (!hasPage(chapter, side)) getPage(chapter, side)
    window.setTimeout(step, 8)
  }
  window.setTimeout(step, 8)
}

/** The pages that must be resident for a given spread, plus one turn ahead/behind. */
export function pagesForSpread(spread: number, leafCount: number): Array<[number, Side]> {
  const out: Array<[number, Side]> = []
  const push = (c: number, s: Side) => {
    if (c >= 0 && c < leafCount && !out.some(([oc, os]) => oc === c && os === s)) out.push([c, s])
  }
  push(spread, 'recto')
  push(spread - 1, 'verso')
  push(spread, 'verso')
  push(spread + 1, 'recto')
  push(spread - 1, 'recto')
  push(spread - 2, 'verso')
  return out
}

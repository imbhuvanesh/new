import * as THREE from 'three'
import {
  createBackCoverArt,
  createEndpaperArt,
  createFrontCoverArt,
  createSpineArt,
  type BoardArt,
} from '../print/cover'
import {
  createDeskTextures,
  createEndpaperTexture,
  createLeather,
  createPageEdgeTexture,
  createPaper,
  type LeatherSet,
  type PaperSet,
} from './textures'

export type Kit = {
  leather: LeatherSet
  paper: PaperSet
  /** Marbled endpaper with the "Ex Libris" bookplate — the front board's verso. */
  bookplate: THREE.Texture
  /** Plain marbled endpaper — the back board's recto. */
  endpaper: THREE.Texture
  pageEdge: THREE.Texture
  desk: { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }
  frontCover: { map: THREE.Texture; surface: THREE.Texture }
  backCover: { map: THREE.Texture; surface: THREE.Texture }
  spine: { map: THREE.Texture; surface: THREE.Texture }
  blankPage: THREE.Texture
}

let kit: Kit | null = null

function toTexture(canvas: HTMLCanvasElement, srgb: boolean) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function board(art: BoardArt) {
  return { map: toTexture(art.map, true), surface: toTexture(art.surface, false) }
}

/** Built once, shared by every part of the book. */
export function getKit(): Kit {
  if (kit) return kit
  const leather = createLeather(512, 7)
  const paper = createPaper(512, 21)
  kit = {
    leather,
    paper,
    endpaper: createEndpaperTexture(),
    bookplate: toTexture(createEndpaperArt(), true),
    pageEdge: createPageEdgeTexture(),
    desk: createDeskTextures(512),
    frontCover: board(createFrontCoverArt()),
    backCover: board(createBackCoverArt()),
    spine: board(createSpineArt()),
    blankPage: paper.map.clone(),
  }
  kit.blankPage.wrapS = THREE.RepeatWrapping
  kit.blankPage.wrapT = THREE.RepeatWrapping
  kit.blankPage.repeat.set(2, 3)
  kit.blankPage.needsUpdate = true
  return kit
}

export function disposeKit() {
  if (!kit) return
  const seen = new Set<THREE.Texture>()
  const walk = (o: unknown) => {
    if (!o || typeof o !== 'object') return
    if (o instanceof THREE.Texture) {
      if (!seen.has(o)) {
        seen.add(o)
        o.dispose()
      }
      return
    }
    for (const v of Object.values(o as Record<string, unknown>)) walk(v)
  }
  walk(kit)
  kit = null
}

import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PW, PH } from '../print/engine'
import { getPage, pageLinks, type LinkRect, type Side } from '../print'
import { useBookStore } from '../state/useBookStore'
import { Board } from './Board'
import {
  BOARD_H,
  BOARD_T,
  BOARD_W,
  COVER_HINGE_CLOSED,
  COVER_HINGE_OPEN,
  LEAF_COUNT,
  LEAF_T,
  PAGE_H,
  PAGE_W,
  leafHeightLeft,
  leafHeightRight,
} from './constants'
import {
  createCurlUniforms,
  createLeafGeometry,
  createPageDepthMaterial,
  createPageMaterial,
  type CurlUniforms,
} from './curl'
import { input } from './input'
import type { Kit } from './kit'
import { getKit } from './kit'
import { motion } from './motion'
import { Spine } from './Spine'
import { Stack } from './Stack'

/* ─────────────────────────────────────────────────────────────────────────────
   The book itself. React builds it once; every frame of motion afterwards is
   read from the `motion` bus, so turning a page costs no re-renders at all.
   ───────────────────────────────────────────────────────────────────────────── */

/** How far a sheet floats free of the block at the height of its turn. */
const LIFT = 0.05

type LeafRig = {
  curl: CurlUniforms
  front: THREE.MeshStandardMaterial
  back: THREE.MeshStandardMaterial
  depth: THREE.MeshDepthMaterial
}

function openLink(url: string) {
  if (url.startsWith('book:')) {
    const st = useBookStore.getState()
    const rest = url.slice('book:'.length)
    if (rest === 'next') st.turnBy(1)
    else if (rest === 'prev') st.turnBy(-1)
    else if (rest === 'close') st.closeBook()
    else if (rest.startsWith('chapter:')) {
      const n = Number(rest.slice('chapter:'.length))
      if (Number.isFinite(n)) st.goToChapter(n)
    }
    return
  }
  if (url.startsWith('mailto:')) {
    window.location.href = url
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Turn a UV on a printed page into a hit against one of its link rectangles. */
function hitTest(chapter: number, side: Side, uv: THREE.Vector2 | undefined): LinkRect | null {
  if (!uv) return null
  const links = pageLinks(chapter, side)
  if (!links.length) return null
  const cx = (side === 'recto' ? uv.x : 1 - uv.x) * PW
  const cy = (1 - uv.y) * PH
  for (const l of links) {
    if (cx >= l.x && cx <= l.x + l.w && cy >= l.y && cy <= l.y + l.h) return l
  }
  return null
}

export function Book() {
  const kit = useMemo<Kit>(() => getKit(), [])
  const book = useRef<THREE.Group>(null)
  const cover = useRef<THREE.Group>(null)
  const leaves = useRef<Array<THREE.Group | null>>([])

  const geometry = useMemo(() => createLeafGeometry(26, 3), [])

  /* paper fibre, shared by every page so they compile one program between them */
  const pageGrain = useMemo(() => {
    const t = kit.paper.normalMap.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 3)
    t.needsUpdate = true
    return t
  }, [kit])

  const pageRough = useMemo(() => {
    const t = kit.paper.roughnessMap.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 3)
    t.needsUpdate = true
    return t
  }, [kit])

  const rigs = useMemo<LeafRig[]>(
    () =>
      Array.from({ length: LEAF_COUNT }, () => {
        const curl = createCurlUniforms(0.155)
        const shared = {
          map: kit.blankPage,
          normalMap: pageGrain,
          normalScale: new THREE.Vector2(0.16, 0.16),
          roughnessMap: pageRough,
          roughness: 1,
          metalness: 0,
          uniforms: curl,
        }
        return {
          curl,
          front: createPageMaterial({ ...shared, side: THREE.FrontSide }),
          back: createPageMaterial({ ...shared, side: THREE.BackSide }),
          depth: createPageDepthMaterial(0.155, curl),
        }
      }),
    [kit, pageGrain, pageRough],
  )

  /* Only the leaves within one step of the current spread hold a real page
     bitmap; everything else shows blank stock. Keeps the page cache tiny. */
  const assigned = useRef<number[]>(new Array(LEAF_COUNT).fill(-2))
  const lastSpreadIndex = useRef(-99)

  const applyTextures = (k: number) => {
    const lo = Math.max(0, k - 1)
    const hi = Math.min(LEAF_COUNT - 1, k + 1)
    for (let i = 0; i < LEAF_COUNT; i++) {
      const wanted = i >= lo && i <= hi ? i : -1
      if (assigned.current[i] === wanted) continue
      assigned.current[i] = wanted
      const rig = rigs[i]
      if (wanted >= 0) {
        rig.front.map = getPage(wanted, 'recto').texture
        rig.back.map = getPage(wanted, 'verso').texture
      } else {
        rig.front.map = kit.blankPage
        rig.back.map = kit.blankPage
      }
    }
  }

  useFrame(() => {
    const t = motion.turned
    const k = Math.floor(t + 1e-6)
    if (k !== lastSpreadIndex.current) {
      lastSpreadIndex.current = k
      applyTextures(k)
    }

    for (let i = 0; i < LEAF_COUNT; i++) {
      const g = leaves.current[i]
      if (!g) continue
      const p = Math.min(1, Math.max(0, t - i))
      // each sheet lifts, arcs and settles on its own beat
      const e = p * p * (3 - 2 * p)
      g.rotation.z = Math.PI * e
      g.position.y =
        leafHeightRight(i) +
        (leafHeightLeft(i) - leafHeightRight(i)) * e +
        LIFT * Math.sin(Math.PI * p)
      rigs[i].curl.uTurn.value = e
    }

    const c = cover.current
    if (c) {
      c.rotation.z = Math.PI * motion.open
      c.position.y =
        COVER_HINGE_CLOSED + (COVER_HINGE_OPEN - COVER_HINGE_CLOSED) * motion.open
    }

    // the whole volume leans, very slightly, towards the pointer
    const b = book.current
    if (b) {
      const sway = motion.sway
      b.rotation.y += (input.easedX * 0.024 * sway - b.rotation.y) * 0.07
      b.rotation.x += (-input.easedY * 0.017 * sway - b.rotation.x) * 0.07
    }
  })

  /* ── printed-page interaction ─────────────────────────────────────────── */

  const onMove = (leafIndex: number, side: Side) => (e: ThreeEvent<PointerEvent>) => {
    if (input.dragging) return
    e.stopPropagation()
    const hit = hitTest(leafIndex, side, e.uv)
    input.consumed = hit !== null
    const st = useBookStore.getState()
    const point = e.nativeEvent as unknown as { clientX?: number; clientY?: number }
    const next = hit
      ? { label: hit.label, x: point?.clientX ?? 0, y: point?.clientY ?? 0 }
      : null
    const cur = st.hover
    if (cur && next && cur.label === next.label && cur.x === next.x && cur.y === next.y) return
    st.setHover(next)
  }

  const onOut = () => {
    input.consumed = false
    const st = useBookStore.getState()
    if (st.hover) st.setHover(null)
  }

  const onClick = (leafIndex: number, side: Side) => (e: ThreeEvent<MouseEvent>) => {
    const st = useBookStore.getState()
    if (st.phase !== 'reading' || input.dragging) return
    e.stopPropagation()
    const hit = hitTest(leafIndex, side, e.uv)
    if (hit) {
      st.setHover(null)
      openLink(hit.url)
      return
    }
    // clicking the recto side of a leaf reads onwards; the verso side reads back
    st.turnBy(side === 'recto' ? 1 : -1)
  }

  return (
    <group ref={book}>
      {/* the back board: shut for good, its endpaper facing the reader */}
      <group position={[0, -BOARD_T / 2, 0]}>
        <Board
          kit={kit}
          width={BOARD_W}
          height={BOARD_H}
          thickness={BOARD_T}
          top={{ map: kit.endpaper }}
          bottom={{ map: kit.backCover.map, surface: kit.backCover.surface }}
        />
      </group>

      <Spine kit={kit} />

      {/* the remaining sheets on either side of the binding */}
      <Stack kit={kit} side="right" width={PAGE_W} height={PAGE_H} />
      <Stack kit={kit} side="left" width={PAGE_W} height={PAGE_H} />

      {/* eight leaves, one chapter per side */}
      {rigs.map((rig, i) => (
        <group
          key={i}
          ref={(el) => {
            leaves.current[i] = el
          }}
        >
          <mesh
            geometry={geometry}
            material={rig.front}
            position={[0, LEAF_T / 2, 0]}
            castShadow
            receiveShadow
            customDepthMaterial={rig.depth}
            onPointerMove={onMove(i, 'recto')}
            onPointerOut={onOut}
            onClick={onClick(i, 'recto')}
          />
          <mesh
            geometry={geometry}
            material={rig.back}
            position={[0, -LEAF_T / 2, 0]}
            receiveShadow
            onPointerMove={onMove(i, 'verso')}
            onPointerOut={onOut}
            onClick={onClick(i, 'verso')}
          />
        </group>
      ))}

      {/* the front board, hinged along the binding */}
      <group ref={cover} position={[0, COVER_HINGE_CLOSED, 0]}>
        <Board
          kit={kit}
          width={BOARD_W}
          height={BOARD_H}
          thickness={BOARD_T}
          top={{ map: kit.frontCover.map, surface: kit.frontCover.surface }}
          bottom={{ map: kit.bookplate, flipU: true }}
        />
      </group>
    </group>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BLOCK_H, stackTops } from './constants'
import type { Kit } from './kit'
import { motion } from './motion'

/* ─────────────────────────────────────────────────────────────────────────────
   The block of sheets underneath the leaf being read: a solid of paper whose
   height shrinks as pages move across to the other side. Only the three visible
   faces matter — the fore-edge, the head, and the top.
   ───────────────────────────────────────────────────────────────────────────── */

export type StackProps = {
  kit: Kit
  side: 'left' | 'right'
  width: number
  height: number
}

export function Stack({ kit, side, width, height }: StackProps) {
  const ref = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => new THREE.BoxGeometry(width, 1, height), [width, height])

  const foreEdge = useMemo(() => {
    const t = kit.pageEdge.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.needsUpdate = true
    return t
  }, [kit])

  const top = useMemo(() => {
    const t = kit.paper.map.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 3)
    t.needsUpdate = true
    return t
  }, [kit])

  /** Face order is +x, −x, +y, −y, +z, −z. */
  const faces = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({
      map: foreEdge,
      color: 0xf2e9d8,
      roughness: 0.86,
      metalness: 0,
    })
    const paper = new THREE.MeshStandardMaterial({
      map: top,
      color: 0xf4ecdd,
      roughness: 0.92,
      metalness: 0,
    })
    const dark = new THREE.MeshStandardMaterial({ color: 0x16100c, roughness: 0.95, metalness: 0 })

    // the fore-edge is whichever end points away from the binding
    return side === 'right'
      ? [edge, dark, paper, dark, edge, edge]
      : [dark, edge, paper, dark, edge, edge]
  }, [side, foreEdge, top])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const { left, right } = stackTops(motion.turned)
    const h = Math.max(0, side === 'left' ? left : right)
    const visible = h > 0.0015
    mesh.visible = visible
    if (!visible) return
    mesh.scale.y = h
    mesh.position.y = h / 2
    foreEdge.repeat.set(1, h / BLOCK_H)
  })

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={faces}
      position={[side === 'right' ? width / 2 : -width / 2, 0, 0]}
      castShadow
      receiveShadow
    />
  )
}

import { useMemo } from 'react'
import * as THREE from 'three'
import { boardFaceGeometry, boardSlabGeometry } from './geometry'
import type { Kit } from './kit'

/* ─────────────────────────────────────────────────────────────────────────────
   A single hardcover board: a leather slab with a printed face on either side.
   The front board is hinged by its parent; the back board is fixed.
   ───────────────────────────────────────────────────────────────────────────── */

export type BoardFace = {
  map: THREE.Texture
  /** G = roughness, B = metalness. Only the foil-stamped cover has one. */
  surface?: THREE.Texture
  /**
   * Mirror the artwork along the fore-edge axis. Needed for faces that are
   * only ever seen *through* the board (the front cover's endpaper).
   */
  flipU?: boolean
}

export type BoardProps = {
  kit: Kit
  /** Face that looks towards +Y in the board's own space. */
  top: BoardFace
  /** Face that looks towards −Y in the board's own space. */
  bottom: BoardFace
  width: number
  height: number
  thickness: number
}

export function Board({ kit, top, bottom, width, height, thickness }: BoardProps) {
  const faces = useMemo(() => boardFaceGeometry(width, height), [width, height])
  const slab = useMemo(() => boardSlabGeometry(width, height, thickness), [width, height, thickness])

  /** Fine pebbled grain, tiled across the boards and their faces. */
  const grain = useMemo(() => {
    const t = kit.leather.normalMap.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(5, 7)
    t.needsUpdate = true
    return t
  }, [kit])

  const bottomMap = useMemo(() => {
    if (!bottom.flipU) return bottom.map
    const t = bottom.map.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.ClampToEdgeWrapping
    t.repeat.set(-1, 1)
    t.offset.set(1, 0)
    t.needsUpdate = true
    return t
  }, [bottom.map, bottom.flipU])

  return (
    <group>
      {/* the slab: leather, with a bevelled edge catching the key light */}
      <mesh geometry={slab} castShadow receiveShadow>
        <meshStandardMaterial
          map={kit.leather.map}
          normalMap={grain}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          roughnessMap={kit.leather.roughnessMap}
          roughness={1}
          metalness={0.06}
        />
      </mesh>

      {/* outer face */}
      <mesh geometry={faces} rotation={[-Math.PI / 2, 0, 0]} position={[0, thickness / 2 + 0.0014, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          map={top.map}
          normalMap={grain}
          normalScale={new THREE.Vector2(0.32, 0.32)}
          roughnessMap={top.surface}
          metalnessMap={top.surface}
          roughness={top.surface ? 1 : 0.86}
          metalness={top.surface ? 1 : 0}
        />
      </mesh>

      {/* inner face */}
      <mesh
        geometry={faces}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -thickness / 2 - 0.0014, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          map={bottomMap}
          normalMap={grain}
          normalScale={new THREE.Vector2(0.25, 0.25)}
          roughnessMap={bottom.surface}
          metalnessMap={bottom.surface}
          roughness={bottom.surface ? 1 : 0.92}
          metalness={bottom.surface ? 1 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

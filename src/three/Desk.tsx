import { useMemo } from 'react'
import * as THREE from 'three'
import { DESK_Y } from './constants'
import { getKit } from './kit'

/**
 * The dark studio surface the book lies on. A single large plane: it catches
 * the contact shadow that actually sells the weight of the book.
 */
export function Desk() {
  const kit = useMemo(() => getKit(), [])

  const normalScale = useMemo(() => new THREE.Vector2(0.45, 0.45), [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DESK_Y, 0]} receiveShadow>
      <planeGeometry args={[46, 46, 1, 1]} />
      {/* The tint keeps the desk a good half-stop below the leather, so the book
          separates from the surface it lies on instead of merging with it. */}
      <meshStandardMaterial
        color="#b8a68e"
        map={kit.desk.map}
        normalMap={kit.desk.normalMap}
        normalScale={normalScale}
        roughnessMap={kit.desk.roughnessMap}
        roughness={1}
        metalness={0.03}
        envMapIntensity={0.25}
      />
    </mesh>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BOARD_H, BOARD_T, STACK_TOP_CLOSED } from './constants'
import { spineGeometry } from './geometry'
import type { Kit } from './kit'
import { motion } from './motion'

/**
 * The rounded leather spine. As the cover swings open the binding has to
 * "give": the arc flattens from a full half-round down to a thin lip.
 */
export function Spine({ kit }: { kit: Kit }) {
  const ref = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => spineGeometry(44), [])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    // outer face of the front cover: high when shut, flat on the desk when open
    const frontOuter = THREE.MathUtils.lerp(STACK_TOP_CLOSED + BOARD_T, -BOARD_T, motion.open)
    const radius = Math.max(0.014, (frontOuter + BOARD_T) / 2)
    mesh.scale.set(radius, radius, BOARD_H)
    mesh.position.y = -BOARD_T + radius
  })

  return (
    <mesh ref={ref} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={kit.spine.map}
        roughnessMap={kit.spine.surface}
        metalnessMap={kit.spine.surface}
        roughness={1}
        metalness={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

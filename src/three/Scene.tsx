import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { useIsMobile } from '../hooks/useMediaQuery'
import { Book } from './Book'
import { Desk } from './Desk'
import { Director } from './Director'
import { motion } from './motion'

/* ─────────────────────────────────────────────────────────────────────────────
   The studio: one warm key light in a dark room, a cold fill, a warm rim, and
   a tiny procedural environment so the foil has something to reflect.
   ───────────────────────────────────────────────────────────────────────────── */

function Lights() {
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.SpotLight>(null)
  const fill = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)

  // the spot needs a target that lives in the scene graph
  const target = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    const a = motion.ambiance
    if (ambient.current) ambient.current.intensity = 0.08 + a * 0.22
    if (key.current) key.current.intensity = 6 + a * 58
    if (fill.current) fill.current.intensity = 0.05 + a * 0.5
    if (rim.current) rim.current.intensity = 0.08 + a * 0.62
  })

  return (
    <>
      <ambientLight ref={ambient} color="#3b332b" />
      <primitive object={target} position={[0.5, 0, 0.12]} />
      <spotLight
        ref={key}
        position={[1.75, 3.4, 2.45]}
        target={target}
        angle={0.72}
        penumbra={0.92}
        distance={0}
        decay={2}
        color="#ffe6c0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.6}
        shadow-camera-far={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.016}
      />
      <directionalLight ref={fill} position={[-3.4, 1.7, 2.6]} color="#93a9cc" />
      <directionalLight ref={rim} position={[1.1, 1.9, -3.6]} color="#ffb178" />
    </>
  )
}

/** A low-resolution procedural environment — no HDR files to download. */
function Studio() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.environmentIntensity = 0.55
  }, [scene])

  return (
    <Environment resolution={64} frames={1}>
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#ffe3bd"
        scale={[8, 6, 1]}
        position={[2.5, 5, 3]}
        rotation={[-Math.PI / 2, 0, 0.4]}
      />
      <Lightformer
        form="rect"
        intensity={0.7}
        color="#7f9fd6"
        scale={[9, 4, 1]}
        position={[-5, 2.4, 1.5]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Lightformer
        form="circle"
        intensity={1.1}
        color="#ff9a55"
        scale={4}
        position={[2.5, 1.2, -5]}
      />
      <color attach="background" args={['#0a0908']} />
    </Environment>
  )
}

export function Scene() {
  const isMobile = useIsMobile()

  return (
    <Canvas
      className="book-canvas"
      shadows="percentage"
      dpr={[1, isMobile ? 1.5 : 1.9]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ fov: 30, near: 0.1, far: 120, position: [3.6, 2.5, 3.6] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.12
      }}
    >
      <color attach="background" args={['#08070a']} />
      <fogExp2 attach="fog" args={['#08070a', 0.052]} />

      <Director />
      <Lights />
      <Suspense fallback={null}>
        <Studio />
      </Suspense>
      <Desk />
      <Book />
    </Canvas>
  )
}

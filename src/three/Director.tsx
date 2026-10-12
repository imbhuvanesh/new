import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { playCoverClose, playCoverOpen, playPageTurn, playSettle } from '../audio/sound'
import { pagesForSpread, prefetch, type Side } from '../print'
import { useBookStore } from '../state/useBookStore'
import { LEAF_COUNT } from './constants'
import { input } from './input'
import { CAM, applyCam, camPos, motion, readingCam } from './motion'

/* ─────────────────────────────────────────────────────────────────────────────
   Stage direction: the opening shot, the camera, and the close of the book.
   All of it writes to the `motion` bus — nothing here re-renders React.
   ───────────────────────────────────────────────────────────────────────────── */

export function Director() {
  const camera = useThree((s) => s.camera)
  const phase = useBookStore((s) => s.phase)
  const spread = useBookStore((s) => s.spread)
  const effects = useBookStore((s) => s.effects)
  const settle = useBookStore((s) => s.settle)

  const intro = useRef<gsap.core.Timeline | null>(null)

  /* the widest shot, held behind the loading veil */
  useEffect(() => {
    Object.assign(motion.cam, camPos(CAM.introWide))
    motion.target.x = CAM.introWide.tx
    motion.target.y = CAM.introWide.ty
    motion.target.z = CAM.introWide.tz
  }, [])

  /* ── the cinematic opening ─────────────────────────────────────────────── */

  useEffect(() => {
    if (phase !== 'intro') return

    const reduced = useBookStore.getState().effects === 'reduced'

    if (reduced) {
      gsap.killTweensOf(motion)
      applyCam(readingCam())
      motion.turned = 0
      motion.ambiance = 1
      motion.open = 0
      const tw = gsap.to(motion, {
        open: 1,
        duration: 0.45,
        ease: 'power1.out',
        onComplete: () => useBookStore.getState().setPhase('reading'),
      })
      return () => tw.kill()
    }

    const closed = camPos(CAM.closed)
    const reading = readingCam()
    const readingPos = camPos(reading)
    Object.assign(motion.cam, camPos(CAM.introWide))
    motion.target.x = CAM.introWide.tx
    motion.target.y = CAM.introWide.ty
    motion.target.z = CAM.introWide.tz
    motion.open = 0
    motion.turned = 0
    motion.ambiance = 0

    const tl = gsap.timeline({
      onComplete: () => useBookStore.getState().setPhase('reading'),
    })
    // 1. the camera glides in out of the dark
    tl.to(motion.cam, { ...closed, duration: 1.7, ease: 'power2.out' }, 0)
    tl.to(
      motion.target,
      { x: CAM.closed.tx, y: CAM.closed.ty, z: CAM.closed.tz, duration: 1.7, ease: 'power2.out' },
      0,
    )
    tl.to(motion, { ambiance: 0.9, duration: 1.4, ease: 'power1.out' }, 0.15)
    // 2. the cover is lifted
    tl.to(motion, { open: 1, duration: 1.55, ease: 'power2.inOut', onStart: playCoverOpen }, 1.45)
    // 3. and we settle into the reading position
    tl.to(motion.cam, { ...readingPos, duration: 1.9, ease: 'power2.inOut' }, 1.85)
    tl.to(
      motion.target,
      { x: reading.tx, y: reading.ty, z: reading.tz, duration: 1.9, ease: 'power2.inOut' },
      1.85,
    )
    tl.to(motion, { ambiance: 1, duration: 1.1, ease: 'power1.out' }, 1.85)

    intro.current = tl
    return () => {
      tl.kill()
    }
  }, [phase])

  /* whenever we land in the reading pose, make sure the pose is actually there
     (this is also what makes "Skip Intro" land cleanly) */
  useEffect(() => {
    if (phase !== 'reading') return
    if (motion.open > 0.999 && motion.turned < 0.01 && motion.ambiance > 0.999) return
    intro.current?.kill()
    gsap.killTweensOf(motion)
    applyCam(readingCam())
    motion.open = 1
    motion.turned = 0
    motion.ambiance = 1
  }, [phase])

  /* ── page turns ────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (phase !== 'reading') return
    const from = motion.turned
    const to = spread
    if (Math.abs(from - to) < 0.02) {
      settle(to)
      return
    }

    // warm every page the sheets will show on the way across
    const list: Array<[number, Side]> = []
    const lo = Math.min(Math.round(from), to)
    const hi = Math.max(Math.round(from), to)
    for (let s = lo; s <= hi; s++) {
      for (const p of pagesForSpread(s, LEAF_COUNT)) {
        if (!list.some(([c, sd]) => c === p[0] && sd === p[1])) list.push(p)
      }
    }
    prefetch(list)

    const dist = Math.abs(to - from)
    const tw = gsap.to(motion, {
      turned: to,
      duration: Math.min(2.4, 0.66 + dist * 0.26),
      ease: dist > 1.01 ? 'power1.inOut' : 'power2.inOut',
      onStart: () => playPageTurn(to > from ? 1 : -1, Math.min(1, 0.45 + dist * 0.2)),
      onComplete: () => {
        settle(to)
        playSettle()
      },
    })
    return () => {
      tw.kill()
    }
  }, [spread, phase, settle])

  /* ── closing the book, and the end of the story ────────────────────────── */

  useEffect(() => {
    if (phase !== 'closing') return
    gsap.killTweensOf(motion)

    const dist = motion.turned
    const flip = Math.min(2, 0.24 * dist + 0.45)
    const finale = camPos(CAM.finale)

    const tl = gsap.timeline({
      onComplete: () => {
        useBookStore.getState().settle(0)
        useBookStore.getState().setPhase('closed')
      },
    })
    tl.to(
      motion,
      {
        turned: 0,
        duration: flip,
        ease: 'power2.inOut',
        onStart: () => {
          if (dist > 0.5) playPageTurn(-1, 1)
        },
      },
      0,
    )
    tl.to(
      motion,
      { open: 0, duration: 0.9, ease: 'power2.inOut', onStart: playCoverClose },
      flip + 0.1,
    )
    tl.to(motion.cam, { ...finale, duration: flip + 1.1, ease: 'power2.inOut' }, 0.35)
    tl.to(
      motion.target,
      { x: CAM.finale.tx, y: CAM.finale.ty, z: CAM.finale.tz, duration: flip + 1.1, ease: 'power2.inOut' },
      0.35,
    )
    tl.to(motion, { ambiance: 0.45, duration: 1.4, ease: 'power1.out' }, flip * 0.5)

    return () => {
      tl.kill()
    }
  }, [phase])

  /* ── pointer: parallax on the camera, sway on the book ─────────────────── */

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      input.ndc.x = (e.clientX / window.innerWidth) * 2 - 1
      input.ndc.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, delta) => {
    const k = Math.min(1, delta * 6)
    input.easedX += (input.ndc.x - input.easedX) * k
    input.easedY += (input.ndc.y - input.easedY) * k

    const full = effects === 'full'
    motion.sway = full ? 1 : 0.35
    motion.px = input.easedX
    motion.py = input.easedY

    const px = input.easedX * (full ? 1 : 0.25)
    const py = input.easedY * (full ? 1 : 0.25)
    const breathe = full ? Math.sin(state.clock.elapsedTime * 0.33) * 0.007 : 0

    camera.position.set(
      motion.cam.x + px * 0.2 + breathe,
      motion.cam.y + py * 0.13 + breathe * 0.5,
      motion.cam.z + px * 0.26,
    )
    camera.lookAt(motion.target.x, motion.target.y, motion.target.z)
  })

  return null
}

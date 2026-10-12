import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { playPageTurn } from '../audio/sound'
import { useBookStore } from '../state/useBookStore'
import { DRAG_THRESHOLD, LEAF_COUNT } from '../three/constants'
import { input } from '../three/input'
import { motion } from '../three/motion'

/**
 * Page turning, in the three ways people actually try:
 *   · drag a sheet across            (live, the paper follows the finger)
 *   · click a page                   (handled on the meshes themselves)
 *   · press an arrow key
 */
export function useTurnGestures(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let active = false
    let moved = false
    let startX = 0
    let startY = 0
    let base = 0
    let lo = 0
    let hi = 0

    const down = (e: PointerEvent) => {
      if (useBookStore.getState().phase !== 'reading') return
      active = true
      moved = false
      startX = e.clientX
      startY = e.clientY
      base = motion.turned
      lo = Math.max(0, Math.round(base) - 1)
      hi = Math.min(LEAF_COUNT, Math.round(base) + 1)
    }

    const move = (e: PointerEvent) => {
      if (!active) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (!moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD * 0.42) return
        // the gesture started on a printed link: let the link have it
        if (input.consumed) {
          active = false
          return
        }
        moved = true
        input.dragging = true
        gsap.killTweensOf(motion)
      }
      // a finger moving left pulls the right-hand sheet over
      const wanted = base - dx / 300
      motion.turned = Math.max(lo, Math.min(hi, wanted))
    }

    const up = () => {
      if (!active) {
        input.dragging = false
        return
      }
      active = false
      input.dragging = false
      if (!moved) return
      const st = useBookStore.getState()
      const target = Math.max(lo, Math.min(hi, Math.round(motion.turned)))
      gsap.killTweensOf(motion)
      gsap.to(motion, {
        turned: target,
        duration: 0.52,
        ease: 'power3.out',
        onStart: () => playPageTurn(target > base ? 1 : -1, 0.75),
        onComplete: () => st.settle(target),
      })
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [ref])
}

export function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useBookStore.getState()
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Escape') {
        if (st.contentsOpen) {
          st.setContentsOpen(false)
          return
        }
        if (st.readerOpen) {
          st.setReaderOpen(false)
          return
        }
        return
      }

      if (st.readerOpen || st.contentsOpen) return

      if (st.phase === 'intro' || st.phase === 'loading') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          st.skipIntro()
        }
        return
      }

      if (st.phase !== 'reading') return

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault()
          st.turnBy(1)
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          st.turnBy(-1)
          break
        case 'Home':
          e.preventDefault()
          st.goToChapter(0)
          break
        case 'End':
          e.preventDefault()
          st.goToChapter(LEAF_COUNT)
          break
        case 'c':
        case 'C':
          st.setContentsOpen(!st.contentsOpen)
          break
        case 't':
        case 'T':
          st.setReaderOpen(!st.readerOpen)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

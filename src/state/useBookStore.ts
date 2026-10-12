import { create } from 'zustand'
import { LEAF_COUNT } from '../data/portfolio'

export type Phase = 'loading' | 'intro' | 'reading' | 'closing' | 'closed'
export type EffectLevel = 'full' | 'reduced'

export const MAX_SPREAD = LEAF_COUNT // spread == number of leaves turned

type Hover = { label: string; x: number; y: number } | null

interface BookStore {
  /* lifecycle */
  phase: Phase
  setPhase: (p: Phase) => void

  /* navigation */
  spread: number
  settled: number
  isTurning: boolean
  turnBy: (dir: 1 | -1) => void
  goToChapter: (chapterIndex: number) => void
  settle: (spread: number) => void

  /* presentation */
  reducedMotion: boolean
  setReducedMotion: (v: boolean) => void
  effects: EffectLevel
  toggleEffects: () => void

  muted: boolean
  toggleMuted: () => void

  /* overlays */
  readerOpen: boolean
  setReaderOpen: (v: boolean) => void
  contentsOpen: boolean
  setContentsOpen: (v: boolean) => void

  /* pointer feedback */
  hover: Hover
  setHover: (h: Hover) => void

  /* actions */
  skipIntro: () => void
  closeBook: () => void
  reopenBook: () => void
}

const prefersReduced =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const clampSpread = (n: number) => Math.max(0, Math.min(MAX_SPREAD, Math.round(n)))

export const useBookStore = create<BookStore>((set, get) => ({
  phase: 'loading',
  setPhase: (phase) => set({ phase }),

  spread: 0,
  settled: 0,
  isTurning: false,

  turnBy: (dir) => {
    const { phase, spread, isTurning } = get()
    if (phase !== 'reading' || isTurning) return
    const next = clampSpread(spread + dir)
    if (next === spread) return
    set({ spread: next, isTurning: true })
  },

  goToChapter: (chapterIndex) => {
    const { phase, isTurning } = get()
    if (phase !== 'reading' || isTurning) return
    const next = clampSpread(chapterIndex)
    if (next === get().spread) return
    set({ spread: next, isTurning: true })
  },

  settle: (spread) =>
    set({ spread: clampSpread(spread), settled: clampSpread(spread), isTurning: false }),

  reducedMotion: prefersReduced,
  setReducedMotion: (v) =>
    set((s) => ({ reducedMotion: v, effects: v ? 'reduced' : s.effects })),

  effects: prefersReduced ? 'reduced' : 'full',
  toggleEffects: () =>
    set((s) => ({ effects: s.effects === 'full' ? 'reduced' : 'full' })),

  muted: true,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  readerOpen: false,
  setReaderOpen: (readerOpen) => set({ readerOpen }),
  contentsOpen: false,
  setContentsOpen: (contentsOpen) => set({ contentsOpen }),

  hover: null,
  setHover: (hover) => set({ hover }),

  skipIntro: () => {
    const { phase } = get()
    if (phase === 'intro' || phase === 'loading') {
      set({ phase: 'reading', spread: 0, settled: 0, isTurning: false })
    }
  },

  closeBook: () => {
    if (get().phase !== 'reading') return
    // the Director owns the closing choreography from here
    set({ phase: 'closing', isTurning: true })
  },

  reopenBook: () => {
    if (get().phase !== 'closed') return
    set({ phase: 'reading', spread: 0, settled: 0, isTurning: false })
  },
}))

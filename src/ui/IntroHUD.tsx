import { useEffect, useState } from 'react'
import { useBookStore } from '../state/useBookStore'

/**
 * The opening title card. It deliberately leaves the middle of the screen empty
 * so the camera move and the cover lifting are the thing you watch.
 */
export function IntroHUD() {
  const phase = useBookStore((s) => s.phase)
  const skipIntro = useBookStore((s) => s.skipIntro)
  const effects = useBookStore((s) => s.effects)
  const setReducedMotion = useBookStore((s) => s.setReducedMotion)

  const active = phase === 'intro'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!active) {
      setReady(false)
      return
    }
    const id = window.setTimeout(() => setReady(true), 2300)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 z-30 transition-opacity duration-700 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 bg-gradient-to-t from-black/70 to-transparent pb-12 pt-24">
        <div className={ready ? 'animate-rise text-center' : 'text-center opacity-0'}>
          <p className="font-serif text-2xl text-paper sm:text-3xl">Explore My Story</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-bronze">
            Drag a page · click an edge · arrow keys
          </p>
        </div>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setReducedMotion(effects !== 'reduced')
          }}
          className="ui-button rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]"
        >
          {effects === 'reduced' ? 'Motion: reduced' : 'Motion: full'}
        </button>
        <button
          type="button"
          onClick={skipIntro}
          className="ui-button rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]"
        >
          Skip intro
        </button>
      </div>
    </div>
  )
}

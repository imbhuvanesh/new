import { useBookStore } from '../state/useBookStore'

/** The few hundred milliseconds it takes to set the type. Never a slideshow. */
export function LoadingVeil() {
  const phase = useBookStore((s) => s.phase)
  const active = phase === 'loading'

  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 z-40 flex items-center justify-center bg-void transition-opacity duration-700 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">Shereya B</p>
        <p className="mt-4 font-serif text-3xl text-paper sm:text-4xl">Every Idea Has a Story</p>
        <div className="mx-auto mt-8 h-px w-44 overflow-hidden bg-white/10">
          <div className="h-full w-1/3 animate-[sweep_1.5s_ease-in-out_infinite] bg-bronze" />
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-deep/45">
          Preparing the press
        </p>
      </div>
    </div>
  )
}

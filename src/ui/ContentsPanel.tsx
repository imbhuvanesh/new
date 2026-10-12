import { useEffect, useRef } from 'react'
import { chapters, LEAF_COUNT } from '../data/portfolio'
import { useBookStore } from '../state/useBookStore'

/** A drawer listing the eight chapters. Choosing one flips straight to it. */
export function ContentsPanel() {
  const open = useBookStore((s) => s.contentsOpen)
  const setOpen = useBookStore((s) => s.setContentsOpen)
  const goToChapter = useBookStore((s) => s.goToChapter)
  const spread = useBookStore((s) => s.spread)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <div
      aria-hidden={!open}
      className={`absolute inset-0 z-30 transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label="Close chapters"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-black/55"
      />
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Chapters"
        className={`panel-scroll absolute right-0 top-0 h-full w-[19rem] max-w-[86vw] overflow-y-auto border-l border-bronze/25 bg-[#0d0b0a]/95 px-6 py-6 backdrop-blur-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">Contents</p>
          <button
            ref={closeRef}
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            aria-label="Close chapters"
            className="ui-button h-8 w-8 rounded-full"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="ui-rule mt-5 h-px" />

        <ol className="mt-5 space-y-1">
          {chapters.map((c, i) => {
            const here = spread === i
            return (
              <li key={c.id}>
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    goToChapter(i)
                    setOpen(false)
                  }}
                  className={`group flex w-full items-baseline gap-3 rounded px-3 py-3 text-left transition ${
                    here ? 'bg-bronze/10 text-paper' : 'text-paper-deep/80 hover:bg-white/5 hover:text-paper'
                  }`}
                >
                  <span className="w-8 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-bronze">
                    {c.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-lg leading-tight">{c.title}</span>
                    <span className="block truncate text-[11px] text-paper-deep/50">{c.kicker}</span>
                  </span>
                  {here ? <span className="text-[10px] text-bronze" aria-current="page">reading</span> : null}
                </button>
              </li>
            )
          })}
        </ol>

        <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.2em] text-paper-deep/40">
          {LEAF_COUNT} chapters · one story
        </p>
      </aside>
    </div>
  )
}

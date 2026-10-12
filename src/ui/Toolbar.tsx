import { chapters, LEAF_COUNT } from '../data/portfolio'
import { useBookStore } from '../state/useBookStore'

/* ─────────────────────────────────────────────────────────────────────────────
   The persistent chrome: where you are in the book, and how to get somewhere.
   ───────────────────────────────────────────────────────────────────────────── */

const PATHS: Record<string, string> = {
  prev: 'M15 18l-6-6 6-6',
  next: 'M9 6l6 6-6 6',
  contents: 'M4 6h16M4 12h16M4 18h11',
  read: 'M4 5h16v14H4zM8 5v14M13 9h4M13 13h4',
  close: 'M6 6l12 12M18 6L6 18',
  soundOn: 'M4 9h3l4-4v14l-4-4H4zM15 8a5 5 0 010 8',
  soundOff: 'M4 9h3l4-4v14l-4-4H4zM15 9l5 6M20 9l-5 6',
  motionFull: 'M12 3v6M12 15v6M3 12h6M15 12h6',
  motionReduced: 'M5 12h14',
}

function IconButton({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: keyof typeof PATHS
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`ui-button h-9 w-9 rounded-full ${active ? 'border-bronze-bright/70 text-bronze-bright' : ''}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d={PATHS[icon]} />
      </svg>
    </button>
  )
}

export function Toolbar() {
  const phase = useBookStore((s) => s.phase)
  const spread = useBookStore((s) => s.spread)
  const isTurning = useBookStore((s) => s.isTurning)
  const turnBy = useBookStore((s) => s.turnBy)
  const closeBook = useBookStore((s) => s.closeBook)
  const muted = useBookStore((s) => s.muted)
  const toggleMuted = useBookStore((s) => s.toggleMuted)
  const effects = useBookStore((s) => s.effects)
  const toggleEffects = useBookStore((s) => s.toggleEffects)
  const readerOpen = useBookStore((s) => s.readerOpen)
  const setReaderOpen = useBookStore((s) => s.setReaderOpen)
  const contentsOpen = useBookStore((s) => s.contentsOpen)
  const setContentsOpen = useBookStore((s) => s.setContentsOpen)

  const active = phase === 'reading'
  const pe = active ? 'pointer-events-auto' : 'pointer-events-none'
  const chapter = chapters[Math.min(spread, LEAF_COUNT - 1)]
  const left = String(spread * 2).padStart(2, '0')
  const right = String(spread * 2 + 1).padStart(2, '0')

  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 z-20 transition-opacity duration-500 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute left-5 top-5">
        <p className="font-serif text-lg leading-none text-paper">
          <span className="hidden sm:inline">Shereya B</span>
          <span className="sm:hidden">SB</span>
        </p>
        <p className="mt-1.5 hidden font-mono text-[9px] uppercase tracking-widest2 text-bronze sm:block">
          Every Idea Has a Story
        </p>
      </div>

      <div className={`absolute right-4 top-4 flex items-center gap-2 ${pe}`}>
        <IconButton
          icon="contents"
          label="Chapters"
          onClick={() => setContentsOpen(!contentsOpen)}
          active={contentsOpen}
        />
        <IconButton
          icon="read"
          label="Read as text"
          onClick={() => setReaderOpen(!readerOpen)}
          active={readerOpen}
        />
        <IconButton
          icon={muted ? 'soundOff' : 'soundOn'}
          label={muted ? 'Sound off' : 'Sound on'}
          onClick={toggleMuted}
          active={!muted}
        />
        <IconButton
          icon={effects === 'reduced' ? 'motionReduced' : 'motionFull'}
          label={effects === 'reduced' ? 'Motion reduced' : 'Motion full'}
          onClick={toggleEffects}
          active={effects === 'reduced'}
        />
        <IconButton icon="close" label="Close the book" onClick={closeBook} disabled={!active} />
      </div>

      <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-2.5">
        <div
          className={`flex items-center gap-1 rounded-full border border-bronze/25 bg-black/55 px-2 py-1.5 backdrop-blur-md ${pe}`}
        >
          <button
            type="button"
            aria-label="Previous page"
            disabled={!active || isTurning || spread <= 0}
            onClick={() => turnBy(-1)}
            className="ui-button h-9 w-9 rounded-full border-transparent bg-transparent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4" aria-hidden="true">
              <path d={PATHS.prev} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-[9.5rem] px-2 text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-bronze">
              {left} — {right}
            </p>
            <p className="truncate font-serif text-[13px] leading-tight text-paper">{chapter.title}</p>
          </div>
          <button
            type="button"
            aria-label="Next page"
            disabled={!active || isTurning || spread >= LEAF_COUNT}
            onClick={() => turnBy(1)}
            className="ui-button h-9 w-9 rounded-full border-transparent bg-transparent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4" aria-hidden="true">
              <path d={PATHS.next} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p
          className={`font-mono text-[9px] uppercase tracking-[0.2em] text-paper-deep/40 transition-opacity duration-700 ${
            spread === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Drag, click a page edge, or use ← →
        </p>
      </div>
    </div>
  )
}

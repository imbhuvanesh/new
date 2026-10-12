import { profile, socials } from '../data/portfolio'
import { useBookStore } from '../state/useBookStore'

/** Shown once the book has been closed for good. */
export function EndCard() {
  const phase = useBookStore((s) => s.phase)
  const reopen = useBookStore((s) => s.reopenBook)
  const active = phase === 'closed'

  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 z-30 flex items-center justify-center px-5 transition-opacity duration-700 ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="w-full max-w-md animate-rise rounded border border-bronze/25 bg-black/72 px-7 py-8 text-center backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">The End</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-paper">{profile.closing}</h2>
        <p className="mt-4 text-sm leading-relaxed text-paper-deep/75">{profile.invitation}</p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a className="ui-button rounded px-4 py-2 text-sm" href={`mailto:${profile.email}`}>
            Write to me
          </a>
          <button type="button" className="ui-button rounded px-4 py-2 text-sm" onClick={reopen}>
            Read it again
          </button>
        </div>

        <div className="ui-rule mt-7 h-px" />

        <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-bronze transition hover:text-bronze-bright"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

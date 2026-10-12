import { profile } from '../data/portfolio'
import { BookText } from '../ui/BookText'

/**
 * The static edition. Same content, same typography, no WebGL — for browsers
 * (or machines) that cannot run the 3D book at all.
 */
export function Fallback() {
  return (
    <div className="panel-scroll absolute inset-0 overflow-y-auto bg-void">
      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">Static edition</p>
        <p className="mt-3 max-w-prose text-sm text-paper-deep/60">
          Your browser cannot start WebGL, so the interactive book has been set aside. Everything it contains is
          here in full.
        </p>
        <div className="ui-rule mt-8 h-px" />
        <div className="mt-10">
          <BookText idPrefix="static" />
        </div>
        <div className="ui-rule mt-14 h-px" />
        <p className="mt-6 pb-10 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-deep/40">
          {profile.name} · {profile.location}
        </p>
      </div>
    </div>
  )
}

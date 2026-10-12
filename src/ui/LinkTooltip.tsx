import { useBookStore } from '../state/useBookStore'

/** A small caption that follows the pointer while it is over a printed link. */
export function LinkTooltip() {
  const hover = useBookStore((s) => s.hover)
  if (!hover) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const left = Math.min(hover.x + (isMobile ? 0 : 18), (typeof window !== 'undefined' ? window.innerWidth : 0) - 210)
  const top = Math.max(hover.y - 14, 12)

  return (
    <div
      role="status"
      className="pointer-events-none absolute z-20 max-w-[13rem] animate-fade rounded border border-bronze/35 bg-black/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bronze-bright backdrop-blur"
      style={{ left, top }}
    >
      {hover.label}
    </div>
  )
}

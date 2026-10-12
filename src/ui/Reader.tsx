import { useEffect, useRef } from 'react'
import { useBookStore } from '../state/useBookStore'
import { BookText } from './BookText'

/**
 * Everything the book prints, as a normal scrollable page. It doubles as the
 * escape hatch for anyone who would rather read than turn pages.
 */
export function Reader() {
  const open = useBookStore((s) => s.readerOpen)
  const setOpen = useBookStore((s) => s.setReaderOpen)
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
      className={`absolute inset-0 z-40 transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-void/95 backdrop-blur-xl" />
      <div className="panel-scroll relative h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
          <div className="mb-10 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">Read as text</p>
            <button
              ref={closeRef}
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="ui-button rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
            >
              Back to the book
            </button>
          </div>
          <BookText idPrefix="reader" />
          <div className="ui-rule mt-14 h-px" />
          <p className="mt-6 pb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-deep/40">
            Esc closes this view
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { BookErrorBoundary } from './components/BookErrorBoundary'
import { BookExperience } from './components/BookExperience'
import { Fallback } from './components/Fallback'
import { LEAF_COUNT } from './data/portfolio'
import { useHasWebGL } from './hooks/useMediaQuery'
import { getPage, loadFonts, pagesForSpread, prefetch, setPrintScale } from './print'
import { useBookStore } from './state/useBookStore'
import { getKit } from './three/kit'
import { A11yContent } from './ui/A11yContent'

/**
 * Boot sequence, deliberately short:
 *   1. the veil paints (so there is never a blank screen)
 *   2. fonts load, textures are drawn at a resolution suited to the device
 *   3. the cover and the first spread are rasterised up front
 *   4. the curtain lifts and the camera starts moving
 */
export default function App() {
  const hasWebGL = useHasWebGL()
  const setPhase = useBookStore((s) => s.setPhase)
  const booted = useRef(false)

  useEffect(() => {
    if (booted.current || !hasWebGL) return
    booted.current = true
    let cancelled = false

    const start = () => {
      void (async () => {
        try {
          await loadFonts()
        } catch {
          /* fallback faces are fine */
        }
        if (cancelled) return

        const small = window.innerWidth < 768
        setPrintScale(small ? 0.56 : 0.92)

        // the hardcover and the first spread, before anyone can see them
        getKit()
        getPage(0, 'recto')
        getPage(0, 'verso')
        getPage(1, 'recto')
        if (cancelled) return

        // never clobber a phase the reader has already moved on to
        if (useBookStore.getState().phase === 'loading') setPhase('intro')
        prefetch(pagesForSpread(0, LEAF_COUNT))
      })()
    }

    // let the browser paint the veil before we do any drawing
    const id = window.setTimeout(start, 24)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [hasWebGL, setPhase])

  if (!hasWebGL) return <Fallback />

  return (
    <BookErrorBoundary>
      <A11yContent />
      <BookExperience />
    </BookErrorBoundary>
  )
}

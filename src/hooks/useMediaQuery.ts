import { useEffect, useState } from 'react'

/** Tailwind-free media query hook that stays in sync with the browser. */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return fallback
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)')

/** Detects whether the device can realistically render WebGL. */
export function useHasWebGL(): boolean {
  return useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      // three.js only speaks WebGL2 — a WebGL1 (or legacy alias) context is not
      // enough, and mounting the scene anyway would throw and blank the page.
      const gl = canvas.getContext('webgl2')
      if (!gl) return false
      // hand the probe context straight back; browsers cap how many may exist
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      return true
    } catch {
      return false
    }
  })[0]
}

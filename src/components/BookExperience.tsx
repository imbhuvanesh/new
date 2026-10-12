import { useEffect, useRef } from 'react'
import { setAudioMuted } from '../audio/sound'
import { useBookStore } from '../state/useBookStore'
import { Scene } from '../three/Scene'
import { ContentsPanel } from '../ui/ContentsPanel'
import { EndCard } from '../ui/EndCard'
import { useKeyboard, useTurnGestures } from '../ui/gestures'
import { IntroHUD } from '../ui/IntroHUD'
import { LinkTooltip } from '../ui/LinkTooltip'
import { LoadingVeil } from '../ui/LoadingVeil'
import { Reader } from '../ui/Reader'
import { Toolbar } from '../ui/Toolbar'

/** The 3D stage plus every piece of chrome that floats above it. */
export function BookExperience() {
  const stage = useRef<HTMLDivElement>(null)
  const muted = useBookStore((s) => s.muted)
  const hover = useBookStore((s) => s.hover)

  useTurnGestures(stage)
  useKeyboard()

  useEffect(() => {
    setAudioMuted(muted)
  }, [muted])

  return (
    <div
      ref={stage}
      className={`book-stage absolute inset-0 ${hover ? 'cursor-pointer' : ''}`}
    >
      <Scene />
      <div className="stage-vignette" />
      <div className="stage-grain" aria-hidden="true" />

      <Toolbar />
      <LinkTooltip />
      <ContentsPanel />
      <Reader />
      <EndCard />
      <IntroHUD />
      <LoadingVeil />
    </div>
  )
}

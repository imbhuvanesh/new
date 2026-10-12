/**
 * Procedurally synthesised paper sounds — no audio files to ship, nothing to
 * download, and nothing plays before the visitor interacts with the page.
 */

let ctx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null
let muted = true

export function setAudioMuted(value: boolean) {
  muted = value
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Call from a user gesture so the browser unlocks audio for the session. */
export function primeAudio() {
  const c = ensureContext()
  if (c && !noiseBuffer) noiseBuffer = makeNoise(c, 1.2)
}

function makeNoise(c: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(c.sampleRate * seconds)
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    // light brown-noise shaping: softer, more paper-like than pure white
    last = (last + 0.02 * white) / 1.02
    data[i] = white * 0.55 + last * 3.2
  }
  return buffer
}

type SwishOptions = {
  duration?: number
  from?: number
  to?: number
  peak?: number
  q?: number
}

function swish(c: AudioContext, o: SwishOptions = {}) {
  const { duration = 0.42, from = 700, to = 2600, peak = 0.16, q = 1.1 } = o
  if (!noiseBuffer) noiseBuffer = makeNoise(c, 1.2)

  const now = c.currentTime
  const src = c.createBufferSource()
  src.buffer = noiseBuffer
  src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.16

  const band = c.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = q
  band.frequency.setValueAtTime(from, now)
  band.frequency.exponentialRampToValueAtTime(Math.max(120, to), now + duration * 0.85)

  const high = c.createBiquadFilter()
  high.type = 'highpass'
  high.frequency.value = 380

  const gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + duration * 0.22)
  gain.gain.exponentialRampToValueAtTime(peak * 0.35, now + duration * 0.62)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  src.connect(band).connect(high).connect(gain).connect(c.destination)
  src.start(now)
  src.stop(now + duration + 0.05)

  // A few tiny paper "crackles" layered on top.
  const crackles = 4
  for (let i = 0; i < crackles; i++) {
    const t = now + duration * (0.1 + Math.random() * 0.75)
    const cs = c.createBufferSource()
    cs.buffer = noiseBuffer
    cs.playbackRate.value = 1.6 + Math.random()
    const cf = c.createBiquadFilter()
    cf.type = 'bandpass'
    cf.frequency.value = 1800 + Math.random() * 2600
    cf.Q.value = 3
    const cg = c.createGain()
    cg.gain.setValueAtTime(0.0001, t)
    cg.gain.exponentialRampToValueAtTime(0.03 * peak * 8, t + 0.004)
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    cs.connect(cf).connect(cg).connect(c.destination)
    cs.start(t)
    cs.stop(t + 0.08)
  }
}

function thud(c: AudioContext, { freq = 92, peak = 0.24, duration = 0.5 } = {}) {
  const now = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq * 1.6, now)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(peak, now + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(g).connect(c.destination)
  osc.start(now)
  osc.stop(now + duration + 0.05)
}

export function playPageTurn(direction: 1 | -1 = 1, strength = 1) {
  if (muted) return
  const c = ensureContext()
  if (!c) return
  const to = direction === 1 ? 2800 : 900
  swish(c, { duration: 0.4, from: direction === 1 ? 620 : 1500, to, peak: 0.14 * strength })
}

export function playCoverOpen() {
  if (muted) return
  const c = ensureContext()
  if (!c) return
  swish(c, { duration: 0.9, from: 380, to: 1500, peak: 0.11, q: 0.8 })
  thud(c, { freq: 74, peak: 0.13, duration: 0.7 })
}

export function playCoverClose() {
  if (muted) return
  const c = ensureContext()
  if (!c) return
  swish(c, { duration: 0.55, from: 1400, to: 320, peak: 0.1 })
  thud(c, { freq: 66, peak: 0.3, duration: 0.6 })
}

export function playSettle() {
  if (muted) return
  const c = ensureContext()
  if (!c) return
  swish(c, { duration: 0.22, from: 1200, to: 600, peak: 0.035 })
}

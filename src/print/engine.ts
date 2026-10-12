import { PAGE_H, PAGE_W } from '../three/constants'

/* ─────────────────────────────────────────────────────────────────────────────
   A tiny "print engine": the primitives used to typeset every page of the book
   onto a 2D canvas, which then becomes the page's texture.
   ───────────────────────────────────────────────────────────────────────────── */

export const PW = 1024
export const PH = Math.round((PW * PAGE_H) / PAGE_W) // ≈ 1428

export type Ctx = CanvasRenderingContext2D

export const F = {
  serif: '"Cormorant Garamond", Georgia, serif',
  sans: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  hand: 'Caveat, cursive',
} as const

export const C = {
  ink: '#241c17',
  inkSoft: '#4f4338',
  inkFaint: '#8d8073',
  accent: '#7a2233',
  bronze: '#8a6a3a',
  bronzeLight: '#b08d57',
  paper: '#f4ecdd',
  rule: '#c9b795',
} satisfies Record<string, string>

export type Gutter = 'left' | 'right'

/** The printable area of a page, already aware of which side the binding is on. */
export type Metrics = {
  gutter: Gutter
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
  /** x of the binding edge */
  spineX: number
  /** x of the outer (fore) edge */
  foreX: number
}

export function metrics(gutter: Gutter): Metrics {
  const outer = 92
  const bind = 116
  const top = 96
  const bottom = 116
  const left = gutter === 'left' ? bind : outer
  const right = gutter === 'left' ? PW - outer : PW - bind
  return {
    gutter,
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: PH - top - bottom,
    spineX: gutter === 'left' ? 0 : PW,
    foreX: gutter === 'left' ? PW : 0,
  }
}

export function font(ctx: Ctx, size: number, family: string = F.sans, weight: number | string = 400, italic = false) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`
}

/* ── text ─────────────────────────────────────────────────────────────────── */

export function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export type ParaOptions = {
  text: string
  x: number
  y: number
  width: number
  size?: number
  family?: string
  weight?: number | string
  italic?: boolean
  color?: string
  lineHeight?: number
  align?: 'left' | 'right'
  /** Extra space added after a paragraph break inside `text` (\n\n). */
  paraSpace?: number
  maxLines?: number
}

/** Draws a paragraph and returns the y position just below it. */
export function para(ctx: Ctx, o: ParaOptions): number {
  const {
    text,
    x,
    y,
    width,
    size = 26,
    family = F.sans,
    weight = 400,
    italic = false,
    color = C.inkSoft,
    lineHeight = 1.6,
    align = 'left',
    paraSpace = 0.62,
    maxLines = Infinity,
  } = o
  font(ctx, size, family, weight, italic)
  ctx.fillStyle = color
  ctx.textAlign = align === 'right' ? 'right' : 'left'
  const ax = align === 'right' ? x + width : x
  const lh = size * lineHeight
  let cy = y + size
  let drawn = 0
  const blocks = text.split('\n\n')
  blocks.forEach((block, bi) => {
    const lines = wrap(ctx, block, width)
    for (const line of lines) {
      if (drawn >= maxLines) return
      ctx.fillText(line, ax, cy)
      cy += lh
      drawn++
    }
    if (bi < blocks.length - 1) cy += size * paraSpace
  })
  ctx.textAlign = 'left'
  return cy
}

export function measurePara(o: Omit<ParaOptions, 'x' | 'y'>): number {
  const { text, width, size = 26, family = F.sans, weight = 400, lineHeight = 1.6, paraSpace = 0.62 } = o
  const probe = makeCanvas(8, 8).ctx
  font(probe, size, family, weight)
  const lh = size * lineHeight
  let total = 0
  const blocks = text.split('\n\n')
  blocks.forEach((block, bi) => {
    total += wrap(probe, block, width).length * lh
    if (bi < blocks.length - 1) total += size * paraSpace
  })
  return total
}

/** Letter-spaced text — used for kickers, labels and running heads. */
export function tracked(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  o: {
    size?: number
    family?: string
    weight?: number | string
    color?: string
    tracking?: number
    align?: 'left' | 'right' | 'center'
    upper?: boolean
  } = {},
) {
  const {
    size = 15,
    family = F.sans,
    weight = 600,
    color = C.inkSoft,
    tracking = 3.2,
    align = 'left',
    upper = true,
  } = o
  const t = upper ? text.toUpperCase() : text
  font(ctx, size, family, weight)
  const widths = [...t].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, t.length - 1)
  let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  for (let i = 0; i < t.length; i++) {
    ctx.fillText(t[i], cx, y)
    cx += widths[i] + tracking
  }
  return total
}

/* ── rules & ornaments ────────────────────────────────────────────────────── */

export function rule(
  ctx: Ctx,
  x: number,
  y: number,
  width: number,
  o: { color?: string; thickness?: number; dash?: number[] } = {},
) {
  const { color = C.rule, thickness = 1, dash } = o
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = thickness
  if (dash) ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x, y + thickness / 2)
  ctx.lineTo(x + width, y + thickness / 2)
  ctx.stroke()
  ctx.restore()
}

/** A small diamond-and-lines ornament, used as a chapter separator. */
export function ornament(ctx: Ctx, cx: number, y: number, width = 160, color = C.bronze) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - width / 2, y)
  ctx.lineTo(cx - 12, y)
  ctx.moveTo(cx + 12, y)
  ctx.lineTo(cx + width / 2, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, y - 5)
  ctx.lineTo(cx + 5, y)
  ctx.lineTo(cx, y + 5)
  ctx.lineTo(cx - 5, y)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function chapterNumeral(ctx: Ctx, number: string, x: number, y: number, size = 200, color = C.rule) {
  font(ctx, size, F.serif, 600)
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.fillText(number, x, y)
  ctx.textAlign = 'left'
}

/** Handwritten marginal note. */
export function annotate(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  o: { size?: number; color?: string; rotate?: number; align?: 'left' | 'right' } = {},
) {
  const { size = 34, color = C.accent, rotate = -0.035, align = 'left' } = o
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotate)
  font(ctx, size, F.hand, 600)
  ctx.fillStyle = color
  ctx.textAlign = align === 'right' ? 'right' : 'left'
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

/* ── page furniture ───────────────────────────────────────────────────────── */

/** Warm, slightly uneven paper base plus the shadow that falls into the gutter. */
export function paperBase(ctx: Ctx, m: Metrics) {
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, PW, PH)

  const wash = ctx.createLinearGradient(0, 0, PW, PH)
  wash.addColorStop(0, 'rgba(255,250,238,0.55)')
  wash.addColorStop(0.55, 'rgba(255,248,232,0.12)')
  wash.addColorStop(1, 'rgba(206,188,156,0.30)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, PW, PH)

  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  const rnd = (x: number) => Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1
  for (let i = 0; i < 26; i++) {
    const gx = rnd(i + 1) * PW
    const gy = rnd(i + 33) * PH
    const gr = 90 + rnd(i + 71) * 220
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
    g.addColorStop(0, `rgba(200,182,150,${0.03 + rnd(i + 5) * 0.035})`)
    g.addColorStop(1, 'rgba(200,182,150,0)')
    ctx.fillStyle = g
    ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2)
  }
  ctx.restore()

  gutterShadow(ctx, m)
}

export function gutterShadow(ctx: Ctx, m: Metrics) {
  const depth = 150
  const from = m.gutter === 'left' ? 0 : PW
  const to = m.gutter === 'left' ? depth : PW - depth
  const g = ctx.createLinearGradient(from, 0, to, 0)
  g.addColorStop(0, 'rgba(58,42,26,0.42)')
  g.addColorStop(0.28, 'rgba(58,42,26,0.14)')
  g.addColorStop(1, 'rgba(58,42,26,0)')
  ctx.fillStyle = g
  ctx.fillRect(Math.min(from, to), 0, depth, PH)

  // a whisper of light along the outer edge
  const outerFrom = m.gutter === 'left' ? PW : 0
  const outerTo = m.gutter === 'left' ? PW - 60 : 60
  const g2 = ctx.createLinearGradient(outerFrom, 0, outerTo, 0)
  g2.addColorStop(0, 'rgba(255,252,242,0.35)')
  g2.addColorStop(1, 'rgba(255,252,242,0)')
  ctx.fillStyle = g2
  ctx.fillRect(Math.min(outerFrom, outerTo), 0, 60, PH)
}

export function runningHead(ctx: Ctx, m: Metrics, chapter: string, pageNo: string) {
  const y = m.top - 34
  if (m.gutter === 'left') {
    tracked(ctx, chapter, PW - 92, y, { align: 'right', color: C.inkFaint, size: 13, tracking: 3.6 })
  } else {
    tracked(ctx, chapter, 92, y, { color: C.inkFaint, size: 13, tracking: 3.6 })
  }
  rule(ctx, m.left, y + 16, m.width, { color: 'rgba(201,183,149,0.8)' })

  const fy = PH - 58
  if (m.gutter === 'left') {
    font(ctx, 20, F.serif, 600)
    ctx.fillStyle = C.inkFaint
    ctx.textAlign = 'left'
    ctx.fillText(pageNo, 92, fy)
  } else {
    font(ctx, 20, F.serif, 600)
    ctx.fillStyle = C.inkFaint
    ctx.textAlign = 'right'
    ctx.fillText(pageNo, PW - 92, fy)
  }
  ctx.textAlign = 'left'
}

/* ── framed plates ────────────────────────────────────────────────────────── */

export type LinkRect = { url: string; label: string; x: number; y: number; w: number; h: number }

export type Rect = { x: number; y: number; w: number; h: number }

export function frame(
  ctx: Ctx,
  r: Rect,
  o: { inset?: number; color?: string; thickness?: number; shadow?: boolean } = {},
) {
  const { inset = 0, color = 'rgba(36,28,23,0.55)', thickness = 2, shadow = true } = o
  ctx.save()
  if (shadow) {
    ctx.shadowColor = 'rgba(60,44,26,0.28)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetY = 8
  }
  ctx.strokeStyle = color
  ctx.lineWidth = thickness
  ctx.strokeRect(r.x + inset, r.y + inset, r.w - inset * 2, r.h - inset * 2)
  ctx.restore()
}

export function caption(ctx: Ctx, text: string, x: number, y: number, o: { align?: 'left' | 'right'; color?: string; width?: number } = {}) {
  const { align = 'left', color = C.inkFaint } = o
  font(ctx, 15, F.mono, 400)
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(text, x, y)
  ctx.textAlign = 'left'
}

export function roundedRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  return { canvas, ctx }
}

export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

import { C, F, font, hash, roundedRect, type Ctx, type Rect } from './engine'

/* ─────────────────────────────────────────────────────────────────────────────
   Procedural imagery. Real screenshots can be dropped in later by setting
   `image` on a project — otherwise a plate is generated from the project's own
   colours, so nothing in the book is ever an empty box.
   ───────────────────────────────────────────────────────────────────────────── */

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(Math.min(255, Math.max(0, ((n >> 16) & 255) * amount)))
  const g = Math.round(Math.min(255, Math.max(0, ((n >> 8) & 255) * amount)))
  const b = Math.round(Math.min(255, Math.max(0, (n & 255) * amount)))
  return `rgb(${r},${g},${b})`
}

function chrome(ctx: Ctx, r: Rect, accent: string, label: string) {
  const barH = Math.max(22, r.h * 0.075)
  ctx.fillStyle = shade(accent, 0.9)
  roundedRect(ctx, r.x, r.y, r.w, barH, barH / 2.6)
  ctx.fill()
  ctx.fillStyle = shade(accent, 1.7)
  ctx.fillRect(r.x, r.y + barH - 6, r.w, 6)
  const dotR = Math.max(3, barH * 0.13)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(r.x + barH * 0.5 + i * dotR * 3.2, r.y + barH / 2, dotR, 0, Math.PI * 2)
    ctx.fillStyle = i === 0 ? 'rgba(255,235,220,0.75)' : 'rgba(255,235,220,0.38)'
    ctx.fill()
  }
  const pillX = r.x + barH * 2.4
  const pillW = r.w - (pillX - r.x) - barH * 0.7
  if (pillW > 40) {
    ctx.fillStyle = 'rgba(0,0,0,0.24)'
    roundedRect(ctx, pillX, r.y + barH * 0.24, pillW, barH * 0.52, barH * 0.26)
    ctx.fill()
    font(ctx, Math.max(9, barH * 0.3), F.mono, 400)
    ctx.fillStyle = 'rgba(255,240,225,0.72)'
    ctx.fillText(label, pillX + barH * 0.4, r.y + barH * 0.62)
  }
  return r.y + barH
}

function lines(ctx: Ctx, x: number, y: number, w: number, count: number, gap: number, color: string, lastScale = 0.6) {
  ctx.fillStyle = color
  for (let i = 0; i < count; i++) {
    const lw = i === count - 1 ? w * lastScale : w * (0.72 + ((i * 37) % 28) / 100)
    ctx.fillRect(x, y + i * gap, lw, Math.max(2, gap * 0.28))
  }
}

/** A "screenshot" of the project, drawn from its own palette. */
export function drawProjectPlate(ctx: Ctx, r: Rect, accent: string, title: string, mark: string) {
  ctx.save()
  roundedRect(ctx, r.x, r.y, r.w, r.h, 10)
  ctx.clip()

  const bg = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h)
  bg.addColorStop(0, shade(accent, 0.42))
  bg.addColorStop(1, shade(accent, 0.16))
  ctx.fillStyle = bg
  ctx.fillRect(r.x, r.y, r.w, r.h)

  const bodyTop = chrome(ctx, r, accent, `shereya05 / ${title.toLowerCase().replace(/\s+/g, '-')}`)
  const pad = Math.max(14, r.w * 0.05)
  const bx = r.x + pad
  const bw = r.w - pad * 2
  const variant = Math.floor(hash(accent + title) * 3)

  const light = 'rgba(255,248,238,0.9)'
  const faint = 'rgba(255,248,238,0.22)'

  if (variant === 0) {
    // hero + card grid
    const heroH = (r.y + r.h - bodyTop) * 0.42
    ctx.fillStyle = 'rgba(255,250,242,0.94)'
    roundedRect(ctx, bx, bodyTop + pad * 0.6, bw, heroH, 8)
    ctx.fill()
    lines(ctx, bx + pad, bodyTop + pad, bw - pad * 2, 3, heroH * 0.17, shade(accent, 0.7), 0.55)
    const gy = bodyTop + pad * 0.6 + heroH + pad * 0.7
    const cardW = (bw - pad * 0.8) / 2
    const cardH = Math.max(20, r.y + r.h - gy - pad)
    for (let i = 0; i < 2; i++) {
      const cx = bx + i * (cardW + pad * 0.8)
      ctx.fillStyle = 'rgba(255,250,242,0.86)'
      roundedRect(ctx, cx, gy, cardW, cardH, 8)
      ctx.fill()
      ctx.fillStyle = shade(accent, 1.25)
      roundedRect(ctx, cx + pad * 0.6, gy + pad * 0.6, cardW - pad * 1.2, cardH * 0.3, 5)
      ctx.fill()
      lines(ctx, cx + pad * 0.6, gy + cardH * 0.48, cardW - pad * 1.6, 3, cardH * 0.11, faint, 0.7)
    }
  } else if (variant === 1) {
    // sidebar + list
    const sideW = bw * 0.3
    ctx.fillStyle = shade(accent, 0.72)
    roundedRect(ctx, bx, bodyTop + pad * 0.6, sideW, r.y + r.h - bodyTop - pad * 1.6, 8)
    ctx.fill()
    lines(ctx, bx + pad * 0.5, bodyTop + pad, sideW - pad, 6, pad * 0.75, light, 0.45)
    const lx = bx + sideW + pad * 0.7
    const lw = bw - sideW - pad * 0.7
    ctx.fillStyle = 'rgba(255,250,242,0.94)'
    roundedRect(ctx, lx, bodyTop + pad * 0.6, lw, r.h * 0.3, 8)
    ctx.fill()
    for (let i = 0; i < 4; i++) {
      const ry = bodyTop + pad * 0.6 + r.h * 0.3 + pad * 0.6 + i * (r.h * 0.11)
      ctx.fillStyle = 'rgba(255,250,242,0.72)'
      roundedRect(ctx, lx, ry, lw, r.h * 0.08, 6)
      ctx.fill()
      ctx.fillStyle = shade(accent, 1.4)
      ctx.fillRect(lx + pad * 0.4, ry + r.h * 0.025, lw * 0.22, r.h * 0.03)
    }
  } else {
    // dashboard with a chart
    const chartH = (r.y + r.h - bodyTop) * 0.5
    ctx.fillStyle = 'rgba(255,250,242,0.94)'
    roundedRect(ctx, bx, bodyTop + pad * 0.6, bw, chartH, 8)
    ctx.fill()
    ctx.save()
    roundedRect(ctx, bx, bodyTop + pad * 0.6, bw, chartH, 8)
    ctx.clip()
    ctx.strokeStyle = shade(accent, 1.7)
    ctx.lineWidth = 3
    ctx.beginPath()
    const baseY = bodyTop + pad * 0.6 + chartH
    for (let i = 0; i <= 12; i++) {
      const px = bx + (bw * i) / 12
      const t = i / 12
      const py =
        baseY -
        chartH * 0.72 * (0.28 + 0.5 * Math.abs(Math.sin(t * 3.1 + hash(title) * 6)) + 0.22 * t)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.lineTo(bx + bw, baseY)
    ctx.lineTo(bx, baseY)
    ctx.closePath()
    ctx.fillStyle = shade(accent, 1.5)
    ctx.globalAlpha = 0.35
    ctx.fill()
    ctx.restore()
    const gy = bodyTop + pad * 0.6 + chartH + pad * 0.7
    const cw = (bw - pad * 0.8) / 3
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(255,250,242,0.8)'
      roundedRect(ctx, bx + i * (cw + pad * 0.4), gy, cw, r.y + r.h - gy - pad * 0.6, 7)
      ctx.fill()
      lines(ctx, bx + i * (cw + pad * 0.4) + pad * 0.4, gy + pad * 0.5, cw - pad * 0.8, 2, pad * 0.6, faint, 0.6)
    }
  }

  // screen glare
  const glare = ctx.createLinearGradient(r.x, r.y, r.x + r.w * 0.8, r.y + r.h)
  glare.addColorStop(0, 'rgba(255,255,255,0.12)')
  glare.addColorStop(0.4, 'rgba(255,255,255,0.02)')
  glare.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glare
  ctx.fillRect(r.x, r.y, r.w, r.h)

  // monogram
  font(ctx, Math.max(11, r.w * 0.032), F.mono, 500)
  ctx.fillStyle = 'rgba(255,250,242,0.5)'
  ctx.textAlign = 'right'
  ctx.fillText(mark, r.x + r.w - pad, r.y + r.h - pad * 0.7)
  ctx.textAlign = 'left'
  ctx.restore()
}

/** The About-page portrait slot: a duotone editorial plate, honestly labelled. */
export function drawPortraitPlate(ctx: Ctx, r: Rect) {
  ctx.save()
  roundedRect(ctx, r.x, r.y, r.w, r.h, 4)
  ctx.clip()

  const bg = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h)
  bg.addColorStop(0, '#3a2a22')
  bg.addColorStop(0.5, '#2a1d18')
  bg.addColorStop(1, '#1a1210')
  ctx.fillStyle = bg
  ctx.fillRect(r.x, r.y, r.w, r.h)

  const glow = ctx.createRadialGradient(
    r.x + r.w * 0.58,
    r.y + r.h * 0.34,
    0,
    r.x + r.w * 0.58,
    r.y + r.h * 0.34,
    r.w * 0.72,
  )
  glow.addColorStop(0, 'rgba(224,182,132,0.42)')
  glow.addColorStop(0.5, 'rgba(168,118,84,0.16)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(r.x, r.y, r.w, r.h)

  // shoulders + head, as a soft duotone silhouette
  ctx.fillStyle = 'rgba(24,14,12,0.92)'
  ctx.beginPath()
  ctx.ellipse(r.x + r.w * 0.5, r.y + r.h * 1.22, r.w * 0.62, r.h * 0.52, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(r.x + r.w * 0.5, r.y + r.h * 0.44, r.w * 0.19, r.h * 0.17, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(r.x + r.w * 0.5, r.y + r.h * 0.53, r.w * 0.11, r.h * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()

  // rim light
  ctx.strokeStyle = 'rgba(230,196,150,0.34)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(r.x + r.w * 0.5, r.y + r.h * 0.44, r.w * 0.19, Math.PI * 0.9, Math.PI * 1.9)
  ctx.stroke()

  const vig = ctx.createRadialGradient(
    r.x + r.w / 2,
    r.y + r.h / 2,
    r.w * 0.2,
    r.x + r.w / 2,
    r.y + r.h / 2,
    r.w * 0.85,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(r.x, r.y, r.w, r.h)
  ctx.restore()
}

/** A small technical diagram for the skills page. */
export function drawDiagram(
  ctx: Ctx,
  r: Rect,
  kind: 'net' | 'cluster' | 'flow',
  accent = C.ink,
) {
  ctx.save()
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  ctx.lineWidth = 1.4
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2

  if (kind === 'net') {
    const layers = [3, 4, 3]
    const xs = layers.map((_, i) => r.x + r.w * (0.16 + (i * 0.68) / (layers.length - 1)))
    const nodes = layers.map((n, li) =>
      Array.from({ length: n }, (_, i) => ({
        x: xs[li],
        y: cy + (i - (n - 1) / 2) * (r.h / (Math.max(...layers) + 0.4)),
      })),
    )
    ctx.globalAlpha = 0.4
    for (let l = 0; l < nodes.length - 1; l++) {
      for (const a of nodes[l]) for (const b of nodes[l + 1]) {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    for (const layer of nodes) for (const n of layer) {
      ctx.beginPath()
      ctx.arc(n.x, n.y, 3.6, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (kind === 'cluster') {
    const clusters = [
      { dx: -0.22, dy: -0.14, c: 5 },
      { dx: 0.2, dy: -0.2, c: 3 },
      { dx: 0.04, dy: 0.24, c: 4 },
    ]
    for (const cl of clusters) {
      const ox = cx + r.w * cl.dx
      const oy = cy + r.h * cl.dy
      ctx.globalAlpha = 0.22
      ctx.beginPath()
      ctx.arc(ox, oy, r.w * 0.11, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      for (let i = 0; i < cl.c; i++) {
        const a = (i / cl.c) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(ox + Math.cos(a) * r.w * 0.06, oy + Math.sin(a) * r.w * 0.06, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else {
    const labels = ['data', 'model', 'api']
    for (let i = 0; i < 3; i++) {
      const bx = r.x + (i * (r.w - r.w * 0.26)) / 3
      const bw = r.w * 0.24
      ctx.globalAlpha = 0.16
      roundedRect(ctx, bx, cy - r.h * 0.16, bw, r.h * 0.32, 3)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeRect(bx, cy - r.h * 0.16, bw, r.h * 0.32)
      font(ctx, Math.max(8, r.w * 0.032), F.mono, 400)
      ctx.fillStyle = accent
      ctx.textAlign = 'center'
      ctx.fillText(labels[i], bx + bw / 2, cy + 3)
      ctx.textAlign = 'left'
      if (i < 2) {
        const ax = bx + bw + 4
        ctx.beginPath()
        ctx.moveTo(ax, cy)
        ctx.lineTo(ax + (r.w * 0.24) / 3 - 8, cy)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax + (r.w * 0.24) / 3 - 12, cy - 3)
        ctx.lineTo(ax + (r.w * 0.24) / 3 - 6, cy)
        ctx.lineTo(ax + (r.w * 0.24) / 3 - 12, cy + 3)
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}

/** Loose notebook sketch used across the experiments pages. */
export function drawSketch(ctx: Ctx, r: Rect, seed: number, accent = C.ink) {
  const n = Math.max(3, Math.floor(hash(String(seed)) * 4) + 3)
  ctx.save()
  ctx.strokeStyle = accent
  ctx.lineWidth = 1.3
  ctx.globalAlpha = 0.85
  for (let i = 0; i < n; i++) {
    const h = hash(`${seed}-${i}`)
    const x = r.x + r.w * (0.06 + h * 0.5)
    const y = r.y + r.h * (0.1 + hash(`${seed}-y-${i}`) * 0.55)
    const w = r.w * (0.18 + hash(`${seed}-w-${i}`) * 0.3)
    const hh = r.h * (0.12 + hash(`${seed}-h-${i}`) * 0.26)
    roundedRect(ctx, x, y, w, hh, 3)
    ctx.stroke()
    ctx.globalAlpha = 0.3
    for (let k = 0; k < 3; k++) {
      ctx.beginPath()
      ctx.moveTo(x + 6, y + 10 + k * 8)
      ctx.lineTo(x + w - 6 - k * 9, y + 10 + k * 8)
      ctx.stroke()
    }
    ctx.globalAlpha = 0.85
    if (i < n - 1) {
      const x2 = r.x + r.w * (0.06 + hash(`${seed}-${i + 1}`) * 0.5)
      const y2 = r.y + r.h * (0.1 + hash(`${seed}-y-${i + 1}`) * 0.55)
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      ctx.moveTo(x + w, y + hh / 2)
      ctx.lineTo(x2, y2 + 8)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
  ctx.restore()
}

import { profile } from '../data/portfolio'
import { F, font, makeCanvas, ornament, roundedRect, rule, tracked, type Ctx } from './engine'

/* ─────────────────────────────────────────────────────────────────────────────
   The hardcover itself: foil-stamped boards, leather spine, endpapers.
   ───────────────────────────────────────────────────────────────────────────── */

export const COVER_W = 1024
export const COVER_H = 1428

export type BoardArt = {
  /** Base colour + foil. */
  map: HTMLCanvasElement
  /** G channel = roughness, B channel = metalness. */
  surface: HTMLCanvasElement
}

/*
 * The board leather sits deliberately above the desk's tone: a very dark cover
 * on a nearly-black surface reads as one silhouette, so the book needs the
 * extra stop to separate. Foil is stamped over it in `foilText`/`foilShape`.
 */
function leatherBase(ctx: Ctx, w: number, h: number, tint = '#241812') {
  ctx.fillStyle = tint
  ctx.fillRect(0, 0, w, h)
  // broad tonal variation so the leather is never flat
  const rnd = (n: number) => Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1
  for (let i = 0; i < 40; i++) {
    const gx = rnd(i + 2) * w
    const gy = rnd(i + 19) * h
    const gr = 120 + rnd(i + 57) * 320
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr)
    const light = rnd(i + 91) > 0.5
    g.addColorStop(0, light ? 'rgba(74,48,36,0.16)' : 'rgba(0,0,0,0.20)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2)
  }
  // a whisper of edge wear
  ctx.globalAlpha = 0.10
  ctx.strokeStyle = '#8a6a4a'
  ctx.lineWidth = 2
  ctx.strokeRect(3, 3, w - 6, h - 6)
  ctx.globalAlpha = 1
}

function surfaceBase(ctx: Ctx, w: number, h: number, roughness: number) {
  ctx.fillStyle = `rgb(0,${Math.round(roughness * 255)},0)`
  ctx.fillRect(0, 0, w, h)
}

/** Marks a region as metal foil. */
function foilShape(ctx: Ctx, draw: () => void) {
  ctx.save()
  ctx.fillStyle = 'rgb(0,66,255)'
  ctx.strokeStyle = 'rgb(0,66,255)'
  draw()
  ctx.restore()
}

function foilGradient(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, '#6f5127')
  g.addColorStop(0.22, '#c8a469')
  g.addColorStop(0.42, '#f0dcae')
  g.addColorStop(0.58, '#b08d57')
  g.addColorStop(0.78, '#d9bd85')
  g.addColorStop(1, '#6a4d24')
  return g
}

function foilText(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  o: {
    size: number
    family?: string
    weight?: number | string
    italic?: boolean
    align?: CanvasTextAlign
    tracking?: number
  },
) {
  const { size, family = F.serif, weight = 600, italic = false, align = 'center', tracking = 0 } = o
  ctx.textAlign = 'left'
  font(ctx, size, family, weight, italic)
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1)
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x

  // stamped shadow reads as a real impression in the board
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  chars.forEach((c, i) => {
    ctx.fillText(c, cx + 1.6, y + 2)
    cx += widths[i] + tracking
  })
  cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  ctx.fillStyle = foilGradient(ctx, x - total / 2, y - size, x + total / 2, y + size * 0.3)
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y)
    cx += widths[i] + tracking
  })
  ctx.textAlign = 'left'
  return total
}

export function createFrontCoverArt(): BoardArt {
  const { canvas: map, ctx } = makeCanvas(COVER_W, COVER_H)
  const { canvas: surface, ctx: sctx } = makeCanvas(COVER_W, COVER_H)
  leatherBase(ctx, COVER_W, COVER_H)
  surfaceBase(sctx, COVER_W, COVER_H, 0.79)

  const cx = COVER_W / 2

  // bronze rules
  ctx.strokeStyle = '#8a6a3c'
  ctx.lineWidth = 2
  ctx.strokeRect(52, 52, COVER_W - 104, COVER_H - 104)
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.6
  ctx.strokeRect(66, 66, COVER_W - 132, COVER_H - 132)
  ctx.globalAlpha = 1

  foilShape(sctx, () => {
    sctx.lineWidth = 2
    sctx.strokeRect(52, 52, COVER_W - 104, COVER_H - 104)
    sctx.lineWidth = 1
    sctx.strokeRect(66, 66, COVER_W - 132, COVER_H - 132)
  })

  // top mark
  const topMark = 'A PORTFOLIO IN EIGHT CHAPTERS'
  foilText(ctx, topMark, cx, 208, { size: 26, family: F.sans, weight: 600, tracking: 12 })
  foilShape(sctx, () => {
    font(sctx, 26, F.sans, 600)
    sctx.textAlign = 'center'
    sctx.fillText(topMark, cx, 208)
  })

  ornament(ctx, cx, 262, 260, '#8a6a3c')
  foilShape(sctx, () => {
    sctx.lineWidth = 3
    sctx.strokeStyle = 'rgb(0,66,255)'
    sctx.beginPath()
    sctx.moveTo(cx - 130, 262)
    sctx.lineTo(cx - 14, 262)
    sctx.moveTo(cx + 14, 262)
    sctx.lineTo(cx + 130, 262)
    sctx.stroke()
    sctx.fillStyle = 'rgb(0,66,255)'
    sctx.beginPath()
    sctx.moveTo(cx, 256)
    sctx.lineTo(cx + 7, 262)
    sctx.lineTo(cx, 268)
    sctx.lineTo(cx - 7, 262)
    sctx.fill()
  })

  // the name
  const nameSize = 148
  const nameY = 500
  foilText(ctx, profile.name, cx, nameY, { size: nameSize, weight: 600, tracking: 2 })
  foilShape(sctx, () => {
    font(sctx, nameSize, F.serif, 600)
    sctx.textAlign = 'center'
    sctx.fillText(profile.name, cx, nameY)
  })

  rule(ctx, cx - 170, 560, 340, { color: '#8a6a3c', thickness: 2 })
  foilShape(sctx, () => {
    sctx.fillStyle = 'rgb(0,66,255)'
    sctx.fillRect(cx - 170, 559, 340, 3)
  })

  foilText(ctx, profile.role, cx, 622, { size: 30, family: F.sans, weight: 400, tracking: 1.5 })
  foilShape(sctx, () => {
    font(sctx, 30, F.sans, 400)
    sctx.textAlign = 'center'
    sctx.fillText(profile.role, cx, 622)
  })

  // thesis
  ctx.textAlign = 'center'
  font(ctx, 62, F.serif, 400, true)
  ctx.fillStyle = '#c8a469'
  ctx.fillText('“Every Idea Has', cx, 830)
  ctx.fillText('a Story.”', cx, 902)
  ctx.textAlign = 'left'
  foilShape(sctx, () => {
    font(sctx, 62, F.serif, 400, true)
    sctx.textAlign = 'center'
    sctx.fillText('“Every Idea Has', cx, 830)
    sctx.fillText('a Story.”', cx, 902)
  })

  // lower block: disciplines + monogram
  ctx.strokeStyle = 'rgba(138,106,60,0.5)'
  ctx.lineWidth = 1
  ctx.strokeRect(cx - 250, 1010, 500, 96)
  ctx.textAlign = 'center'
  font(ctx, 20, F.sans, 400)
  ctx.fillStyle = '#c8a469'
  ctx.fillText('Artificial Intelligence   ·   Data Science   ·   Software', cx, 1066)
  ctx.textAlign = 'left'
  foilShape(sctx, () => {
    sctx.lineWidth = 3
    sctx.strokeRect(cx - 250, 1010, 500, 96)
  })

  ornament(ctx, cx, 1166, 200, '#8a6a3c')
  foilText(ctx, 'SB', cx, 1280, { size: 74, weight: 600, tracking: 24 })
  foilShape(sctx, () => {
    font(sctx, 74, F.serif, 600)
    sctx.textAlign = 'center'
    sctx.fillText('SB', cx, 1280)
  })
  foilText(ctx, 'VOL. I', cx, 1332, { size: 18, family: F.sans, weight: 500, tracking: 10 })
  foilShape(sctx, () => {
    font(sctx, 18, F.sans, 500)
    sctx.textAlign = 'center'
    sctx.fillText('VOL. I', cx, 1332)
  })

  return { map, surface }
}

export function createBackCoverArt(): BoardArt {
  const { canvas: map, ctx } = makeCanvas(COVER_W, COVER_H)
  const { canvas: surface, ctx: sctx } = makeCanvas(COVER_W, COVER_H)
  leatherBase(ctx, COVER_W, COVER_H)
  surfaceBase(sctx, COVER_W, COVER_H, 0.82)
  const cx = COVER_W / 2
  ctx.strokeStyle = 'rgba(138,106,60,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(76, 76, COVER_W - 152, COVER_H - 152)
  ornament(ctx, cx, COVER_H / 2 - 60, 180, 'rgba(138,106,60,0.5)')
  ctx.textAlign = 'center'
  font(ctx, 30, F.serif, 400, true)
  ctx.fillStyle = 'rgba(200,164,105,0.6)'
  ctx.fillText(`“${profile.thesis}.”`, cx, COVER_H / 2 + 24)
  ctx.textAlign = 'left'
  font(ctx, 22, F.sans, 400)
  ctx.fillStyle = 'rgba(176,141,87,0.66)'
  ctx.fillText(profile.availability, cx, COVER_H - 150)
  ctx.textAlign = 'left'
  return { map, surface }
}

/** A slim foil band that runs down the leather spine. */
export function createSpineArt(len = 1024, arc = 200): BoardArt {
  const { canvas: map, ctx } = makeCanvas(arc, len)
  const { canvas: surface, ctx: sctx } = makeCanvas(arc, len)
  leatherBase(ctx, arc, len, '#1e1410')
  surfaceBase(sctx, arc, len, 0.8)

  ctx.save()
  ctx.translate(arc / 2, len / 2)
  ctx.rotate(Math.PI / 2)
  ctx.textAlign = 'center'
  const size = 54
  foilText(ctx, profile.name, 0, 18, { size, weight: 600, tracking: 8 })
  font(ctx, 22, F.sans, 400)
  ctx.fillStyle = 'rgba(200,164,105,0.8)'
  ctx.fillText('—  A BOOK ABOUT A DEVELOPER  —', 0, 74)
  ctx.restore()
  foilShape(sctx, () => {
    sctx.save()
    sctx.translate(arc / 2, len / 2)
    sctx.rotate(Math.PI / 2)
    sctx.textAlign = 'center'
    font(sctx, size, F.serif, 600)
    sctx.fillText(profile.name, 0, 18)
    sctx.restore()
  })
  return { map, surface }
}

/** Inner cover paper. */
export function createEndpaperArt(): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(512, 714)
  const g = ctx.createLinearGradient(0, 0, 512, 714)
  g.addColorStop(0, '#5c2a30')
  g.addColorStop(0.5, '#6d2233')
  g.addColorStop(1, '#3a1a20')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 714)

  ctx.save()
  ctx.globalAlpha = 0.14
  ctx.strokeStyle = '#e8d6b4'
  ctx.lineWidth = 1
  for (let i = -714; i < 1024; i += 11) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 714, 714)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = '#000'
  for (let i = -714; i < 1024; i += 37) {
    ctx.beginPath()
    ctx.moveTo(i, 714)
    ctx.lineTo(i + 714, 0)
    ctx.stroke()
  }
  ctx.restore()

  // a small bookplate
  ctx.save()
  ctx.translate(256, 300)
  ctx.strokeStyle = 'rgba(232,214,180,0.55)'
  ctx.lineWidth = 2
  roundedRect(ctx, -140, -70, 280, 140, 3)
  ctx.stroke()
  ctx.font = `600 34px ${F.serif}`
  ctx.fillStyle = 'rgba(232,214,180,0.85)'
  ctx.textAlign = 'center'
  ctx.fillText('Ex Libris', 0, -12)
  ctx.font = `400 23px ${F.hand}`
  ctx.fillStyle = 'rgba(232,214,180,0.75)'
  ctx.fillText('Shereya B', 0, 30)
  ctx.restore()

  tracked(ctx, 'THIS BOOK BELONGS TO', 256, 470, {
    align: 'center',
    color: 'rgba(232,214,180,0.5)',
    size: 13,
    tracking: 4,
  })
  return canvas
}

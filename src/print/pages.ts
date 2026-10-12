import {
  certifications,
  chapters,
  education,
  experience,
  experiments,
  interests,
  journey,
  profile,
  projects,
  skillGroups,
  socials,
} from '../data/portfolio'
import {
  annotate,
  caption,
  C,
  F,
  font,
  frame,
  type LinkRect,
  type Metrics,
  metrics,
  ornament,
  para,
  paperBase,
  roundedRect,
  rule,
  runningHead,
  tracked,
  type Ctx,
  type Rect,
} from './engine'
import { drawDiagram, drawPortraitPlate, drawProjectPlate, drawSketch } from './plates'

export type Side = 'recto' | 'verso'
export type PageArt = { canvas: HTMLCanvasElement; links: LinkRect[] }

/* ── shared furniture ─────────────────────────────────────────────────────── */

function addLink(links: LinkRect[], url: string, label: string, r: Rect) {
  links.push({ url, label, x: r.x, y: r.y, w: r.w, h: r.h })
  return r
}

function heading(
  ctx: Ctx,
  m: Metrics,
  kicker: string,
  title: string,
  y: number,
  size = 54,
): number {
  tracked(ctx, kicker, m.left, y, { color: C.accent, size: 13, tracking: 3.6 })
  font(ctx, size, F.serif, 600)
  ctx.fillStyle = C.ink
  ctx.fillText(title, m.left, y + size * 0.86)
  const after = y + size * 0.86 + 18
  rule(ctx, m.left, after, m.width * 0.42, { color: C.bronze, thickness: 1.4 })
  return after + 30
}

function chips(ctx: Ctx, x: number, y: number, items: string[], maxWidth: number): number {
  font(ctx, 14, F.mono, 500)
  let cx = x
  let cy = y
  const padX = 12
  const h = 28
  const gap = 8
  ctx.textBaseline = 'middle'
  for (const item of items) {
    const w = ctx.measureText(item).width + padX * 2
    if (cx + w > x + maxWidth) {
      cx = x
      cy += h + gap
    }
    ctx.fillStyle = 'rgba(36,28,23,0.055)'
    roundedRect(ctx, cx, cy, w, h, h / 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(36,28,23,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = C.inkSoft
    ctx.fillText(item, cx + padX, cy + h / 2 + 1)
    cx += w + gap
  }
  ctx.textBaseline = 'alphabetic'
  return cy + h
}

function linkRow(ctx: Ctx, links: LinkRect[], x: number, y: number, items: { label: string; href: string; note?: string }[]) {
  let cx = x
  font(ctx, 16, F.mono, 500)
  for (const item of items) {
    ctx.fillStyle = C.accent
    ctx.fillText(item.label, cx, y)
    const w = ctx.measureText(item.label).width
    ctx.strokeStyle = 'rgba(122,34,51,0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, y + 5)
    ctx.lineTo(cx + w, y + 5)
    ctx.stroke()
    ctx.fillStyle = C.inkFaint
    font(ctx, 14, F.mono, 400)
    if (item.note) ctx.fillText(`· ${item.note}`, cx + w + 10, y)
    const total = w + 10 + (item.note ? ctx.measureText(`· ${item.note}`).width : 0)
    addLink(links, item.href, item.label, { x: cx - 6, y: y - 20, w: total + 12, h: 32 })
    font(ctx, 16, F.mono, 500)
    cx += total + 26
  }
}

/* ── chapter 0 · cover ────────────────────────────────────────────────────── */

function coverRecto(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  const cx = m.left + m.width / 2

  frame(ctx, { x: 56, y: 56, w: 1024 - 112, h: 1428 - 112 }, { color: 'rgba(138,106,58,0.55)', thickness: 1.5, shadow: false })
  frame(ctx, { x: 70, y: 70, w: 1024 - 140, h: 1428 - 140 }, { color: 'rgba(138,106,58,0.22)', thickness: 0.8, shadow: false })

  tracked(ctx, 'A Portfolio in Eight Chapters', cx, 190, { align: 'center', color: C.bronze, size: 14, tracking: 6 })
  ornament(ctx, cx, 232, 220)

  font(ctx, 132, F.serif, 600)
  ctx.fillStyle = C.ink
  ctx.textAlign = 'center'
  ctx.fillText(profile.name, cx, 400)
  ctx.textAlign = 'left'

  rule(ctx, cx - 150, 442, 300, { color: C.bronze, thickness: 1 })

  font(ctx, 30, F.sans, 400)
  ctx.fillStyle = C.inkSoft
  ctx.textAlign = 'center'
  ctx.fillText(profile.role, cx, 496)
  ctx.textAlign = 'left'

  font(ctx, 54, F.serif, 400, true)
  ctx.fillStyle = C.accent
  ctx.textAlign = 'center'
  ctx.fillText(`“${profile.thesis}”`, cx, 640)
  ctx.textAlign = 'left'

  // A quiet ornamental rule of type
  tracked(ctx, profile.disciplines.join('   ·   '), cx, 700, {
    align: 'center',
    color: C.inkFaint,
    size: 14,
    tracking: 3.4,
  })

  // The invitation
  const boxW = m.width * 0.82
  const boxX = cx - boxW / 2
  const boxY = 940
  ctx.save()
  ctx.shadowColor = 'rgba(60,44,26,0.22)'
  ctx.shadowBlur = 26
  ctx.shadowOffsetY = 10
  ctx.fillStyle = 'rgba(255,252,244,0.72)'
  roundedRect(ctx, boxX, boxY, boxW, 168, 4)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = 'rgba(138,106,58,0.5)'
  ctx.lineWidth = 1
  ctx.strokeRect(boxX, boxY, boxW, 168)

  tracked(ctx, 'Explore My Story', cx, boxY + 62, { align: 'center', color: C.ink, size: 22, tracking: 7 })
  font(ctx, 19, F.sans, 400)
  ctx.fillStyle = C.inkSoft
  ctx.textAlign = 'center'
  ctx.fillText('Open the cover and turn the pages —', cx, boxY + 102)
  ctx.fillText('or use the arrows to move through the book.', cx, boxY + 130)
  ctx.textAlign = 'left'
  addLink(links, 'book:next', 'Turn to the About page', { x: boxX, y: boxY, w: boxW, h: 168 })

  annotate(ctx, 'start here →', m.right - 8, 1150, { size: 40, align: 'right', rotate: -0.05 })

  tracked(ctx, 'Volume I  ·  An interactive book', cx, 1310, {
    align: 'center',
    color: C.inkFaint,
    size: 12,
    tracking: 4.2,
  })
}

function coverVerso(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, 'Contents', 'The Story So Far', m.top + 26, 50)

  const entries = chapters.slice(1)
  const rowH = 92
  entries.forEach((ch, i) => {
    const ry = y + i * rowH
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(36,28,23,0.035)'
      ctx.fillRect(m.left - 18, ry - 26, m.width + 36, rowH - 10)
    }
    font(ctx, 34, F.serif, 600)
    ctx.fillStyle = C.bronze
    ctx.fillText(ch.number, m.left, ry + 32)

    font(ctx, 30, F.serif, 500)
    ctx.fillStyle = C.ink
    ctx.fillText(ch.title, m.left + 96, ry + 20)
    font(ctx, 17, F.sans, 400)
    ctx.fillStyle = C.inkFaint
    ctx.fillText(ch.kicker, m.left + 96, ry + 46)

    const lineX = m.left + 96 + ctx.measureText(ch.kicker).width + 20
    rule(ctx, Math.max(lineX, m.right - 260), ry + 12, Math.max(20, m.right - Math.max(lineX, m.right - 260)), {
      color: 'rgba(201,183,149,0.9)',
      dash: [2, 5],
    })

    addLink(links, `book:chapter:${i + 1}`, `Go to ${ch.title}`, {
      x: m.left - 18,
      y: ry - 26,
      w: m.width + 36,
      h: rowH - 10,
    })
  })

  const after = y + entries.length * rowH + 20
  rule(ctx, m.left, after, m.width, { color: 'rgba(201,183,149,0.8)' })
  annotate(ctx, 'tap any chapter to jump', m.left + 6, after + 52, { size: 38 })
  tracked(ctx, 'Turn the page, or use ← → on your keyboard', m.left, after + 100, {
    color: C.inkFaint,
    size: 13,
    tracking: 2.6,
  })
}

/* ── chapter 1 · about ────────────────────────────────────────────────────── */

function aboutRecto(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, chapters[1].kicker, chapters[1].title, m.top + 26)

  const plateW = m.width * 0.42
  const plateH = plateW * 1.22
  drawPortraitPlate(ctx, { x: m.left, y, w: plateW, h: plateH })
  frame(ctx, { x: m.left, y, w: plateW, h: plateH }, { color: 'rgba(36,28,23,0.5)' })
  caption(ctx, 'portrait · placeholder', m.left, y + plateH + 26, { color: C.inkFaint })

  const tx = m.left + plateW + 44
  const tw = m.width - plateW - 44
  let ty = para(ctx, {
    text: profile.about[0],
    x: tx,
    y: y - 6,
    width: tw,
    size: 23,
    lineHeight: 1.58,
    color: C.ink,
  })
  ty = para(ctx, {
    text: profile.about[1],
    x: tx,
    y: ty + 12,
    width: tw,
    size: 21,
    lineHeight: 1.6,
  })

  const proseY = y + plateH + 66
  let py = para(ctx, {
    text: profile.about[2],
    x: m.left,
    y: proseY,
    width: m.width,
    size: 21,
    lineHeight: 1.62,
  })

  annotate(ctx, profile.aboutNote, m.right - 10, py + 26, { align: 'right', size: 40 })
  py += 74

  rule(ctx, m.left, py, m.width, { color: 'rgba(201,183,149,0.85)' })
  py += 34

  tracked(ctx, 'Based in', m.left, py, { color: C.inkFaint, size: 12, tracking: 3 })
  font(ctx, 24, F.serif, 500)
  ctx.fillStyle = C.ink
  ctx.fillText(profile.location, m.left, py + 32)

  tracked(ctx, 'Say hello', m.left + m.width * 0.5, py, { color: C.inkFaint, size: 12, tracking: 3 })
  font(ctx, 22, F.mono, 500)
  ctx.fillStyle = C.accent
  ctx.fillText(profile.email, m.left + m.width * 0.5, py + 32)
  addLink(links, `mailto:${profile.email}`, 'Email Shereya', {
    x: m.left + m.width * 0.5 - 8,
    y: py + 4,
    w: ctx.measureText(profile.email).width + 16,
    h: 40,
  })
}

function aboutVerso(ctx: Ctx, m: Metrics, _links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, 'A short biography', 'The Short Version', m.top + 26)

  const rows: [string, string][] = [
    ['Name', profile.name],
    ['Studying', education[0].qualification],
    ['Institution', education[0].institution],
    ['Place', education[0].place],
    ['Period', education[0].period],
    ['CGPA', education[0].detail.replace('CGPA ', '')],
    ['Availability', profile.availability],
  ]

  rows.forEach(([k, v], i) => {
    const ry = y + i * 74
    rule(ctx, m.left, ry - 18, m.width, { color: 'rgba(201,183,149,0.65)' })
    tracked(ctx, k, m.left, ry + 20, { color: C.inkFaint, size: 12, tracking: 3 })
    const lines = (() => {
      font(ctx, 26, F.serif, 500)
      const maxW = m.width - 240
      const words = v.split(' ')
      const out: string[] = []
      let line = ''
      for (const w of words) {
        const t = line ? `${line} ${w}` : w
        if (ctx.measureText(t).width > maxW && line) {
          out.push(line)
          line = w
        } else line = t
      }
      if (line) out.push(line)
      return out
    })()
    font(ctx, 26, F.serif, 500)
    ctx.fillStyle = C.ink
    lines.forEach((l, li) => ctx.fillText(l, m.left + 200, ry + 22 + li * 32))
  })
  y += rows.length * 74 + 4
  rule(ctx, m.left, y - 18, m.width, { color: 'rgba(201,183,149,0.65)' })

  const dx = m.left + m.width * 0.62
  const dy = y + 30
  drawDiagram(ctx, { x: dx, y: dy, w: m.width * 0.34, h: 150 }, 'flow', 'rgba(36,28,23,0.6)')
  caption(ctx, 'fig. 1 — how things get built', dx, dy + 176)

  const noteY = dy + 40
  annotate(ctx, 'curious about everything', m.left, noteY + 30, { size: 40 })
  annotate(ctx, 'at least once', m.left, noteY + 78, { size: 40, rotate: 0.03 })
  para(ctx, {
    text: 'The rest of this book is the evidence: the skills, the projects, and the very long list of things still to learn.',
    x: m.left,
    y: noteY + 96,
    width: m.width * 0.54,
    size: 19,
    lineHeight: 1.55,
    italic: true,
    color: C.inkSoft,
  })
}

/* ── chapter 2 · skills ───────────────────────────────────────────────────── */

function skillsRecto(ctx: Ctx, m: Metrics, _links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, chapters[2].kicker, chapters[2].title, m.top + 26)
  const perCol = 4
  const colW = m.width / 2 - 22

  skillGroups.slice(0, perCol).forEach((g, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const gx = m.left + col * (colW + 44)
    const gy = y + row * 270

    font(ctx, 34, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(g.title, gx, gy + 30)
    tracked(ctx, g.latin, gx, gy + 54, { color: C.bronze, size: 11, tracking: 3.4, family: F.serif })
    rule(ctx, gx, gy + 70, colW * 0.5, { color: C.bronze, thickness: 1.2 })

    font(ctx, 22, F.sans, 400)
    ctx.fillStyle = C.inkSoft
    g.items.forEach((it, k) => {
      const iy = gy + 108 + k * 38
      ctx.fillStyle = C.bronze
      ctx.fillRect(gx, iy - 4, 5, 5)
      ctx.fillStyle = C.inkSoft
      font(ctx, 22, F.sans, 400)
      ctx.fillText(it, gx + 20, iy)
    })

    annotate(ctx, g.note, gx + 8, gy + 108 + g.items.length * 38 + 22, { size: 30 })
  })

  const dy = y + 2 * 270 + 10
  rule(ctx, m.left, dy, m.width, { color: 'rgba(201,183,149,0.85)' })
  const dTop = dy + 30
  drawDiagram(ctx, { x: m.left, y: dTop, w: m.width * 0.3, h: 130 }, 'net')
  drawDiagram(ctx, { x: m.left + m.width * 0.36, y: dTop, w: m.width * 0.3, h: 130 }, 'cluster')
  drawDiagram(ctx, { x: m.left + m.width * 0.72, y: dTop, w: m.width * 0.28, h: 130 }, 'flow')
  caption(ctx, 'fig. 2 — neural nets', m.left, dTop + 156)
  caption(ctx, 'fig. 3 — clustering', m.left + m.width * 0.36, dTop + 156)
  caption(ctx, 'fig. 4 — pipelines', m.left + m.width * 0.72, dTop + 156)
}

function skillsVerso(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, 'Also in the box', 'Tools & Ways of Working', m.top + 26)

  skillGroups.slice(4).forEach((g, i) => {
    const gy = y + i * 232
    font(ctx, 36, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(g.title, m.left, gy + 32)
    tracked(ctx, g.latin, m.right, gy + 32, { color: C.bronze, size: 11, tracking: 3.4, align: 'right', family: F.serif })
    rule(ctx, m.left, gy + 52, m.width, { color: 'rgba(201,183,149,0.8)' })
    const bottom = chips(ctx, m.left, gy + 76, g.items, m.width)
    annotate(ctx, g.note, m.left, bottom + 42, { size: 32 })
  })

  const y2 = y + 3 * 232 + 8
  rule(ctx, m.left, y2, m.width, { color: 'rgba(201,183,149,0.8)' })

  const cy = y2 + 40
  tracked(ctx, 'Certifications', m.left, cy, { color: C.accent, size: 12, tracking: 3.6 })
  certifications.forEach((c, i) => {
    const ey = cy + 46 + i * 96
    font(ctx, 26, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(c.title, m.left, ey)
    font(ctx, 17, F.sans, 400)
    ctx.fillStyle = C.inkFaint
    ctx.fillText(`${c.issuer} · ${c.detail}`, m.left, ey + 28)
    linkRow(ctx, links, m.right - 220, ey, [{ ...c.link }])
  })
}

/* ── chapter 3 · projects ─────────────────────────────────────────────────── */

function projectBlock(
  ctx: Ctx,
  links: LinkRect[],
  project: (typeof projects)[number],
  x: number,
  y: number,
  width: number,
) {
  const plateH = width * 0.315
  drawProjectPlate(ctx, { x, y, w: width, h: plateH }, project.accent, project.title, project.mark)
  frame(ctx, { x, y, w: width, h: plateH }, { color: 'rgba(36,28,23,0.45)', thickness: 1.2 })
  let cy = y + plateH + 22

  font(ctx, 40, F.serif, 600)
  ctx.fillStyle = C.ink
  ctx.fillText(project.title, x, cy + 32)
  const titleW = ctx.measureText(project.title).width
  tracked(ctx, project.status === 'live' ? 'live' : 'repository', x + titleW + 18, cy + 26, {
    color: C.bronze,
    size: 11,
    tracking: 3,
  })
  cy += 56

  font(ctx, 21, F.serif, 400, true)
  ctx.fillStyle = C.accent
  ctx.fillText(project.tagline, x, cy)
  cy += 34

  cy = para(ctx, {
    text: project.problem,
    x,
    y: cy,
    width,
    size: 19,
    lineHeight: 1.5,
    color: C.inkSoft,
  }) + 20

  const cBottom = chips(ctx, x, cy, project.stack, width)
  cy = cBottom + 42

  font(ctx, 17, F.sans, 400, true)
  ctx.fillStyle = C.inkFaint
  const roleLines = project.role.split(' ')
  let line = ''
  const roleOut: string[] = []
  for (const w of roleLines) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > width && line) {
      roleOut.push(line)
      line = w
    } else line = t
  }
  if (line) roleOut.push(line)
  roleOut.forEach((l, i) => ctx.fillText(l, x, cy + i * 24))
  cy += roleOut.length * 24 + 22

  linkRow(ctx, links, x, cy, project.links)
  return cy + 10
}

function projectsRecto(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  const y = heading(ctx, m, chapters[3].kicker, chapters[3].title, m.top + 26)
  projectBlock(ctx, links, projects[0], m.left, y, m.width)
  const sep = y + 500
  rule(ctx, m.left, sep, m.width, { color: 'rgba(201,183,149,0.7)' })
  projectBlock(ctx, links, projects[1], m.left, sep + 26, m.width)
}

function projectsVerso(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  const y = heading(ctx, m, 'Selected Projects, continued', 'Two More', m.top + 26)
  projectBlock(ctx, links, projects[2], m.left, y, m.width)
  const sep = y + 470
  rule(ctx, m.left, sep, m.width, { color: 'rgba(201,183,149,0.7)' })
  projectBlock(ctx, links, projects[3], m.left, sep + 26, m.width)
}

/* ── chapter 4 · journey ──────────────────────────────────────────────────── */

const KIND_COLOR: Record<string, string> = {
  education: C.accent,
  work: C.bronze,
  learning: C.inkSoft,
}

function journeyBody(ctx: Ctx, m: Metrics, list: typeof journey, startY: number, lineX: number) {
  let y = startY
  list.forEach((ms) => {
    const blockH = 150
    ctx.beginPath()
    ctx.arc(lineX, y + 16, 7, 0, Math.PI * 2)
    ctx.fillStyle = KIND_COLOR[ms.kind]
    ctx.fill()
    ctx.beginPath()
    ctx.arc(lineX, y + 16, 12, 0, Math.PI * 2)
    ctx.strokeStyle = KIND_COLOR[ms.kind]
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 1.4
    ctx.stroke()
    ctx.globalAlpha = 1

    const tx = lineX + 42
    const tw = m.right - tx
    tracked(ctx, ms.when, tx, y + 6, { color: KIND_COLOR[ms.kind], size: 12, tracking: 3.2 })
    font(ctx, 32, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(ms.title, tx, y + 42)
    para(ctx, {
      text: ms.detail,
      x: tx,
      y: y + 54,
      width: tw,
      size: 18,
      lineHeight: 1.5,
      maxLines: 3,
      color: C.inkSoft,
    })
    y += blockH
  })
  return y
}

function journeyRecto(ctx: Ctx, m: Metrics, _links: LinkRect[]) {
  paperBase(ctx, m)
  const y = heading(ctx, m, chapters[4].kicker, chapters[4].title, m.top + 26)
  const lineX = m.left + 8
  ctx.save()
  ctx.strokeStyle = 'rgba(138,106,58,0.4)'
  ctx.lineWidth = 1.4
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.moveTo(lineX, y + 10)
  ctx.lineTo(lineX, y + 3 * 150 + 6)
  ctx.stroke()
  ctx.restore()
  journeyBody(ctx, m, journey.slice(0, 3), y + 6, lineX)
  annotate(ctx, 'the long way round', m.right - 10, y + 3 * 150 + 40, { size: 38, align: 'right' })
}

function journeyVerso(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  const y = heading(ctx, m, 'The Journey, continued', 'And Onwards', m.top + 26)
  const lineX = m.left + 8
  ctx.save()
  ctx.strokeStyle = 'rgba(138,106,58,0.4)'
  ctx.lineWidth = 1.4
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.moveTo(lineX, y + 10)
  ctx.lineTo(lineX, y + 150)
  ctx.stroke()
  ctx.restore()
  let end = journeyBody(ctx, m, journey.slice(3), y + 6, lineX)

  end += 10
  rule(ctx, m.left, end, m.width, { color: 'rgba(201,183,149,0.8)' })
  end += 34
  tracked(ctx, 'Experience', m.left, end, { color: C.accent, size: 12, tracking: 3.6 })
  end += 14

  experience.forEach((e) => {
    font(ctx, 30, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(e.role, m.left, end + 34)
    font(ctx, 17, F.sans, 400)
    ctx.fillStyle = C.inkFaint
    ctx.fillText(`${e.org} · ${e.period}`, m.left, end + 60)
    let by = end + 84
    e.points.forEach((p) => {
      ctx.fillStyle = C.bronze
      ctx.fillRect(m.left + 2, by - 6, 5, 5)
      by = para(ctx, {
        text: p,
        x: m.left + 20,
        y: by - 12,
        width: m.width - 20,
        size: 18,
        lineHeight: 1.45,
        maxLines: 2,
        color: C.inkSoft,
      }) + 6
    })
    linkRow(ctx, links, m.left, by + 10, [e.link])
  })
}

/* ── chapter 5 · creative universe ────────────────────────────────────────── */

function universeRecto(ctx: Ctx, m: Metrics, _links: LinkRect[]) {
  paperBase(ctx, m)
  const y = heading(ctx, m, chapters[5].kicker, chapters[5].title, m.top + 26)

  const colW = m.width / 2 - 18
  interests.forEach((it, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const bx = m.left + col * (colW + 36)
    const by = y + row * 290
    const accent = [C.accent, C.bronze, '#3f4a3f', '#3a3550', '#5c4a2e', '#2f4a4a'][i % 6]

    ctx.save()
    ctx.shadowColor = 'rgba(60,44,26,0.16)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6
    ctx.fillStyle = 'rgba(255,252,244,0.6)'
    roundedRect(ctx, bx, by, colW, 258, 3)
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = 'rgba(36,28,23,0.22)'
    ctx.lineWidth = 1
    ctx.strokeRect(bx, by, colW, 258)

    drawSketch(ctx, { x: bx + 18, y: by + 16, w: colW - 36, h: 108 }, i * 7 + 3, 'rgba(36,28,23,0.55)')

    font(ctx, 12, F.mono, 500)
    ctx.fillStyle = accent
    ctx.fillText(String(i + 1).padStart(2, '0'), bx + 20, by + 152)
    font(ctx, 30, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(it.title, bx + 20, by + 190)
    para(ctx, {
      text: it.note,
      x: bx + 20,
      y: by + 202,
      width: colW - 40,
      size: 17,
      lineHeight: 1.45,
      maxLines: 2,
      color: C.inkSoft,
    })
  })
}

function universeVerso(ctx: Ctx, m: Metrics, _links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, 'The Creative Universe, continued', 'What Pulls Her In', m.top + 26)

  const plateH = 330
  const bg = ctx.createLinearGradient(m.left, y, m.right, y + plateH)
  bg.addColorStop(0, '#241a16')
  bg.addColorStop(1, '#0f0a09')
  ctx.fillStyle = bg
  ctx.fillRect(m.left, y, m.width, plateH)
  ctx.save()
  ctx.beginPath()
  ctx.rect(m.left, y, m.width, plateH)
  ctx.clip()
  ctx.strokeStyle = 'rgba(176,141,87,0.5)'
  ctx.lineWidth = 1
  for (let i = 0; i < 26; i++) {
    ctx.beginPath()
    ctx.arc(m.left + m.width * 0.78, y + plateH * 0.42, 14 + i * 11, 0, Math.PI * 2)
    ctx.globalAlpha = 0.5 - i * 0.016
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.restore()
  frame(ctx, { x: m.left, y, w: m.width, h: plateH }, { color: 'rgba(176,141,87,0.45)', shadow: false })

  font(ctx, 40, F.serif, 400, true)
  ctx.fillStyle = 'rgba(244,236,221,0.95)'
  const quote = ['“Machine learning is not', 'magic. It is careful', 'listening to data.”']
  quote.forEach((l, i) => ctx.fillText(l, m.left + 40, y + 90 + i * 52))
  tracked(ctx, '— a working belief', m.left + 40, y + plateH - 34, {
    color: 'rgba(176,141,87,0.9)',
    size: 12,
    tracking: 3.2,
  })
  y += plateH + 44

  const cols = [
    {
      t: 'Reading & Reference',
      items: ['NPTEL lectures', 'TryHackMe paths', 'Model papers, slowly', 'Other people’s code'],
    },
    {
      t: 'Making',
      items: ['Small applications', 'Notebooks that argue', 'Interfaces without instructions', 'Datasets, cleaned'],
    },
  ]
  cols.forEach((c, i) => {
    const cx = m.left + i * (m.width / 2 + 10)
    const cw = m.width / 2 - 10
    tracked(ctx, c.t, cx, y, { color: C.accent, size: 12, tracking: 3.4 })
    rule(ctx, cx, y + 14, cw * 0.6, { color: C.bronze, thickness: 1.2 })
    c.items.forEach((it, k) => {
      font(ctx, 20, F.sans, 400)
      ctx.fillStyle = C.inkSoft
      ctx.fillText(it, cx, y + 54 + k * 36)
      ctx.fillStyle = C.bronze
      ctx.fillRect(cx - 14, y + 47 + k * 36, 4, 4)
    })
  })

  const by = y + 220
  rule(ctx, m.left, by, m.width, { color: 'rgba(201,183,149,0.8)' })
  annotate(ctx, 'and always, the next thing to learn', m.left, by + 62, { size: 42 })
  para(ctx, {
    text: 'Nearly everything above arrived through curiosity rather than curriculum. That is still the method.',
    x: m.left,
    y: by + 86,
    width: m.width * 0.8,
    size: 19,
    lineHeight: 1.55,
    italic: true,
    color: C.inkSoft,
  })
}

/* ── chapter 6 · experiments ──────────────────────────────────────────────── */

function experimentsRecto(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  const y = heading(ctx, m, chapters[6].kicker, chapters[6].title, m.top + 26)

  experiments.slice(0, 2).forEach((ex, i) => {
    const ey = y + i * 500
    const cardH = 470
    ctx.save()
    ctx.shadowColor = 'rgba(60,44,26,0.14)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 6
    ctx.fillStyle = 'rgba(255,252,244,0.55)'
    roundedRect(ctx, m.left, ey, m.width, cardH, 3)
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = 'rgba(36,28,23,0.14)'
    ctx.lineWidth = 1
    ctx.strokeRect(m.left, ey, m.width, cardH)

    ctx.fillStyle = ex.accent
    ctx.fillRect(m.left, ey, 6, cardH)

    drawSketch(ctx, { x: m.left + 30, y: ey + 26, w: m.width - 60, h: 150 }, i * 13 + 5)

    font(ctx, 34, F.serif, 600)
    ctx.fillStyle = C.ink
    ctx.fillText(ex.title, m.left + 30, ey + 226)
    tracked(ctx, `experiment ${String(i + 1).padStart(2, '0')}`, m.right - 30, ey + 226, {
      color: C.bronze,
      size: 11,
      tracking: 3,
      align: 'right',
    })
    rule(ctx, m.left + 30, ey + 246, m.width - 60, { color: 'rgba(201,183,149,0.85)' })
    para(ctx, {
      text: ex.note,
      x: m.left + 30,
      y: ey + 262,
      width: m.width - 60,
      size: 19,
      lineHeight: 1.5,
      maxLines: 5,
      color: C.inkSoft,
    })
    chips(ctx, m.left + 30, ey + 396, ex.stack, m.width - 200)
    if (ex.link) linkRow(ctx, links, m.right - 200, ey + 410, [ex.link])
  })
}

function experimentsVerso(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, 'Experiments & Ideas, continued', 'The Third Notebook', m.top + 26)
  const ex = experiments[2]

  ctx.save()
  ctx.shadowColor = 'rgba(60,44,26,0.14)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 6
  ctx.fillStyle = 'rgba(255,252,244,0.55)'
  roundedRect(ctx, m.left, y, m.width, 300, 3)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = 'rgba(36,28,23,0.14)'
  ctx.strokeRect(m.left, y, m.width, 300)
  ctx.fillStyle = ex.accent
  ctx.fillRect(m.left, y, 6, 300)

  font(ctx, 34, F.serif, 600)
  ctx.fillStyle = C.ink
  ctx.fillText(ex.title, m.left + 30, y + 60)
  rule(ctx, m.left + 30, y + 80, m.width - 60, { color: 'rgba(201,183,149,0.85)' })
  para(ctx, {
    text: ex.note,
    x: m.left + 30,
    y: y + 96,
    width: m.width - 60,
    size: 19,
    lineHeight: 1.5,
    maxLines: 4,
    color: C.inkSoft,
  })
  chips(ctx, m.left + 30, y + 240, ex.stack, m.width - 200)
  if (ex.link) linkRow(ctx, links, m.right - 200, y + 254, [ex.link])
  y += 340

  rule(ctx, m.left, y, m.width, { color: 'rgba(201,183,149,0.8)' })
  y += 30
  tracked(ctx, 'Ideas queued', m.left, y, { color: C.accent, size: 12, tracking: 3.6 })
  y += 20

  const ideas = [
    'A model card for every experiment — accuracy is not a story.',
    'Small, useful things: a timetable predictor, a study-plan generator.',
    'A cleaner way to explain a confusion matrix to someone who is not a data scientist.',
    'Something built for a school that does not have a budget for software.',
  ]
  ideas.forEach((idea, i) => {
    const iy = y + 44 + i * 78
    font(ctx, 30, F.serif, 400, true)
    ctx.fillStyle = C.bronze
    ctx.fillText(String(i + 1), m.left, iy)
    para(ctx, {
      text: idea,
      x: m.left + 48,
      y: iy - 26,
      width: m.width - 48,
      size: 19,
      lineHeight: 1.5,
      maxLines: 2,
      color: C.inkSoft,
    })
  })
  annotate(ctx, 'the list keeps growing', m.right - 10, y + 44 + ideas.length * 78 + 24, {
    size: 38,
    align: 'right',
  })
}

/* ── chapter 7 · contact ──────────────────────────────────────────────────── */

function contactRecto(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  const cx = m.left + m.width / 2
  frame(ctx, { x: 56, y: 56, w: 1024 - 112, h: 1428 - 112 }, { color: 'rgba(138,106,58,0.45)', thickness: 1.5, shadow: false })

  tracked(ctx, 'Chapter seven · the last page', cx, 176, { align: 'center', color: C.bronze, size: 13, tracking: 5 })
  ornament(ctx, cx, 214, 200)

  font(ctx, 76, F.serif, 600)
  ctx.fillStyle = C.ink
  ctx.textAlign = 'center'
  ctx.fillText('Let’s Write It', cx, 322)
  ctx.fillText('Together', cx, 396)
  ctx.textAlign = 'left'

  const iy = 470
  const lines = (() => {
    font(ctx, 21, F.sans, 400)
    const words = profile.invitation.split(' ')
    const out: string[] = []
    let line = ''
    for (const w of words) {
      const t = line ? `${line} ${w}` : w
      if (ctx.measureText(t).width > m.width * 0.86 && line) {
        out.push(line)
        line = w
      } else line = t
    }
    if (line) out.push(line)
    return out
  })()
  font(ctx, 21, F.sans, 400)
  ctx.fillStyle = C.inkSoft
  ctx.textAlign = 'center'
  lines.forEach((l, i) => ctx.fillText(l, cx, iy + i * 34))
  ctx.textAlign = 'left'

  const emailY = iy + lines.length * 34 + 56
  font(ctx, 30, F.mono, 500)
  ctx.fillStyle = C.accent
  ctx.textAlign = 'center'
  ctx.fillText(profile.email, cx, emailY)
  ctx.textAlign = 'left'
  const ew = 460
  addLink(links, `mailto:${profile.email}`, 'Email Shereya', { x: cx - ew / 2, y: emailY - 34, w: ew, h: 50 })

  const btnY = emailY + 42
  const btnW = 300
  const btnH = 62
  const btnX = cx - btnW / 2
  ctx.save()
  ctx.shadowColor = 'rgba(60,44,26,0.3)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  ctx.fillStyle = '#6d2233'
  roundedRect(ctx, btnX, btnY, btnW, btnH, 3)
  ctx.fill()
  ctx.restore()
  tracked(ctx, 'Write an email', cx, btnY + 39, { align: 'center', color: '#f6ecdc', size: 15, tracking: 4 })
  addLink(links, `mailto:${profile.email}`, 'Write an email', { x: btnX, y: btnY, w: btnW, h: btnH })

  let sy = btnY + 118
  rule(ctx, cx - 250, sy, 500, { color: 'rgba(201,183,149,0.9)' })
  sy += 40
  socials.forEach((s, i) => {
    const rowY = sy + i * 56
    font(ctx, 24, F.serif, 500)
    ctx.fillStyle = C.ink
    ctx.textAlign = 'left'
    ctx.fillText(s.label, m.left + 60, rowY)
    font(ctx, 15, F.mono, 400)
    ctx.fillStyle = C.inkFaint
    ctx.textAlign = 'right'
    ctx.fillText(s.note ?? '', m.right - 60, rowY)
    ctx.textAlign = 'left'
    rule(ctx, m.left + 60, rowY + 14, m.width - 120, { color: 'rgba(201,183,149,0.55)' })
    addLink(links, s.href, s.label, { x: m.left + 40, y: rowY - 26, w: m.width - 80, h: 46 })
  })

  const sigY = sy + socials.length * 56 + 60
  annotate(ctx, 'Shereya', m.left + m.width * 0.52, sigY + 30, { size: 86, rotate: -0.06 })
  rule(ctx, m.left + m.width * 0.52, sigY + 46, 230, { color: 'rgba(36,28,23,0.4)' })
  font(ctx, 19, F.serif, 400, true)
  ctx.fillStyle = C.inkFaint
  ctx.fillText(profile.closing, m.left + m.width * 0.52, sigY + 80)
}

function contactVerso(ctx: Ctx, m: Metrics, links: LinkRect[]) {
  paperBase(ctx, m)
  let y = heading(ctx, m, 'Colophon', 'About This Book', m.top + 26)

  y = para(ctx, {
    text:
      'This portfolio is a real 3D book, built in the browser. The covers, the paper, the foil on the spine and the line of the page edges are all generated at runtime — there are no photographs of a book here. The page turn bends a subdivided mesh through a vertex shader so that the paper curls, and a matching depth material makes the shadow bend with it.',
    x: m.left,
    y,
    width: m.width,
    size: 19,
    lineHeight: 1.55,
  }) + 16

  y = para(ctx, {
    text:
      'The type is set with Cormorant Garamond, Inter, JetBrains Mono and Caveat. Everything printed on a page is drawn by hand-coded layout at the moment the page is first needed.',
    x: m.left,
    y,
    width: m.width,
    size: 19,
    lineHeight: 1.55,
  }) + 26

  rule(ctx, m.left, y, m.width, { color: 'rgba(201,183,149,0.85)' })
  y += 30

  const facts: [string, string][] = [
    ['Volume', 'I of I'],
    ['Author', profile.name],
    ['Built with', 'React · TypeScript · Three.js · GSAP'],
    ['Binding', 'Procedural, every session'],
    ['Edition', String(new Date().getFullYear())],
  ]
  facts.forEach(([k, v], i) => {
    tracked(ctx, k, m.left, y + i * 56 + 16, { color: C.inkFaint, size: 12, tracking: 3 })
    font(ctx, 22, F.serif, 500)
    ctx.fillStyle = C.ink
    ctx.fillText(v, m.left + 200, y + i * 56 + 18)
  })
  y += facts.length * 56 + 20

  rule(ctx, m.left, y, m.width, { color: 'rgba(201,183,149,0.85)' })
  y += 40
  ornament(ctx, m.left + m.width / 2, y, 220)
  y += 56
  font(ctx, 30, F.serif, 400, true)
  ctx.fillStyle = C.inkSoft
  ctx.textAlign = 'center'
  ctx.fillText('“Every idea has a story.', m.left + m.width / 2, y)
  ctx.fillText('This one is still being written.”', m.left + m.width / 2, y + 42)
  ctx.textAlign = 'left'
  y += 110

  const backW = m.width * 0.7
  const backX = m.left + (m.width - backW) / 2
  ctx.fillStyle = 'rgba(36,28,23,0.06)'
  roundedRect(ctx, backX, y, backW, 76, 3)
  ctx.fill()
  tracked(ctx, 'Return to the beginning', m.left + m.width / 2, y + 46, {
    align: 'center',
    color: C.ink,
    size: 15,
    tracking: 4,
  })
  addLink(links, 'book:chapter:0', 'Return to the beginning', { x: backX, y, w: backW, h: 76 })
}

/* ── registry ─────────────────────────────────────────────────────────────── */

const RECTO: Record<string, (ctx: Ctx, m: Metrics, links: LinkRect[]) => void> = {
  cover: coverRecto,
  about: aboutRecto,
  skills: skillsRecto,
  projects: projectsRecto,
  journey: journeyRecto,
  universe: universeRecto,
  experiments: experimentsRecto,
  contact: contactRecto,
}

const VERSO: Record<string, (ctx: Ctx, m: Metrics, links: LinkRect[]) => void> = {
  cover: coverVerso,
  about: aboutVerso,
  skills: skillsVerso,
  projects: projectsVerso,
  journey: journeyVerso,
  universe: universeVerso,
  experiments: experimentsVerso,
  contact: contactVerso,
}

export function renderPage(chapterIndex: number, side: Side, scale = 1): PageArt {
  const chapter = chapters[chapterIndex] ?? chapters[0]
  const w = Math.round(1024 * scale)
  const h = Math.round(1428 * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'alphabetic'

  // A recto face is mapped with u = 0 at the spine, so its binding edge is the
  // canvas's left side. A verso face is mirrored about the spine when the leaf
  // turns (and un-mirrored by the texture flip), which puts its spine at the
  // canvas's right side.
  const m = metrics(side === 'recto' ? 'left' : 'right')
  const links: LinkRect[] = []

  const draw = side === 'recto' ? RECTO[chapter.id] : VERSO[chapter.id]
  if (draw) draw(ctx, m, links)

  if (!(chapter.id === 'cover' && side === 'recto')) {
    runningHead(
      ctx,
      m,
      chapter.title,
      String(chapterIndex * 2 + (side === 'recto' ? 1 : 2)).padStart(2, '0'),
    )
  }

  return { canvas, links }
}

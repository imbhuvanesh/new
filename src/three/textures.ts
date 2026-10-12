import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────────
   Everything the book is made of is drawn here, at runtime. Leather grain,
   paper fibre, foil stamping, page edges and the studio floor — no image files.
   ───────────────────────────────────────────────────────────────────────────── */

type Canvas2D = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }

export function makeCanvas(w: number, h: number): Canvas2D {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return { canvas, ctx }
}

/* ── deterministic noise ──────────────────────────────────────────────────── */

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Tileable value noise in [0,1]. */
function valueNoise(w: number, h: number, grid: number, rnd: () => number): Float32Array {
  const gw = grid
  const field = new Float32Array(gw * gw)
  for (let i = 0; i < field.length; i++) field[i] = rnd()
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    const fy = (y / h) * gw
    const y0 = Math.floor(fy)
    const ty = smoothstep(fy - y0)
    const ya = ((y0 % gw) + gw) % gw
    const yb = (ya + 1) % gw
    for (let x = 0; x < w; x++) {
      const fx = (x / w) * gw
      const x0 = Math.floor(fx)
      const tx = smoothstep(fx - x0)
      const xa = ((x0 % gw) + gw) % gw
      const xb = (xa + 1) % gw
      const v00 = field[ya * gw + xa]
      const v10 = field[ya * gw + xb]
      const v01 = field[yb * gw + xa]
      const v11 = field[yb * gw + xb]
      const top = v00 + (v10 - v00) * tx
      const bot = v01 + (v11 - v01) * tx
      out[y * w + x] = top + (bot - top) * ty
    }
  }
  return out
}

export function fbm(w: number, h: number, octaves: number, base: number, seed: number): Float32Array {
  const rnd = mulberry32(seed)
  const out = new Float32Array(w * h)
  let amp = 1
  let total = 0
  let grid = base
  for (let o = 0; o < octaves; o++) {
    const layer = valueNoise(w, h, grid, rnd)
    for (let i = 0; i < out.length; i++) out[i] += layer[i] * amp
    total += amp
    amp *= 0.5
    grid = Math.round(grid * 2)
  }
  for (let i = 0; i < out.length; i++) out[i] /= total
  return out
}

/* ── field → canvas / normal map ──────────────────────────────────────────── */

type Rgb = [number, number, number]

function fieldToData(
  field: Float32Array,
  w: number,
  h: number,
  shade: (v: number, x: number, y: number) => Rgb,
) {
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const [r, g, b] = shade(field[i], x, y)
      const o = i * 4
      data[o] = r
      data[o + 1] = g
      data[o + 2] = b
      data[o + 3] = 255
    }
  }
  return data
}

function dataToCanvas(data: Uint8ClampedArray, w: number, h: number) {
  const { canvas, ctx } = makeCanvas(w, h)
  const image = ctx.createImageData(w, h)
  image.data.set(data)
  ctx.putImageData(image, 0, 0)
  return canvas
}

/** Sobel-derived tangent-space normal map — tileable. */
function fieldToNormalCanvas(field: Float32Array, w: number, h: number, strength: number) {
  const data = new Uint8ClampedArray(w * h * 4)
  const at = (x: number, y: number) => field[(((y % h) + h) % h) * w + (((x % w) + w) % w)]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength
      let nx = dx
      let ny = dy
      let nz = 1
      const len = Math.hypot(nx, ny, nz) || 1
      nx /= len
      ny /= len
      nz /= len
      const o = (y * w + x) * 4
      data[o] = (nx * 0.5 + 0.5) * 255
      data[o + 1] = (ny * 0.5 + 0.5) * 255
      data[o + 2] = (nz * 0.5 + 0.5) * 255
      data[o + 3] = 255
    }
  }
  return dataToCanvas(data, w, h)
}

function canvasToTexture(canvas: HTMLCanvasElement, srgb = false, repeat = 1) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  tex.anisotropy = 8
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.needsUpdate = true
  return tex
}

/* ── leather ──────────────────────────────────────────────────────────────── */

export type LeatherSet = {
  map: THREE.Texture
  normalMap: THREE.Texture
  roughnessMap: THREE.Texture
}

export function createLeather(size = 512, seed = 7, tint: Rgb = [54, 38, 29]): LeatherSet {
  const rnd = mulberry32(seed + 991)
  // Fine pebbled grain + broad creases.
  const fine = fbm(size, size, 5, 64, seed)
  const broad = fbm(size, size, 3, 6, seed + 41)
  const creases = fbm(size, size, 2, 3, seed + 97)
  const height = new Float32Array(size * size)
  for (let i = 0; i < height.length; i++) {
    height[i] = fine[i] * 0.5 + broad[i] * 0.32 + Math.pow(creases[i], 3) * 0.6
  }

  const colorData = fieldToData(height, size, size, (v, _x, _y) => {
    const n = v - 0.5
    const spec = rnd() < 0.006 ? 1.18 : 1
    const dark = 1 + n * 0.5
    return [
      Math.min(255, tint[0] * dark * spec + 6),
      Math.min(255, tint[1] * dark * spec + 4),
      Math.min(255, tint[2] * dark * spec + 3),
    ] as Rgb
  })

  const roughData = fieldToData(height, size, size, (v) => {
    const r = 0.62 + (0.5 - v) * 0.42
    return [r * 255, r * 255, r * 255] as Rgb
  })

  return {
    map: canvasToTexture(dataToCanvas(colorData, size, size), true),
    normalMap: canvasToTexture(fieldToNormalCanvas(height, size, size, 6), false),
    roughnessMap: canvasToTexture(dataToCanvas(roughData, size, size), false),
  }
}

/* ── paper ────────────────────────────────────────────────────────────────── */

export type PaperSet = {
  map: THREE.Texture
  normalMap: THREE.Texture
  roughnessMap: THREE.Texture
}

export function createPaper(
  size = 512,
  seed = 21,
  base: Rgb = [244, 236, 221],
): PaperSet {
  const rnd = mulberry32(seed + 13)
  const fibre = fbm(size, size, 5, 96, seed)
  const blotch = fbm(size, size, 3, 5, seed + 7)
  const height = new Float32Array(size * size)
  for (let i = 0; i < height.length; i++) height[i] = fibre[i] * 0.6 + blotch[i] * 0.4

  const colorData = fieldToData(height, size, size, (v, _x, _y) => {
    const n = (v - 0.5) * 0.10
    const grain = rnd() < 0.05 ? 0.985 : 1
    return [
      Math.min(255, base[0] * (1 + n) * grain),
      Math.min(255, base[1] * (1 + n * 0.94) * grain),
      Math.min(255, base[2] * (1 + n * 0.82) * grain),
    ] as Rgb
  })

  const roughData = fieldToData(height, size, size, (v) => {
    const r = 0.78 + (v - 0.5) * 0.16
    return [r * 255, r * 255, r * 255] as Rgb
  })

  return {
    map: canvasToTexture(dataToCanvas(colorData, size, size), true),
    normalMap: canvasToTexture(fieldToNormalCanvas(height, size, size, 2.2), false),
    roughnessMap: canvasToTexture(dataToCanvas(roughData, size, size), false),
  }
}

/* ── page edges (the fore-edge of the block) ──────────────────────────────── */

export function createPageEdgeTexture(): THREE.Texture {
  const w = 8
  const h = 256
  const { canvas, ctx } = makeCanvas(w, h)
  const rnd = mulberry32(5)
  const layers = 40
  const step = h / layers
  for (let i = 0; i < layers; i++) {
    const y = i * step
    // a very slightly warm, very slightly varied ivory per sheet
    const v = 0.86 + rnd() * 0.14
    const r = Math.round(238 * v)
    const g = Math.round(227 * v)
    const b = Math.round(205 * v)
    const grad = ctx.createLinearGradient(0, y, 0, y + step)
    grad.addColorStop(0, `rgb(${r},${g},${b})`)
    grad.addColorStop(0.62, `rgb(${Math.round(r * 0.9)},${Math.round(g * 0.9)},${Math.round(b * 0.89)})`)
    grad.addColorStop(1, `rgb(${Math.round(r * 0.66)},${Math.round(g * 0.65)},${Math.round(b * 0.63)})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, y, w, step)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/* ── the studio floor ─────────────────────────────────────────────────────── */

export function createDeskTextures(size = 512): {
  map: THREE.Texture
  normalMap: THREE.Texture
  roughnessMap: THREE.Texture
} {
  const fine = fbm(size, size, 6, 128, 303)
  const broad = fbm(size, size, 3, 4, 311)
  const height = new Float32Array(size * size)
  for (let i = 0; i < height.length; i++) height[i] = fine[i] * 0.45 + broad[i] * 0.55

  const colorData = fieldToData(height, size, size, (v) => {
    const n = (v - 0.5) * 22
    const base = 15 + n
    return [base + 3, base, base - 1] as Rgb
  })
  const roughData = fieldToData(height, size, size, (v) => {
    const r = 0.62 + (v - 0.5) * 0.3
    return [r * 255, r * 255, r * 255] as Rgb
  })

  return {
    map: canvasToTexture(dataToCanvas(colorData, size, size), true, 4),
    normalMap: canvasToTexture(fieldToNormalCanvas(height, size, size, 3), false),
    roughnessMap: canvasToTexture(dataToCanvas(roughData, size, size), false),
  }
}

/* ── endpaper ─────────────────────────────────────────────────────────────── */

export function createEndpaperTexture(size = 512): THREE.Texture {
  const { canvas, ctx } = makeCanvas(size, size)
  const noise = fbm(size, size, 4, 5, 77)
  const data = fieldToData(noise, size, size, (v) => {
    const t = v
    // deep burgundy → warm stone, like a marbled endpaper
    const r = 88 + t * 34
    const g = 52 + t * 24
    const b = 56 + t * 22
    return [r, g, b] as Rgb
  })
  const image = ctx.createImageData(size, size)
  image.data.set(data)
  ctx.putImageData(image, 0, 0)
  ctx.globalAlpha = 0.16
  ctx.strokeStyle = '#e4d7bf'
  ctx.lineWidth = 1
  for (let i = -size; i < size * 2; i += 9) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + size, size)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

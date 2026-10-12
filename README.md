# Shereya B — A Portfolio in Eight Chapters

An interactive, photorealistic hardcover book rendered in the browser. The
portfolio is a book: eight chapters, real page turns, foil-stamped cover. Built
with React, TypeScript, Vite, Tailwind, three.js (react-three-fiber + drei) and
GSAP.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # type-check, then build to dist/
npm run preview      # serve the production build
```

The build is base-path aware: `npm run build` emits assets under
`/Shereya_Portfolio/` so it works from a GitHub Pages project URL. To build for
a different path:

```bash
npm run build -- --base=/my-repo/
```

> `npm run preview` runs in *serve* mode, so Vite uses `base: '/'` and the
> absolute `/Shereya_Portfolio/...` URLs in `dist/index.html` will 404. Preview
> the Pages build with:
> `npx vite preview --base=/Shereya_Portfolio/`

## Deploying (GitHub Pages)

`gh-pages` is already a dev dependency and the script is wired up:

```bash
npm run deploy       # builds, then pushes dist/ to the gh-pages branch
```

Make sure the repository name matches the base path in `vite.config.ts`
(`/Shereya_Portfolio/`). Then set **Settings → Pages → Source** to the
`gh-pages` branch.

---

## Editing the content

**Everything the reader sees comes from one file:**

```
src/data/portfolio.ts
```

It holds the profile, contact links, education, experience, certifications,
skill groups, projects, experiments, the journey timeline, interests and the
eight chapter definitions. No component hard-codes content — change the data
file and the cover, the printed pages, the table of contents, the text reader
and the no-WebGL fallback all follow.

A few notes:

- `chapters` must stay in sync with the page layouts in `src/print/pages.ts`
  (the `RECTO` / `VERSO` lookup tables are keyed by `chapter.id`).
- `LEAF_COUNT` is derived from the chapter list; each chapter gets one physical
  leaf, whose front is the recto and whose back is the verso.
- Project previews are generated procedurally in code. Supply an `image:` URL
  on any project to replace the generated artwork with a real screenshot.
- Keep the facts true. This design deliberately contains no invented
  experience, qualifications, awards or metrics.

---

## How it works

```
src/
  data/portfolio.ts        all content
  state/useBookStore.ts    the state machine (phase, spread, overlays, audio)
  three/                   the 3D book
    constants.ts           every dimension, in metres
    geometry.ts            rounded boards, parametric spine
    curl.ts                page-bend shader (injected into MeshStandardMaterial)
    textures.ts            procedural leather / paper / desk / edge textures
    kit.ts                 one shared texture + material set
    Board.tsx Spine.tsx Stack.tsx Book.tsx Desk.tsx
    Scene.tsx              canvas, lights, procedural environment
    Director.tsx           intro, page turns, closing; owns all tweens
    motion.ts              the animated value bus + camera presets
  print/                   the "paper": every texture is drawn on a canvas
    engine.ts              type, rules, ornaments, page furniture
    cover.ts               foil-stamped boards, spines, endpapers
    pages.ts               16 page layouts + link hit-boxes
    index.ts               LRU page cache, prefetch, font loading
  ui/                      the DOM chrome
    IntroHUD Toolbar ContentsPanel Reader EndCard A11yContent ...
  components/
    BookExperience.tsx     canvas + overlays + gestures
    BookErrorBoundary.tsx  falls back if the 3D layer dies
    Fallback.tsx           the static, no-WebGL edition
```

Key ideas:

- **The book lies flat on the desk.** Pages live in the XZ plane, the spine runs
  along Z at `x = 0`, and a page turn is a rotation about Z from `0` to `π` with
  an interpolating pivot height, so a turning sheet always clears the stack.
- **Nothing is downloaded.** Leather, paper grain, foil, page edges, the desk
  and the endpapers are all drawn procedurally into canvases at boot, so there
  are no image requests and no CORS problems.
- **One tween owner.** `Director.tsx` is the only place that animates
  `motion.turned`; the book itself is a pure renderer of that value.
- **Only the pages you can see are rasterised.** Page bitmaps are cached in a
  small LRU keyed by chapter + side, and the director prefetches every page
  along a multi-leaf jump.
- **The intro is optional.** Skip Intro, the `Motion: reduced` toggle, and the
  `prefers-reduced-motion` media query all short-circuit the cinematic opening.

## Controls

| Action | How |
| --- | --- |
| Turn a page | Drag a sheet, click a page edge, `←` `→`, `PageUp` / `PageDown`, `Space` |
| Jump to a chapter | Click **Chapters**, or `c` |
| First / last chapter | `Home` / `End` |
| Read as text | Click **Read as text**, or `t` (a DOM reading view) |
| Close the book | Click **Close the book** for the closing sequence and end card |
| Mute / motion | The toolbar toggles; sound is off by default |

Links printed on the pages are real: clicking a project, certification or
social link opens it (websites in a new tab, email via a `mailto:` compose
window). Every page's links are also present in the DOM reading view and in the
screen-reader content list.

## Accessibility & performance

- A full DOM text edition (`Read as text`) and a visually-hidden content list
  are always in the document, so the portfolio is complete without WebGL,
  without JavaScript animation, and for screen readers.
- If WebGL2 is unavailable — or if the 3D layer throws for any reason — an
  error boundary swaps in the static edition rather than showing a blank page.
- `prefers-reduced-motion` is respected on first load and can be toggled live.
- Keyboard navigation, visible focus rings and Escape-to-close on the overlays.
- Geometry, texture sizes, shadow map resolution, device-pixel-ratio and the
  page render scale all step down on small screens; the scene idles cheaply.

## Tuning the look

Almost all of the art direction is data:

| What | Where |
| --- | --- |
| Palette (void, ivory, bronze, burgundy) | `src/index.css`, `src/print/engine.ts` |
| Cover / spine / endpaper art | `src/print/cover.ts` |
| Paper, gutter shadow, rules, type scale | `src/print/engine.ts` |
| Lighting, fog, environment | `src/three/Scene.tsx` |
| Desk and leather tone | `src/three/textures.ts`, `src/three/Desk.tsx` |
| Camera presets (closed / reading / portrait / finale) | `src/three/motion.ts` |
| Timing of the intro and closing | `src/three/Director.tsx` |
| Book dimensions and leaf thickness | `src/three/constants.ts` |

The camera presets are plain spherical numbers — `d`, `elev`, `azim`, and a
look-at target — so they are quick to nudge. `readingCam()` picks the portrait
preset when the viewport is taller than it is wide.

## Notes

- Modern (WebGL2-capable) browsers only; everything else gets the static
  edition.
- The scene targets 60 fps on capable hardware, but it is a real-time render:
  the shadow map and device pixel ratio are the first things to reduce on weak
  GPUs.
- Built with Vite 8 · React 19 · TypeScript · three r186 · Tailwind 3 · GSAP 3.

# Sector 09 — Pranav Reddy

An interactive city that is also a portfolio. The camera flies an authored route through a
night sector; four towers are the navigation, and the work is revealed on arrival.

```
TOWER 01  FOUNDRY   Work
TOWER 02  ORIGIN    About
TOWER 03  KILN      Lab
TOWER 04  RELAY     Contact
```

## Run it

```bash
npm install
```

```bash
npm run dev
```

`npm run build` produces the static site in `dist/`, and `npm run preview` serves it.

## How it is put together

Three layers, kept apart on purpose:

- **DOM** — every word on the site. Semantic, keyboard-operable, and readable with the
  canvas absent (`src/components`, `src/fallback`).
- **WebGL** — one `<Canvas>`, mounted once for the whole visit (`src/three`).
- **Drive** — Lenis + a single GSAP ScrollTrigger writing to a mutable object
  (`src/animation/scrollTimeline.ts`). Scroll values never enter React state; `useFrame`
  reads them from `travel` in `src/hooks/useStore.ts`, so the whole journey costs about
  six React renders.

The skyline is four instanced meshes. Windows, rain, wet streets and holograms are drawn
in shaders rather than geometry (`src/three/shaders`), which is what keeps the draw calls
flat while the city stays alive.

## Quality tiers

`src/hooks/usePerformance.ts` scores the device (cores, memory, GPU string, pointer type)
into `high` / `medium` / `low`, then samples frame rate and drops a tier if the running
average stays under 45fps. The tier drives building count, rain density, reflections and
post-processing. Phones get a different scene rather than the desktop one scaled down.

`prefers-reduced-motion` replaces the flight with composed still views, stops the rain and
traffic, and hands scrolling back to the browser. If WebGL is unavailable, the site falls
back to a designed static document with the same content.

## Editing content

Everything readable lives in `src/data` — `projects.ts`, `about.ts`, `lab.ts`,
`contact.ts`, `towers.ts` (positions and labels) and `telemetry.ts` (the HUD ticker).

The contact form has no backend: it composes a prefilled mail draft. Set
`CONTACT_ENDPOINT` in `src/data/contact.ts` to POST to a form service instead.

## Development aid

In dev only, `#route=0.42` parks the experience at that point on the route so an arrival
can be inspected without scrolling to it.

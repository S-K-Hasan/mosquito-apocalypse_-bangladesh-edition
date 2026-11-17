# Verification log

_Last run: 2026-11-17, after the mobile HUD, fullscreen/PWA, resize and render-batching pass._

## Commands

| Command | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passed, no diagnostics |
| `npm run build` (`vite build`) | Passed, 1,126.92 kB JS / 302.80 kB gzip, 79.21 kB CSS / 12.25 kB gzip |
| `npm run dev` + live Playwright run | Passed on desktop and mobile viewports |
| `vite preview` + live Playwright run | Passed; manifest, icons and service worker served from the production build |

The only build notes are toolchain warnings, not failures: Node 20.15 is older
than Vite 8's recommended 20.19, `vite.config.ts` uses `__dirname`, and the single
JS chunk exceeds 500 kB. CI uses Node 22, so the deployment build does not see the
Node warning.

## Live run

Every level was loaded through the real level-select UI in Chrome, allowed to
settle, and captured. Console capture showed **0 page errors and 0 console
errors** on every reload. Expected messages only:

- `[AudioDiag] AudioContext initialized, state: running`
- `[AudioDiag] Playing Bangla voice [...]` with the correct Bangla text
- `[Perf] merged static scenery: N → M meshes`
- `THREE.Clock` deprecation warning from Three.js

### Browser-rendered statistics

Values come from the in-game dev diagnostic (`document.documentElement.dataset.gameDiag`)
and from `renderer.info` after an explicit `render()`. Draw calls include the
atmosphere, particles and the enemies spawned at that moment, so they vary
slightly between runs.

| Scene (Level 1) | Draw calls | Triangles | Enemies |
|---|---|---|---|
| Base room | 80–83 | 8.5–8.8k | 0 |
| 15 mixed enemies | 290 | 38.4k | 15 |
| 42 mixed enemies (stress) | 1,364 | 98.6k | 42 |
| 3 bosses + 5 swarm | 452 | 63.3k | 8 |

Per-enemy mesh count after batching (was → now): normal/fast/swarm/stealth/armored
28 → 11, giant 45 → 13, Midnight Stalker 97 → 41, Invisible Apex 100 → 54,
Dengue King 128 → 57. Bosses were re-inspected close-up after the change; their
silhouettes, glow, weak points and animation nodes are unchanged.

| Level | Draw calls | Triangles | Static meshes after merge | Weapon box |
|---|---|---|---|---|
| 1 Bedroom Nightmare | 81 | 8.8k | 160 → 68 | clear |
| 2 Load Shedding Lockdown | 264 | 24.1k | 232 → 81 | clear |
| 3 Rooftop Battle | 72 | 14.6k | 252 → 58 | clear |
| 4 Dengue King Emerges | 110–170 | 17.7–21.7k | 176 → 25 | clear |
| 5 Midnight Street Invasion | 344 | 82.0k | merged | clear |
| 6 The Final Night | 302 | 37.9k | merged | clear |

`clear` means the weapon's projected bounding box never enters the central
reticle zone (|x| < 0.33 and |y| < 0.33 in NDC). The box still extends below the
bottom of the screen, which is normal for a first-person arm.

## Viewport and resize checks

| Requested viewport | CSS viewport reached | Canvas backing store | Result |
|---|---|---|---|
| 1920 × 1080 | 1920 × 1080 | 1536 × 864 (DPR 0.8) | Canvas fills the viewport; crosshair centre measured at 960 × 540 |
| 1366 × 768 | 1366 × 767 | 1092 × 614 (DPR 0.8) | Canvas fills the viewport; crosshair at 683 × 384; no horizontal overflow |
| 412 × 915 portrait | 412 × 915 | 330 × 732 (DPR 0.8) | Rotate-to-landscape overlay, menu still scrolls, no overflow |
| 915 × 412 landscape | 915 × 413 | 732 × 330 (DPR 0.8) | Joystick 112 × 154 at bottom-left, weapon dock 230 × 54 at bottom-centre, action cluster 168 × 168 at bottom-right, no overlap |

The canvas backing store is smaller than the CSS size because the renderer caps
device pixel ratio (0.8 here) for performance; the canvas is still scaled to the
full layout box, so no stretching or letterboxing occurs. Resize work is
coalesced into one rAF, driven by `ResizeObserver` plus `resize`,
`orientationchange`, `visualViewport` and `fullscreenchange`, and updates renderer
size, camera aspect/projection, DPR, particle point scale and the mobile layout in
one place.

Notes on this environment: the browser page zoom is 0.8 on this origin, so
`setViewportSize` was compensated (for example 732 × 331 → 915 × 413) to reach the
requested CSS size. Viewport changes occasionally needed a different pixel value
to take effect. Mobile layout was forced with `?mobile=1` because the desktop
Chrome instance has no touch capability; `?mobile=0` forces desktop layout.

## Mobile HUD

Verified in landscape at 915 × 412 against the running game:

- Mission panel collapses to one row plus a one-line objective preview; expanding
  it scrolls internally instead of pushing the HUD.
- Health and energy are two separate compact bars under the mission panel with
  numeric read-outs, so they no longer compete with the mission text.
- Joystick, RUN toggle, all five weapon slots, and the 3 × 3 action grid
  (flashlight / jump / secondary, crouch, hold-to-focus, primary attack) are fully
  inside the safe area, with no overlap at 915 × 412, and the short-screen
  (`max-height: 390px`) rule keeps them apart on smaller phones.
- The subtitle sits above the weapon dock on touch devices instead of behind it.
- The centre of the screen is left clear: the crosshair is pinned to true screen
  centre with a dark outline and no HUD panel covers the reticle.
- Portrait shows the Bangla/English rotate prompt.
- Input is Pointer Events based: joystick, look-drag and any action can be held at
  the same time, a release outside the element still lands, and
  `blur`/`visibilitychange` releases every held input.

## Fullscreen and PWA

- The fullscreen button is present in the main menu, the pause menu and the
  in-game HUD, and calls `requestFullscreen` synchronously from the click handler.
  `fullscreenchange`/`webkitfullscreenchange` are wired into the resize scheduler,
  and Escape is left to the browser.
- `requestFullscreen` **could not be exercised in this environment**: even a plain
  test button calling it on `#game-root` rejects with `TypeError`, while
  `document.fullscreenEnabled` is true. This is a limitation of the emulated
  Chrome here, not of the app code, so real fullscreen behaviour is unverified.
- `manifest.webmanifest` is served as `application/manifest+json` (200) with
  `standalone` display, landscape orientation, start URL, scope, theme colours and
  192/512/maskable/apple icons; all icon URLs return 200 from the production build.
- The service worker is registered in production only, is network-only (no
  caching), and its scope matches the deployment path, so it enables installability
  without pinning stale builds.
- Installation itself, and Android fullscreen behaviour, need a real device.

## What is actually verified

- Production build and TypeScript check pass.
- All six levels build, load and render without errors.
- Mobile landscape HUD layout, portrait rotate overlay, safe areas and the
  collapsible mission panel were measured in a running build.
- Resize/DPR handling reproduces the correct canvas size at all four required
  viewports.
- Static-scenery merging keeps the animated ceiling fan and the Level 4 giant
  mosquito shadow as separate nodes.
- Enemy and boss mesh batching reduces draw calls without visual regressions.
- The Bangla voice files load, play, and display the required signature lines
  including the comma in `মামুর বেটা, পারলে আজকে ঘুমা!`.
- Weapon rigs are per weapon, sit lower-right, and show the hand/forearm.

## What is not verified

- **Frame rate on real hardware.** This browser only exposes Microsoft Basic
  Render Driver (software GL) and throttles background tabs, so the reported
  `frameMs`/`worstFrameMs` values are meaningless and the 60 FPS desktop target,
  the 30–60 FPS mid-range Android target and thermal behaviour are untested. Only
  draw calls, triangle counts and enemy counts are trustworthy.
- **Touch feel on a real phone.** HUD geometry was measured with the touch layout
  forced on, but no Android/iOS device was available, so thumb reach, multi-touch
  under real fingers and mobile Chrome's own gesture handling are unconfirmed.
- **Fullscreen API and PWA installation.** Both require browser capabilities this
  emulated Chrome does not provide (see above).
- **Audio listening.** The agent cannot listen to output. Only file integrity,
  gain staging and script/line consistency were checked.
- **Human voice quality.** All 81 MP3s are still synthetic Edge TTS. See
  `docs/VOICE_AUDIT.md`; they must be replaced before claiming authentic voices.
- **Long-session soak test.** Level 2's power cut was observed in a live run
  earlier, but no multi-minute soak test was performed on this build.

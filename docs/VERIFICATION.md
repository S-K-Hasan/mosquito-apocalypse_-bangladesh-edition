# Verification log

_Last run: 2026-11-18, final verification after the mobile HUD, fullscreen/PWA, resize and render-batching pass._

## Commands

| Command | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passed, no diagnostics |
| `npm run build` (`vite build`) | Passed, 1,127.03 kB JS / 302.84 kB gzip, 79.38 kB CSS / 12.30 kB gzip |
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

Level 6 ("The Final Night") was measured with its authored waves spawned through
the game's own spawn function:

| Level 6 encounter (1366 × 768) | Draw calls | Triangles | Enemies |
|---|---|---|---|
| Empty arena at level start | 122 | 27.7k | 0–1 |
| Wave 1 + both wave 2 bosses | 844 | 141.2k | 19 |
| Wave 1 + wave 2, mid-fight | 1,002 | 166.1k | 25 |
| Same fight, natural spawns continuing | 1,100 | 181.4k | 27 |

The 19-enemy frame contained 1 Dengue King, 1 Invisible Apex, 2 Midnight
Stalkers, 4 giants, 3 stealth mosquitoes and 8 swarm mosquitoes; the player was
at 100/100 health with the Dengue King boss bar active.

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
| 915 × 412 landscape | 915 × 412 (DPR 1) | 915 × 412 | Crosshair centre 458 × 206; joystick 112 × 154, dock 230 × 54, cluster 168 × 168, all inside the viewport with no mutual overlap |

The canvas backing store is smaller than the CSS size because the renderer caps
device pixel ratio (0.8 here) for performance; the canvas is still scaled to the
full layout box, so no stretching or letterboxing occurs. Resize work is
coalesced into one rAF, driven by `ResizeObserver` plus `resize`,
`orientationchange`, `visualViewport` and `fullscreenchange`, and updates renderer
size, camera aspect/projection, DPR, particle point scale and the mobile layout in
one place.

Notes on this environment: the desktop browser page zoom is 0.8 on this origin, so
desktop viewports were compensated (for example 732 × 331 → 915 × 413) to reach the
requested CSS size; with mobile emulation enabled the requested viewport is the CSS
viewport directly, which is how the exact 915 × 412 run above was taken. Viewport
changes occasionally needed a different pixel value to take effect. Mobile layout
was forced with `?mobile=1` because the desktop Chrome instance has no touch
capability; `?mobile=0` forces desktop layout.

Two capture quirks, both tooling rather than app behaviour: when the emulated
viewport is larger than the physical window, the screenshot API pads the image to
the CSS size with black, so the Level 6 screenshot was clipped to the rendered
region (1093 × 614 for a 1366 × 768 CSS viewport). Under mobile emulation the
automated pointer click did not dispatch a React event on the menu buttons even
though the button was the topmost element at that point; a direct DOM click
started the level, and ordinary mouse clicks work in the non-mobile runs. Both
screenshots were still taken from the running game, not mocked up.

## Mobile HUD

Verified in landscape at 915 × 412 against the running game:

Measured layout (CSS pixels, viewport 915 × 412): mission/health block
`[7, 7, 267, 144]`, joystick `[10, 248, 112, 154]`, weapon dock
`[343, 349, 230, 54]`, action cluster `[737, 215, 168, 168]`. Every block is
inside the viewport, no pair overlaps, the page reports no horizontal or vertical
overflow, and the crosshair centre is `458 × 206` (true centre). The HUD exposes
five weapon slots and six action buttons.

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

## Deployment

| Item | Value |
|---|---|
| Branch / commits | `master` at `2d56c4d` (feature work) and `e84ceb6` (verification) |
| Workflow | Deploy to GitHub Pages, run [44215781994](https://github.com/S-K-Hasan/mosquito-apocalypse_-bangladesh-edition/actions/runs/44215781994) |
| Result | completed / success |
| Live URL | https://s-k-hasan.github.io/mosquito-apocalypse_-bangladesh-edition/ |
| Deployed bundle | `assets/index-DStaT-PM.js`, `assets/index-CicWMGfo.css` |

The CI build hash differs from the local build hash because CI rebuilds on Node 22
with its own minifier ordering; both are built from the same commit.

Live smoke test after the deploy:

- Menu loads with the new FULLSCREEN button, and `manifest.webmanifest`,
  `icons/icon-192.png` and `icons/apple-touch-icon.png` all return 200.
- The service worker is `activated` with scope
  `/mosquito-apocalypse_-bangladesh-edition/`.
- Starting Level 1 renders a 1093 × 614 canvas at a 1093 × 614 viewport with the
  crosshair at 547 × 307 and no overflow.
- At a 915 × 412 mobile viewport the live build exposes the same mobile HUD as the
  local build: joystick `[10, 248, 112, 154]`, dock `[343, 349, 230, 54]`, cluster
  `[737, 215, 168, 168]`, five weapon slots, six action buttons, crosshair at
  458 × 206, no overflow.
- The only console errors came from a Chrome extension
  (`chrome-extension://…/executors/200.js`), not from the game.

## What is actually verified

- Production build and TypeScript check pass.
- All six levels build, load and render without errors.
- Mobile landscape HUD layout, portrait rotate overlay, safe areas and the
  collapsible mission panel were measured in a running build.
- Level 6 was played with its authored wave 1 and both wave 2 bosses (19 enemies,
  including the Dengue King, Invisible Apex and two Midnight Stalkers) and rendered
  without errors at 844 draw calls / 141.2k triangles.
- Resize/DPR handling reproduces the correct canvas size at all four required
  viewports.
- Static-scenery merging keeps the animated ceiling fan and the Level 4 giant
  mosquito shadow as separate nodes.
- Enemy and boss mesh batching reduces draw calls without visual regressions.
- The Bangla voice files load, play, and display the required signature lines
  including the comma in `মামুর বেটা, পারলে আজকে ঘুমা!`.
- Weapon rigs are per weapon, sit lower-right, and show the hand/forearm.
- The GitHub Pages deployment completed successfully and the live site serves the
  new build with the mobile HUD, manifest and service worker.

## What is not verified

- **Frame rate on real hardware.** This browser only exposes Microsoft Basic
  Render Driver (software GL) and throttles background tabs, so the reported
  `frameMs`/`worstFrameMs` values are meaningless and the 60 FPS desktop target,
  the 30–60 FPS mid-range Android target and thermal behaviour are untested. A
  representative diagnostic reading was `fps: 2307.7`, `frameMs: 80.56`,
  `worstFrameMs: 100`; the FPS value is clearly not a real measurement. Only draw
  calls, triangle counts and enemy counts are trustworthy.
- **Natural wave pacing.** Agent tabs are background-throttled, so Level 6's waves
  were spawned through the game's own spawn function instead of waiting for the
  timed wave loop. The enemy types, counts and models are the authored ones.
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

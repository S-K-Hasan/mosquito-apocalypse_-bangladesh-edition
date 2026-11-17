# Verification log

_Last run: 2026-11-16, after the final weapon, particle and pointer-lock fixes._

## Commands

| Command | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passed, no diagnostics |
| `npm run build` (`vite build`) | Passed, 1,114.55 kB JS / 298.62 kB gzip, 72.93 kB CSS |
| `npm run dev` + live Playwright run | Passed for Levels 1–6 |

The only build warnings are pre-existing toolchain notes: Node 20.15 is older than
Vite 8's recommended 20.19, `vite.config.ts` uses `__dirname`, and the single JS
chunk is over 500 kB. None of them block the build.

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
after a fresh page load. Draw calls include the atmosphere, particles, HUD-independent
enemies already spawned at that moment, so they vary slightly between runs.

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

## What is actually verified

- Production build and TypeScript check pass.
- All six levels build, load and render without errors.
- Static-scenery merging keeps the animated ceiling fan and the Level 4 giant
  mosquito shadow as separate nodes.
- The Bangla voice files load, play, and display the required signature lines
  including the comma in `মামুর বেটা, পারলে আজকে ঘুমা!`.
- Weapon rigs are per weapon, sit lower-right, and show the hand/forearm.

## What is not verified

- **Frame rate on real hardware.** This browser only exposes Microsoft Basic
  Render Driver (software GL) and throttles background tabs to ~0.67 fps, so the
  measured 60 fps target, mid-range Android behaviour and thermal behaviour are
  untested.
- **Audio listening.** The agent cannot listen to output. Only file integrity,
  gain staging and script/line consistency were checked.
- **Android Chrome and touch controls.** No physical device or touch emulation
  was available; the mobile control overlay is therefore untested live.
- **Human voice quality.** All 81 MP3s are still synthetic Edge TTS. See
  `docs/VOICE_AUDIT.md`; they must be replaced before claiming authentic voices.
- **Long-session soak test.** Level 2's power cut was observed in a live run
  earlier, but no multi-minute soak test was performed on this build.

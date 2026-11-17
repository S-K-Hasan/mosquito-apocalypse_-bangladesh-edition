# Assets, licences and provenance

_Last updated: 2026-11-16_

## 1. Real-time 3D art

All in-game geometry, materials and textures are generated procedurally at
runtime. No third-party 3D models, texture packs, HDRI files or screenshots are
used as scenery.

| Content | Source |
|---|---|
| Environments, props, furniture, buildings, street dressing | `src/levels/environmentBuilder.ts`, `src/systems/propModels.ts` |
| Mosquitoes and bosses | `src/systems/models.ts`, `src/systems/bossModels.ts` |
| Weapons, hands, UI textures, wood/fabric/metal/skin/asphalt textures | `src/systems/models.ts`, `src/systems/artSystem.ts` (canvas-generated) |
| Dust, moonbeams, light shafts, flicker | `src/systems/atmosphere.ts` (procedural) |
| Particles, spray mist, smoke, sparks | `src/systems/particles.ts` (procedural) |
| Menu and HUD artwork | CSS/SVG/gradients and in-code shapes |

The screenshots in `docs/screenshots/` were captured from the running game and
contain only this generated content.

## 2. Voice files

`public/audio/voices/*.mp3` are **synthetic Microsoft Edge neural TTS renders**
(`bn-BD-PradeepNeural`, `bn-IN-BashkarNeural`) produced by the scripts in
`scripts/`. They are development placeholders, not human performances.

- No human actor release exists for these files.
- Redistribution terms depend on the Microsoft service used to generate them.
- Replace all 81 files with licensed human recordings before commercial release.
- Exact lines, casting notes and recording specs: `docs/VOICE_AUDIT.md`.

## 3. Unreferenced files in `public/assets/aistudio/`

The following files exist in the repository but are **not referenced by any
source file**:

- `image_5fa0b529.png` (3.0 MB)
- `image_f4a960a9.png` (3.0 MB)
- `Paste_November_09__2026_-_1_17AM_430b804a.png` (36 KB)
- `Paste_November_11__2026_-_12_56AM_f7f6b4c7.png` (34 KB)

They appear to be AI Studio exports. Their provenance and licence are unknown, so
they are deliberately **not used** by the game. They have been left in place rather
than deleted because they may be the user's working material. They still get
copied into `dist/` because they live under `public/`; remove or relocate them if a
small production bundle is required.

## 4. Fonts

Loaded in `index.html` from Google Fonts:

- **Bungee** — SIL Open Font License 1.1
- **Hind Siliguri** — SIL Open Font License 1.1
- **Plus Jakarta Sans** — SIL Open Font License 1.1

The game falls back to system sans-serif fonts when the network is unavailable.
No font binaries are vendored in the repository.

## 5. Libraries

| Package | Version | Licence |
|---|---|---|
| three | 0.187.0 | MIT |
| react / react-dom | 19.3.1 | MIT |
| lucide-react | 0.546.0 | ISC |
| canvas-confetti | 1.9.4 | ISC |
| motion | 12.43.0 | MIT |
| tailwindcss | 4.3.5 | MIT |
| vite | 8.3.8 | MIT |
| msedge-tts | 2.1.1 | MIT (tooling only; not shipped to the client) |

Full licence texts are available in each package under `node_modules/`.

## 6. What was not downloaded

No textures, models, sound effects, music or voice recordings were downloaded
from the internet during this pass. The only network requests at runtime are the
Google Fonts stylesheet/font files, and the local MP3 files served by the app.

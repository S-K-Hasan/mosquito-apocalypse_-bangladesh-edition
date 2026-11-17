# Screenshots

Captured on 2026-11-16/17 through Chrome/Playwright with the final code (after the
weapon-rig, particle, pointer-lock, HUD and model-batching work). The browser uses
Microsoft Basic Render Driver, so these are correctness and composition checks,
not performance evidence.

The last four files were added by the mobile-HUD/PWA pass and are the ones to
check for layout work:

| File | Viewport | What to look for |
|---|---|---|
| `desktop-1920x1080.png` | 1920 × 1080 | Desktop HUD, crosshair exactly at 960 × 540, weapon rig clear of centre |
| `boss-wave-1920x1080.png` | 1920 × 1080 | Midnight Stalker, Dengue King and Invisible Apex rendered together after mesh batching |
| `mobile-landscape-915x412.png` | 915 × 412 (touch) | Collapsed mission panel, separate health/energy bars, joystick, RUN, all five weapon slots, 3 × 3 action cluster |
| `mobile-portrait-412x915.png` | 412 × 915 (touch) | Rotate-to-landscape overlay |

| File | Scene | What to look for |
|---|---|---|
| `menu.png` | Main menu | Title art, level/settings entry points |
| `level1.png` | Bedroom Nightmare | Bed + moshari net, wardrobe, study props, wall clock, ceiling fan |
| `level2.png` | Load Shedding Lockdown | Corridor, doors, wall tiles, practical lights, ceiling fan, dust |
| `level3.png` | Rooftop Battle | Concrete roof, water drums, planters, parapet, cables, Dhaka skyline |
| `level4.png` | Dengue King Emerges | Arena lighting, boss/minion spawn, HUD |
| `level5.png` | Midnight Street Invasion | Rickshaws, posters, shop fronts, overhead wiring, barricade, street lamp |
| `level6.png` | The Final Night | Bio-pods, mutagen nest, chains, hazard floor, boss HUD |

Notes:

- The screenshots include the HUD and the mission/objective panel because those
  are part of the shipped view.
- Enemy positions and the power-cut phase are time-dependent; a screenshot taken
  a second earlier or later can look different.
- Level 2's power-cut state is not shown here: at the throttled frame rate in this
  environment it would take several minutes of wall-clock time to reach the first
  scheduled blackout. The lighting, flicker and dust system behind it is present
  in `src/systems/atmosphere.ts` and was confirmed in an earlier live run.
- Screenshots are of generated content only; see `docs/ASSETS.md` for provenance.

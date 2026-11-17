# Screenshots

Captured on 2026-11-16 from the dev build through Chrome/Playwright at
1708 × 771 with the final code (after weapon-rig, particle and pointer-lock
fixes). The browser uses Microsoft Basic Render Driver, so these are correctness
and composition checks, not performance evidence.

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

# Interactive scene library

Each scene has a stable ID and its own directory. IDs are persisted in local records and backups; translating documentation does not change them. The app retains its Chinese display labels.

| Directory | Contents |
| --- | --- |
| `warm-pond/` | Preserved warm Morandi pond, definition, instructions, and preview |
| `dream-ocean/` | Blue glowing fish variant, definition, instructions, and preview |
| `rain-window/` | Daylight green trees, thin fog, twinkling droplets, drag-to-wipe renderer |
| `dandelion-night/` | Klein-blue sky, smooth yellow moon, glowing dandelions and sky stars |
| `book-pages/` | Three source-frame atlases, automatic/manual turns, and paper sound |
| `crystal-guitar/` | Original-image cutouts, floating/orbit/wing animation, seven playable notes |
| `wisteria-glow/` | Upper-half watercolor vines and falling pink-white sparkles |
| `airplane-window/` | Floating silver window, looping blue nightscape, draggable blind |
| `shared/pond.js` | Shared fish, pointer light, ripples, and school behavior |
| `shared/renderer.js` | Scene mount/disposal, preventing stale animations and listeners |
| `catalog.js` | Registry, local calendar rules, unlock ownership, and favorite validation |

`scene.js` stores the definition and visual configuration; `renderer.js`, when present, handles drawing and interaction. `preview.png` is a persistent screenshot and is not a runtime dependency. Shared audio stays in the root `audio/` directory. Reference files are in `source-materials/` and are not used as network resources.

## Preview links

The everyday entry is http://127.0.0.1:8765/ . For a developer preview, append `?preview=ID` using any scene ID from the table. For example:

- http://127.0.0.1:8765/?preview=warm-pond
- http://127.0.0.1:8765/?preview=dream-ocean
- http://127.0.0.1:8765/?preview=rain-window
- http://127.0.0.1:8765/?preview=dandelion-night
- http://127.0.0.1:8765/?preview=book-pages
- http://127.0.0.1:8765/?preview=crystal-guitar
- http://127.0.0.1:8765/?preview=wisteria-glow
- http://127.0.0.1:8765/?preview=airplane-window

Previews do not change ownership, replace the saved everyday scene, or consume an unlock qualification. Timer changes still persist. The profile now supports switching among formally unlocked scenes and favorites; selecting one leaves preview mode. That newer library requirement supersedes the original first-version restriction on manual scene switching.

The preserved warm milestone is tagged `warm-pond-v1`; the confirmed third scene is tagged `rain-window-v1` where those tags are available. New scenes do not overwrite the older directories. Mobile counterparts and their specific framing live under `mobile/scenes/`.

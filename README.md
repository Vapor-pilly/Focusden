# Focusden

An offline-first Pomodoro app with eight interactive scenes, local audio, focus statistics, scene unlocks, favorites, and JSON backups. The app's display name is **Focus Paradise**; its existing Chinese interface is intentionally preserved. Repository paths and documentation are in English.

## Run on your computer

Double-click `start-focusden.cmd`, or run:

```sh
node server.cjs
```

Open **http://127.0.0.1:8765/**. The server only listens on your computer. Use the same browser profile, address, and port to retain your records. Node.js is required; the Windows launcher also recognizes the bundled runtime already installed on the original development computer. Runtime resources do not use external fonts, CDNs, analytics, or online audio.

## Features

- Default 25-minute focus and 5-minute break, with pause, resume, reset, a duration wheel, and separate duration settings.
- Focus ends automatically into a break. The break ends with a completion sound and one completed cycle; the next focus session starts manually.
- Accumulated actual focus time excludes pauses, breaks, and time after closing the page. Resetting does not deduct previously accumulated focus time.
- Settings, remaining progress, statistics, scene ownership, favorites, and daily unlock records are saved locally. Refreshing or reopening restores the timer paused.
- Completing a full cycle earns a next-day scene unlock. Selection uses the local calendar date and prioritizes scenes not yet unlocked. The same qualification cannot be consumed twice.
- The profile panel lists unlocked and favorite scenes. Click a scene to switch; click its star to favorite or unfavorite without switching. Scene changes do not reset an active timer.
- Continuous study rain, soft piano, and forest ambience; adjustable volume; a scene-effects switch; separate cycle-completion sound.
- JSON export/import for moving records between browsers or devices. Import replaces the current record rather than merging totals.

## Interactive scenes

| ID | English name | Interaction |
| --- | --- | --- |
| `warm-pond` | Warm Island Pond | Hold and move a light to guide a warm-colored fish school |
| `dream-ocean` | Dream Ocean | The same fish interaction with blue water and individual soft glows |
| `rain-window` | Rainy Green Window | Drag to wipe thin fog; droplets twinkle independently |
| `dandelion-night` | Moonlit Wishes | Click glowing flower heads to release seeds toward the upper right |
| `book-pages` | Breeze Between Pages | Original book frames turn automatically; click for an extra page |
| `crystal-guitar` | Crystal Guitar | Touch the strings to play C D E F G A B |
| `wisteria-glow` | Wisteria Starlight | Click watercolor vines to drop pink-white stars, crosses, and diamonds |
| `airplane-window` | Night Flight | Drag the floating window's blind handle down or up |

Developer previews use `http://127.0.0.1:8765/?preview=SCENE_ID`. A preview changes only the displayed scene, does not grant ownership or consume a qualification, and still saves timer progress. Choosing an owned scene from the profile leaves preview mode and saves that scene.

Scene configuration, renderers, instructions, and persistent screenshots are under [`scenes/`](scenes/README.md). Source references are kept in `source-materials/`; runtime scenes do not require the original videos. The earlier warm pond and rain-window milestones retain the local Git tags `warm-pond-v1` and `rain-window-v1` where available.

## Records and backups

Records live in browser `localStorage` under the compatibility key `yiyu.garden.v1`, not in the project files. Copying or uploading this repository does not copy personal focus records. Save a JSON backup from the profile panel before changing browsers or devices. Older backups remain accepted regardless of their filename prefix.

Critical operations save immediately and periodic saving targets roughly once per second. A crash or power loss can lose the final unsaved interval. Private browsing, clearing website data, changing origins/profiles, or storage removal can prevent recovery; use exported backups for important records. The app assumes one active page rather than concurrent edits from several tabs.

Legacy records did not contain scene history: migration can only confirm the previously saved current scene. Later daily unlocks are appended to ownership. The unlocked/favorite lists are saved in backups.

## iPhone package

The complete independent mobile version is in [`mobile/`](mobile/README.md). It includes all eight scenes and local audio, touch and safe-area layouts, home-screen icons, a manifest, verified offline caching, and cached audio byte-range support.

- [iPhone installation guide](mobile/IPHONE_INSTALL.md)
- [Open the mobile app](https://vapor-pilly.github.io/Focusden/mobile/)
- [Transport ZIP](mobile/Focusden-mobile.zip), approximately 13 MB
- [Mobile acceptance results](mobile/ACCEPTANCE_RESULTS.md)

The ZIP is a transport/deployment package, **not a directly installable iPhone application**. The mobile app is now hosted at the HTTPS address above; the user confirmed installation on an iPhone on 2026-10-24. For a new installation, open that address in Safari and add it to the Home Screen. Reopen from the new icon while online and confirm offline readiness before disconnecting or importing records. Device-specific offline and background behavior still require testing on the phone.

Mobile portrait layouts place the countdown lower, use larger centered play/pause symbols aligned with the side icons, and show only the coffee icon in the header. When an installed copy updates, leave it open online for the new offline resources to finish downloading, then fully close and reopen it. Records remain under the same storage key and address; there is no need to clear site data or reinstall.

Website updates are independent of the retained transport ZIP. The ZIP is an earlier verified snapshot; use the live mobile address for current fixes. Mobile backgrounds use explicit viewport height and a matching opaque page color with a short bottom-edge blend to avoid a contrasting strip in iOS standalone mode. Timer and control positions are unaffected by this background fix.

Desktop and phone records are independent; use JSON backups to transfer them. PWA background/lock-screen completion alerts are not guaranteed. See the installation guide for the exact limits.

## Audio

All supplied sounds are original procedural synthesis, not natural field recordings or live piano/guitar performances. They contain no downloaded songs. See [`audio/README.md`](audio/README.md) for provenance, file durations, and generation scripts. The earlier sparse drip and tide menu options have been superseded by continuous study rain and soft piano.

## Project layout

| Path | Purpose |
| --- | --- |
| `index.html`, `style.css` | Desktop screen and dialogs |
| `app.js` | Timer, local records, library, audio, and backups |
| `server.cjs`, `launch.ps1`, `start-focusden.cmd` | Local desktop launch |
| `scenes/` | Scene definitions, renderers, documentation, and previews |
| `audio/` | Local audio and provenance |
| `assets/` | Coffee-and-three-notes branding |
| `source-materials/` | Original visual references |
| `mobile/` | Independent iPhone PWA and transport archive |
| `tools/` | Asset generation, mobile build, and packaging helpers |
| `tests/` | Node tests and isolated browser checks |

## Tests and development

```sh
node --test --test-concurrency=1
```

Browser tests use Playwright and Edge/Chrome, with isolated contexts that do not overwrite everyday focus records. The original machine has a bundled runtime fallback; another machine needs the corresponding tools installed. Screenshots and logs are generated in the ignored `.preview/` directory. Mobile automation uses Chromium phone-size and touch emulation, not a real iPhone Safari session.

Read [PRD.md](PRD.md) for requirements, [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for sequencing and outstanding acceptance, and [TEST_RESULTS.md](TEST_RESULTS.md) for actual verification and historical failures. Passing the automated suite does not imply that every manual PRD acceptance item has been executed.

# Focusden Development Plan

Created 2026-10-20. English repository edition: 2026-10-24. Requirements: [PRD.md](PRD.md), current baseline 1.20. The initial single warm-pond release grew through separately authorized scenes, a library, and an independent mobile package. Historical plans are recorded below rather than presented as uncompleted current implementation.

## Working method

- PRD defines required behavior and acceptance; this plan defines sequence, outputs, dependencies, and recorded progress. README defines startup/use.
- Inspect and fix existing work instead of rebuilding already implemented features. Existing code is not by itself proof of acceptance.
- For requested separate issues: implement one issue, add/run meaningful corresponding checks, commit after success, then continue. Run the complete suite at the end when required.
- Update requirements when timer, counting, storage, unlock, or scope rules change. Do not infer accounts, online data services, or unrequested scenes.
- Status vocabulary: not started, in progress, awaiting acceptance, complete, blocked. Mark complete only when its stated condition has evidence. Do not fabricate dates or delivery estimates.
- Preserve failure records and document corrections. User visual/audio approval and real-device checks must not be assumed from automated tests.

## Original six-stage plan

These were the original first-version stages. Later delivery logs supersede obsolete names, sound choices, and single-scene restrictions; manual acceptance still needs actual evidence.

### Stage 1: page identity and home details

Tasks: unify the then-current product name and title; vertical settings ellipsis with a clear hit target; concise idle/running/paused/rest state; correct three-control hierarchy; 1280x720 and 1440x900 layouts; synchronize README/export naming while retaining old imports.

Output: updated page and screenshots. Condition: related A02/A03/A05 checks pass and old data survives. Never rename `yiyu.garden.v1` or start new statistics just to rename the product.

Recorded work: issue 1 doubled the frosted settings icon and removed the specified idle slogan; issue 2 renamed the original brand and removed footer captions. The later current coffee/three-note brand supersedes the former leaf identity. Those revisions have dedicated tests.

### Stage 2: timer, statistics, and saving

Verify start/pause/resume/reset/wheel; focus-to-break and break completion; completion once after pause/reset; editing save/cancel rules; actual focus seconds only; no historical deduction or double accounting; background elapsed progression and phase crossings; paused reload in either phase; periodic and critical saves; understandable storage errors.

Output: any necessary fixes and repeatable results. Condition: A06-A15 related behavior, with no duplicate totals or closed-page counting. Complex boundaries benefit from logic/browser tests; do not write tests that simply mirror minor visual implementation.

### Stage 3: first interactive pond

Preserve warm Morandi readability; free swim/light/drag/follow/release; leave/blur/visibility cleanup; UI/effect isolation; timer and scene coexistence; desktop fluidity; original source references; honest single-scene unlock wording.

Output: stable pond and idle/follow evidence. Condition: related A04/A05/A21/A22 checks. Investigate performance issues when observed rather than introducing speculative optimization.

### Stage 4: local audio

The original plan called for free, license-compatible natural rain, ocean, and forest recordings, local provenance/attribution, real listening for peaks/noise/seams, mutually exclusive playback, volume/stop, separate water effects and completion cue, and gesture-initiated sound.

Do not mark that original recording-selection requirement complete just because synthetic sounds exist. Later user feedback explicitly changed the delivered menu to continuous synthesized study rain, original soft piano, and retained forest ambience. Current provenance and limits are in `audio/README.md`; subjective listening remains a user acceptance item.

### Stage 5: backup, restoration, and offline reliability

Verify complete exported fields, former filename compatibility, replacement rather than merging, invalid JSON/version/value rejection, paused restored display/settings/statistics, dates/qualification, normal browser exit, offline reopen and all local audio, fixed-origin instructions, and power-loss boundary.

Output: backup samples and verification. Condition: related A01/A16/A19-A22 checks. A real computer restart remains a manual test unless it has actually occurred; refreshing is not a substitute. Tests use isolated browser records, never delete everyday data, and never restart the user's computer without authorization.

### Stage 6: integrated delivery

Record actual A01-A22 outcomes; exercise a complete focus/break/cue/manual-next flow; fix blocking defects and regress relevant/core behavior; document startup/backups/audio limits; maintain honest requirement checklists, screenshots, and results.

Output: runnable offline version and accurate documentation. Do not claim full manual product acceptance merely from automated UI tests or user silence.

## Scene expansion sequence

For each scene: confirm visual/interaction direction, retain older scenes and records, define a stable ID/local assets, mount and dispose safely, include appropriate actual-pixel/input checks, participate in daily selection/backups, and provide a non-owning developer preview.

1. Warm pond preserved in `scenes/warm-pond/`, with the earlier local `warm-pond-v1` tag.
2. Blue glowing fish in `scenes/dream-ocean/`, shared light/engine, independent directory and preview.
3. Rain window: green daylight, thin fog, scattered droplets, wipe/return, independently randomized star material; preserved `rain-window-v1` milestone.
4. Dandelions: original purple layout, then deep-blue moon/sway/natural drift, then Klein blue/smooth yellow/1.5x silver seeds, then 2x sky stars.
5. Book: original atlases and 2.2-second auto cadence, one-click queued turns, paper effect.
6. Guitar: original layers, floating/orbit/butterflies, confirmed C D E F G A B notes.
7. Wisteria: upper-half watercolor vines, gentle sway, three pink-white falling sparkle shapes, bounds and cleanup.
8. Airplane window: large lower-center floating frame, looping blue city, draggable blind.

Each was implemented and tested separately. Scene registration tests preserve date/consumption behavior. Current unseen-first ownership selection supersedes the original ability to revisit any scene before the library is complete.

## Recorded delivery milestones

| Date / milestone | Recorded result | Outstanding acceptance |
| --- | --- | --- |
| 2026-10-20 initial PRD/plan | Documentation established, original implementation audited | Manual product acceptance, not automatically complete |
| Settings issue | Two tests passed, icon spacing fixed | Other original-stage checks remain evidence-dependent |
| Brand/footer issue | Four tests passed | Later current branding supersedes this identity |
| Blue fish/library foundation | Eight new scene checks; 14 total | User visual experience |
| Rain window | Four scene checks, selection check; 19 total | User view/interaction |
| Droplet star material | Five rain checks; 20 total | User visual experience |
| First dandelions | Four scene + selection checks; 25 total | User visual experience |
| Moon/sway/natural seeds | Six dandelion checks; 27 total | Visual feedback |
| Klein blue and scale | Seven dandelion checks; 28 total | Visual feedback |
| Sky stars | Eight dandelion checks; 29 total | Visual feedback |
| Book, sparse rain, piano | Three independent commits; 38 total | User audio/visual experience |
| Guitar, continuous rain, coffee brand | Three independent commits; 44 total | User audio/visual experience |
| Wisteria | 14 related checks; 49 total | User view/interaction |
| Owned/favorite library | 25 related checks; independent commit | Real user usage |
| Airplane window | 17 related checks; 61 total | User interaction/appearance |
| Independent iPhone package | Six mobile checks + archive verification; 68 total | HTTPS entry, actual iPhone/Safari/home-screen/flight-mode use |

## Current completed scope

- [x] Eight separately stored interactive scenes, preview isolation, and lifecycle cleanup.
- [x] Timer/settings/statistics, old-format JSON restoration, local data compatibility, sound controls.
- [x] Owned/favorite profile tabs and persisted arrays; star toggles separate from selection; timer continuity and no qualification consumption on manual selection.
- [x] Next-day grants prefer unseen scenes, append ownership, and consume once; validate favorite ownership on import.
- [x] Independent `mobile/` with full local resources, touch/safe-area layouts, portrait/landscape framing, icons/manifest/service worker, verified offline readiness/repair, and audio byte ranges.
- [x] Approximately 13 MB transport archive, CRC/byte-exact verification, installation instructions, and phone-emulation screenshots.
- [x] Original complete 68-test regression recorded as passing after correcting a periodic brightness-sampling test; see TEST_RESULTS.md.
- [x] GitHub backup of the project and verified mobile archive at `Vapor-pilly/Focusden`.

## English repository edition

- [x] Translate all repository Markdown documentation, preserving current requirements, historical changes, acceptance IDs, test failures, and unverified limits.
- [x] Use ASCII paths: `mobile/`, `source-materials/`, `start-focusden.cmd`, English source asset names, mobile instructions/build info/checksums/preview names, and `Focusden-mobile.zip`.
- [x] Update generation scripts, packaging, tests, references, and copied mobile documentation; preserve Chinese application text and stable saved data IDs.
- [x] Audit all tracked paths/document language, regenerate and verify the archive, and run affected/full tests: 70 passed, 0 failed. Push the reviewed English edition after saving this record.

## Still pending or excluded

- [x] User enabled GitHub Pages at https://vapor-pilly.github.io/Focusden/mobile/ and confirmed iPhone installation on 2026-10-24. Offline/background acceptance on the phone remains separate.
- [x] Lower the mobile portrait countdown, enlarge and center playback glyphs with aligned side icons, and retain only the coffee icon in the mobile header. Each issue has its own passing browser test and Git commit. Regenerate the offline cache and transport archive before publishing.
- [ ] User performs real iPhone Safari installation, opens from the home-screen icon while online, confirms readiness, then checks flight mode and sound.
- [ ] Record any outstanding real reboot, subjective sound quality, performance, and visual acceptance instead of assuming them.

No accounts, cloud records/sync, rankings, social messages, complex reward economy, scene editor, native signed application, automatic file backup, or forced browser/computer restart is planned. Mobile initial HTTPS delivery is a separately authorized branch, not a change to desktop offline runtime.

Future work should state the concrete change, acceptance IDs when applicable, actual result, evidence, and unresolved limits. Continue from existing verified behavior rather than treating this plan as permission to rebuild or expand scope.

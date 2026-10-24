# Verification Results

Tests use isolated browser contexts and do not overwrite everyday focus records. Node's test runner drives actual local pages through Playwright and Edge/Chromium. The existing development runtime is reused rather than downloaded during a test. Helpers start/stop only their own local servers; already running desktop services are preserved. `BROWSER_EXECUTABLE` can select a desktop test executable where supported; other machines need the corresponding tools installed.

Complete command:

```sh
node --test --test-concurrency=1
```

Generated logs/screenshots live in the ignored `.preview/` directory. Persistent scene screenshots live under each scene directory; mobile examples are in `mobile/previews/`. These automated results are not a claim that all PRD manual acceptance items, actual reboot, subjective listening, or physical iPhone checks have passed.

## Latest completed baseline: iPhone package, 2026-10-23

**68 passed, 0 failed, 0 skipped**, approximately 261 seconds. This consists of the former 61 desktop checks, six mobile checks, and one transport-archive check. Implementation: `217d7ea`; final verification: `2c92604`. The subsequently uploaded archive is included in `29a95ad`.

Scope: eight scenes, actual drawing/pixels and input, timer/settings/statistics, profile library and favorites, old/new backups, local-calendar qualifications, audio, brand, mobile viewport/touch/offline behavior, and CRC/byte-exact archive validation. Browser suites also reject runtime errors and outside-origin requests.

First full run was 67/68: the old wisteria brightness check compared only two instants and missed its threshold. It was changed to sample several timestamps and check a real bright/dim range. Wisteria runtime drawing/interaction did not change. The focused checks passed, then the entire command was rerun successfully at 68/68.

The delivered runtime has 51 cache resources totaling approximately 14.4 MB; the transport ZIP is about 13 MB. Updating its acceptance report was followed by repackaging and another successful byte/CRC check. HTTPS publication and real iPhone installation were not performed. Desktop application files and scene runtime sources were preserved during that mobile delivery.

## Test coverage by area

### Settings and home issue 1

Command: `node --test tests/issue-1.test.cjs`. Original result: 2 passed.

Checks: 28px vertical icon versus the former 14px; same gradient/text clip/shadow/font finish as time; alignment, viewport bounds and hit target at 1280x720 and 1440x900; settings opens; specified idle sentence stays absent through start/reset/wheel save/reload; timer remains functional; no script errors/external requests. The first run found a slight overlap between settings and time hit areas; spacing was corrected and rerun. Screenshot `.preview/issue-1.png`.

### Former brand and footer issue 2

Original command: `node --test tests/issue-2.test.cjs`; originally 4 passed, later expanded to 5 for current branding.

The former Focus Garden title and unchanged leaf icon were checked at that historical stage. Both footer corners were removed while controls stayed centered, statistics/sound dialogs worked, older-name backups restored under the same storage key, new dated exports matched the then-current name, and rest-state restoration did not access removed nodes. Current checks now cover Focus Paradise, coffee cup and exactly three visible notes, running/rest titles, old backup compatibility, local SVG favicon, animated steam, and reduced motion. Screenshot `.preview/acceptance-final.png`, later `.preview/brand-guitar-final.png`.

The initial two issue commits were followed by a complete six-test rerun. Passing that narrow scope did not establish all PRD A01-A22 acceptance.

### Warm pond and Dream Ocean

Command: `node --test --test-concurrency=1 tests/scenes-selection.test.cjs tests/scenes-browser.test.cjs`.

Eight newly added checks originally passed, together with six existing UI checks for 14 total. They verify preserved warm palette/count, separate registration, actual blue canvas pixels, per-fish glow drawing, a reduced mean school distance after holding the unchanged warm pointer light, release/blur cleanup, preview isolation, old timer/statistics, date eligibility and consumed-grant backup compatibility. Missed days grant one change, not repeated rewards. Earlier revisiting behavior was later updated to prefer unowned scenes.

Persistent previews: `scenes/warm-pond/preview.png`, `scenes/dream-ocean/preview.png`; warm milestone `warm-pond-v1` where available.

### Rainy Green Window

Command: `node --test tests/rain-window.test.cjs`.

Four original browser checks verify actual daylight green pixels/scattered droplets and non-owning previews; visible local fog removal and gradual return, not merely state flags; UI isolation/blur release/timer continuity; old renderer/input disposal and backup-preserved totals/progress when swapping fish/rain scenes. A selection check added the third scene. Related checks passed; first complete suite grew to 19.

A fifth rain check records actual four-point glint brightness, independently staggered peaks, and random schedules with seeded test randomness, leaving product randomness unchanged. Total grew to 20. Persistent preview `scenes/rain-window/preview.png`.

### Dandelion progression

Initial four browser checks: original purple pixels and 14-head layout; non-owning preview; actually drawn glowing filaments moving up/right after a hit; blank/UI isolation; bounded repeated clicks; timer; backup and disposal. Selection/layout checks verify staggered heights and descending left/middle/right density. Related 11 checks passed; complete total 25. The third-scene milestone was preserved as `rain-window-v1`.

First initial full run was 24/25: a color assertion occasionally read the canvas before its first draw. Waiting for the actual expected pixels, without loosening color/behavior criteria, fixed it; all 25 then passed.

Moon/sway feedback added actual deep-blue/large-moon pixels and untouched drawing checks: every seed glows, head motion exceeds 22px, natural seed releases occur without incrementing click releases. Manual-release counters were separated from natural drift so natural motion was not falsely treated as a button misfire. Six dandelion tests, 27 total, passed.

Klein-blue/material feedback added three internal moon samples equal to `[255,220,105]`, no surface texture, saturated sky away from halo, 1.5x actual outer/core head radius across all fourteen heads, and silver-white four-point profiles for every attached/flying seed with bright/dim variation. Wind, natural drift, manual up/right motion, limits, timer and backups continued to pass. Seven dandelion checks, 28 total, passed.

Sky-star feedback measured actual offscreen ray/halo geometry at twice the reference seed profile, independently offset light peaks, and moon/timer avoidance. Eight dandelion tests, 29 total, passed. The persistent preview reflects the final moon/blue/star appearance rather than the obsolete purple version.

### Original-frame book

Four book checks plus the then-eight selection checks passed: original green pixels on white; 2.2-second untouched cadence; exactly one extra full/queued turn per hit; blank/UI isolation; paper switch; timer/backup; disposal.

The first extraction accidentally encoded one animated WebP rather than three static atlases. Decode/preview checks caught the missing sheets; the tool was corrected to output three distinct static WebP files, regenerated, and tests rerun without relaxing asset checks. The original source was preserved.

### Audio history and current checks

Sparse-drip delivery had two checks: real WAV gaps over 1.6 seconds with quiet intervals, rounded low-level waveform/no clipping or harsh dominant high frequencies/seam, and actual 32-second browser decoding/loop/volume/switch/stop. This was original synthesis, not field recording. That design was subsequently rejected by the user.

Piano replacement checked 64-second stereo soft dynamics, real expected changing pitches, no clipping and controlled loop, removal of the tide menu entry, actual playback/loop/volume, and stopping before switching to rain. The three separate deliveries ended at 38 complete tests on 2026-10-23: book `a3f094a`, sparse rain `1348fc5`, piano `86a2240`.

Current study rain checks replace sparse-drip assertions with continuous stereo broadband, no attention-grabbing silence/bursts or old tonal resonance, stable loudness, no clipping, smooth seam, and genuine browser play/loop/volume/switch/stop. Command: `node --test --test-concurrency=1 tests/soft-rain.test.cjs tests/audio-playback.test.cjs`; 3 related checks passed.

### Crystal Guitar and current coffee identity

Guitar command: `node --test --test-concurrency=1 tests/crystal-guitar.test.cjs tests/scenes-selection.test.cjs`; 13 related checks passed at original delivery.

Actual original-image rendering, changing float/orbit/wing poses, seven real local notes and hit targets, effects-off silence, blank/UI isolation, saved progress/restoration, and disposal are checked. WAV checks cover decay, clipping, and tuned pitches with normalized autocorrelation. Initial fixes included one-sample duration rounding and multi-timestamp floating checks to avoid testing only at a motion extremum.

Brand command `node --test --test-concurrency=1 tests/issue-2.test.cjs` passed 5: current titles, cup/three notes, local favicon, steam/reduced-motion, old import and new export identity.

The guitar/study-rain/brand deliveries ended at **44 passed**, approximately 142 seconds, with independent feature commits `3bb6e36`, `1ffd74d`, and `aa57f34`. Guitar is layered 2.5D, not a full 3D asset; notes/rain are synthetic. Subjective look and sound still require user feedback.

### Wisteria Starlight

Four browser checks plus selection checks verify real purple pixels only in the upper half at two desktop sizes, independent wind, no spontaneous sparkle shower, all three pink-white shapes genuinely drawn, downward motion/twinkling, UI isolation, cap/fade, reduced-motion behavior, timer/restoration, and disposal.

Image review enlarged the petals and distributed particles along the clicked vine to avoid one dense glow blob. Fourteen related checks passed. Commit `9144041`; full result **49 passed**, approximately 176 seconds. Previews: `scenes/wisteria-glow/preview.png`, `interaction-preview.png`.

The later mobile-delivery full run exposed the two-instant brightness sampling issue described in the latest baseline; the current test checks multiple timestamps without changing product behavior.

### Owned and favorite library

Command: `node --test --test-concurrency=1 tests/scene-library.test.cjs tests/scenes-selection.test.cjs tests/scenes-browser.test.cjs tests/issue-2.test.cjs`.

**25 related checks passed**. Five new browser cases and two collection/selection cases cover independent star/cancel; both list selections; immediate switch and preview exit without granting preview ownership; active timer continuation; eligibility unchanged by manual selection; local/export/import/reload persistence; only confirmed current-scene legacy migration; one appended unseen next-day scene; unknown/unowned invalid favorites rejected without corruption. Old brand/backups and scene behavior regressed successfully.

Personal-panel visual review confirmed the two tabs, gold favorite, current marker, and scrolling. Screenshots `.preview/scene-library-unlocked.png` and `.preview/scene-library-favorites.png`. Commit `e801f15`.

### Night Flight

Command: `node --test --test-concurrency=1 tests/airplane-window.test.cjs tests/scenes-selection.test.cjs`.

**17 related checks passed**. Four new browser cases and scene selection cover actual blue view, lower-center large window at two desktop sizes clear of timer/play, floating and two-layer periodic tile coverage/offset, handle drag, closed-blind opaque pixels, reopening and endpoint clamps, blank/UI isolation, capture/blur cleanup, reduced motion, favorite/library restoration and disposal.

Visual review replaced regular foreground waves with staggered road segments/branches. An early cleanup test accidentally clicked the old scene's time digits and opened the wheel; it was corrected to a genuine blank location and rerun. Commit `c7b2563`; complete library/window regression **61 passed**, approximately 206 seconds. Persistent open/closed previews are in `scenes/airplane-window/`.

### iPhone mobile and archive

Command: `node --test --test-concurrency=1 tests/mobile.test.cjs`; **6 passed**.

- Complete independent package, 51 local resources, manifest/icons, normalized core desktop source equality.
- All eight portrait scenes; main controls/dialog bounds; small and landscape viewports; safe-area-aware CSS.
- Actual touchStart/move/end events for fish, fog, book, guitar, vines, and blind.
- All scenes reload while offline, with genuinely playing/looping cached rain audio; partial bytes and suffix ranges return 206, invalid ranges 416.
- Missing cached resource is detected, then repaired online without deleting records.
- Desktop JSON/favorite migration, offline reopen, elapsed-time catch-up, pause/save/reload.

Initial test fixes normalized Windows line endings and chose a vine touch point away from timer controls. Testing is Edge/Chromium emulation, not physical iPhone Safari or home-screen installation. No HTTPS site was published. Screenshots `.preview/mobile-*.png` were copied to `mobile/previews/`.

Command: `node --test tests/mobile-package.test.cjs`; archive SHA-256/size, ZIP CRC, and every member's bytes are checked, with no repository metadata or original videos. The transport archive is regenerated after report changes and rechecked before handoff. It does not contain personal browser records.

## English repository edition: 2026-10-24

Documentation and tracked file paths are being translated to English, including `source-materials/`, `mobile/`, `start-focusden.cmd`, `IPHONE_INSTALL.md`, `build-info.json`, `archive-checksums.json`, preview names, and `Focusden-mobile.zip`. Runtime interface strings, storage key, scene IDs, and backup compatibility are intentionally preserved.

Generators, packaging, imports, and tests are updated to the new paths. Documentation audits require English Markdown and ASCII tracked paths, while allowing Chinese user-facing UI text and legacy-backup fixtures. The renamed ZIP must contain only the current English paths/documents and be verified after regeneration. Final execution results for this edition will be appended only after the checks actually run.

### English-edition final execution

2026-10-24: `node --test --test-concurrency=1` completed with **70 passed, 0 failed, 0 skipped**, approximately 283 seconds. This is the existing 68-check suite plus two new repository/ZIP language audits. Before the full run, the affected language/archive/mobile group passed all nine checks.

All tracked paths are ASCII; every tracked Markdown document is English. The distributed ZIP has English member paths under `mobile/` and English Markdown as well. Eight original visual references were compared against their previous Git blob IDs and retain identical contents. Desktop core runtime source, application language, stable scene IDs, storage key, and backup compatibility remain unchanged. Code-comment audit found no remaining untranslated comment lines.

The archive was rebuilt after updating this record's mobile counterpart and checked again for CRC, SHA-256, member-byte equality, and language compliance. GitHub's short repository description was successfully updated through its API to English. No HTTPS installation site or physical iPhone verification was added by this documentation task.

## Mobile bottom-edge background fix: 2026-10-24

Scope: background coverage and bottom color continuity only. Timer, controls, scene renderers, and record storage are unchanged. The mobile stylesheet gives the background layers an explicit viewport height, supplies an opaque scene-specific color on both root and body, and blends the last 64px into that color. Light scenes retain their original unshaded appearance above this small edge region. This addresses a contrasting system-painted strip without moving the interface; the iOS standalone viewport issue is documented in [WebKit 313800](https://www2.webkit.org/show_bug.cgi?id=313800).

Two new browser checks cover all eight scenes, iPhone portrait/landscape (390x844 and 844x390), and iPad portrait/landscape (768x1024 and 1024x768). The gutter test simulates a 62px exposed strip and compares actual screenshot pixels across its boundary at five horizontal points, allowing at most three RGB levels of difference. UI bounds must stay identical. The old build failed this pixel check. Footer painting is hidden only for the background screenshot so button pixels are not mistaken for a seam; UI geometry is checked separately.

The affected mobile/archive/language group passed 14 checks. After extending the edge blend and pixel checks to every light scene as well, focused gesture, offline-cache, and viewport-coverage checks passed, followed by the corrected all-scene gutter check. The archive/language group passed three checks again. These are Chromium mobile emulations, with physical iPhone/iPad confirmation still required for the native strip itself; a complete desktop-suite rerun is not claimed for this CSS-only follow-up.

The offline runtime version is `deff0bf8118b558f`. Per the user's request, the transport ZIP, checksum file, and packaged previews were not regenerated or modified. Its integrity test now validates the retained snapshot's checksum, CRC, inventory, resource byte totals, and required files independently of later website releases; it still compares every source byte when both versions match.

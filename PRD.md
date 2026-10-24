# Focusden Product Requirements

Current requirements baseline: **1.20**. English repository edition: **2026-10-24**. Initially compiled on 2026-10-20, with scene/library/mobile additions on 2026-10-23. The app's current Chinese display name corresponds to **Focus Paradise**; translating repository content does not localize the interface.

## 1. Purpose and authority

This PRD records user-confirmed behavior for development and acceptance. README explains how the current implementation runs; implementation alone does not override an agreed product rule. Any change to counting, statistics, unlocks, or persistence must also update this document. Historical changes below are retained as history; the latest explicit requirement takes precedence over superseded first-version restrictions.

The initial scope was an offline desktop Pomodoro timer, one warm interactive pond, local audio, persistence, and backups. Scenes were to be added individually. Later requests expanded the library to eight scenes, added owned/favorite scene switching, and authorized a separate iPhone package. These additions do not introduce accounts, a cloud database, or automatic cross-device synchronization.

## 2. Product goal and use cases

Provide a quiet, visually comfortable timer for studying, reading, and working. Interactive scenery offers gentle activity during focus or breaks. Actual focus accumulation survives normal reopening. Completing a full focus/break cycle earns a lightweight next-day scenery reward.

Use cases: manually begin focus, automatically enter a break, interact without altering timer results, pause and return, reset the current phase, reopen saved progress paused, and operate without an external network connection after the required local setup or mobile initial caching.

## 3. Runtime boundaries

### Desktop

- Single-user local browser app served at `http://127.0.0.1:8765/` by a small loopback-only server.
- No login, external fonts, CDNs, analytics, online audio, cloud database, or cloud records. Loopback asset requests are normal offline operation.
- Runtime resources are local; source videos are reference/development inputs rather than runtime dependencies.
- Keep the same browser profile, origin, and port for existing records. The first-version acceptance assumes one active page, not simultaneous edits from several tabs.

### Independent iPhone branch

- Complete static PWA in `mobile/`, with all eight scenes, audio, and application source.
- Initial home-screen installation requires an HTTPS address, Safari, and complete resource caching. A ZIP transferred to Files/WeChat is not directly installable.
- The package has been built and tested in phone-size/touch emulation. HTTPS publication and real iPhone installation have not been completed in the recorded delivery.
- Once the home-screen app itself confirms readiness, it can use local cached resources offline. The browser may check same-origin updates while online. No third-party services are required for app data.
- Desktop and phone records remain independent; transfer JSON manually. Do not promise background/lock-screen alarm reliability or absolute protection from browser storage removal.

## 4. Page framework and navigation

One full-screen scene with modal auxiliary panels; no login page or complex navigation hierarchy.

| Area or entry | Content / action | Purpose |
| --- | --- | --- |
| Full background | Current interactive scene | Ambient environment and pointer/touch interaction |
| Header | Brand, scene information, full-screen control | Identity and current scenery |
| Upper center | Focus/break label, remaining time, concise state | Main timer information |
| Time digits | Duration-wheel dialog | Adjust the current phase's default duration |
| Vertical dots beside time | Duration settings and reset | Set focus/break separately |
| Bottom left profile | Statistics, unlock status, owned/favorite scenes, backups | Personal local records |
| Bottom center | Start/pause | Timer control |
| Bottom right sound | Track selection, volume, effects, stop | Local audio control |

All dialogs close back to the scene. Timer-edit entries pause; viewing statistics, managing scenery, and adjusting sound do not pause a running timer. Selecting a scene closes the profile and leaves an existing developer preview without resetting time or consuming qualification.

## 5. Home screen and visual requirements

- Default pond uses warm, low-saturation Morandi colors: gray-green water, cream, dusty-pink, and terracotta fish, with soft light and ripples. Later scenes retain their separately approved palettes.
- Bold translucent/frosted time, inspired by an iPhone lock screen, upper-center and readable. Format is minutes and two-digit seconds (`00:00`); implementation permits longer values such as `120:00`.
- Settings uses a vertical ellipsis, enlarged from 14px to 28px, with the same translucent gradient, clipping, shadows, and font weight as the time.
- Remove the specified original idle slogan. Retain meaningful running, paused, and break status copy. Initial empty status does not reserve unnecessary space.
- Only the three centered main controls remain at the bottom; remove both former corner captions. Unlock status belongs in the profile.
- Side icons are approximately 80% opaque white, with the central timer control roughly twice their visual size. Light scenes may use coordinated darker translucent colors for readability.
- Brand: line-art coffee cup with exactly three gently rising musical steam notes; the favicon uses the same concept. Reduced motion stops note animation.
- At desktop sizes 1280x720 and 1440x900, primary controls and dialogs remain visible and non-overlapping. Scene-specific framing can preserve room for the timer and main controls.
- Mobile adds safe areas, finger-sized targets, readable forms, scrollable dialogs, and portrait/landscape framing.

## 6. Timer module

Purpose: run one complete focus/break cycle. Required data: default focus/rest minutes, current phase, remaining seconds, and transient running state. Operations: start, pause, resume, reset current phase, and edit either duration.

Flow:

`Manual focus start -> focus ends -> automatic break -> break ends -> cue and one completed cycle -> focus ready, paused`

Rules:

1. Defaults: 25-minute focus, 5-minute break. Current ranges are integer focus minutes 1-180 and rest minutes 1-60.
2. Only the end of the break completes/counts a cycle and grants that day's next-day eligibility. Focus completion alone does neither.
3. Pausing/resuming does not invalidate eventual completion.
4. Reset restarts only the current phase, paused. It does not count completion or deduct focus time already accumulated. Finishing the remaining cycle afterward still qualifies.
5. Opening duration editing pauses. Saving prepares the corresponding new duration for the current phase, paused. Canceling leaves remaining progress unchanged but paused. Invalid values are rejected.
6. Phase labels explain state; they must not provide arbitrary skipping to earn completion.
7. Break completion does not auto-start another focus session. One completion event counts once.
8. Desktop background tabs continue by elapsed time, including phase boundaries when callbacks resume. Fully frozen browsers can delay audio until execution resumes.
9. Refresh/close saves progress; reopening restores paused without counting the closed interval. Running state is not restored as running.
10. Mobile uses wall-clock elapsed time while the page survives background suspension; termination falls back to the most recently saved paused progress. It is not a system alarm.

## 7. Statistics

Save completed-cycle count and actual accumulated focus seconds, including focus from incomplete cycles. Exclude pauses, breaks, and closed-page time. Reset does not reduce past accumulation; restoring must not double-count it. Display may convert to minutes while keeping second-level precision underneath. No account system is involved.

## 8. Scene behavior and lifecycle

Persist stable scene IDs and ownership, not fish positions, light/ripple positions, particle state, open dialogs, or blind position. Scenes must genuinely respond to input rather than merely play a fixed video. UI interactions must not also affect the background. Unmounting must cancel animation, listeners, pointer state, and relevant lingering sounds.

### 8.1 Warm Island Pond and Dream Ocean

- Fish swim freely until the user holds the water. A pointer light appears and follows dragging.
- The school gradually gathers and follows; it must not be a prerecorded pointer animation.
- Release, leaving the region, losing focus, or cancellation releases interaction and the school disperses.
- Gentle ripples and optional local water effect; controls do not trigger them.
- The blue variant uses cobalt/electric blue with cream, mint, pale gold, coral, and lavender fish, each with restrained glow. The warm approved version stays preserved.
- Shared engine: `scenes/shared/pond.js`. Reference: `source-materials/ocean-reference.mp4`.

### 8.2 Rainy Green Window

- Daylight rainy glass, soft diffuse light, only blurred green trees beyond it.
- Thin even fog, no frame, furniture, or extra scene elements. Scattered tiny droplets, not a downpour or large bloom particles.
- Each droplet independently schedules four-point glints/halos with varying time, duration, and strength rather than synchronized blinking.
- Hold/drag to clear fog locally; it returns over about 13 seconds. UI does not wipe; losing focus ends input. Timer and backups stay usable.
- Directory `scenes/rain-window/`; preserved milestone `rain-window-v1` where available.

### 8.3 Moonlit Wishes

- Fourteen staggered dandelions at the bottom, progressively sparser from left to right (roughly 8/4/2).
- Current sky is saturated Klein blue, centered on `#002FA7`. The upper-right large moon is smooth `#FFDC69`, with no surface texture or craters and only an exterior halo.
- Head radii and filaments are 1.5 times the preceding version; roots, heights, layout, and enhanced wind sway stay unchanged.
- Every attached and flying seed has a silver-white core, halo, four-point rays, and individually offset bright/dim phases. A small number detach naturally without input.
- Clicking a head releases more attached seeds toward the upper right. Blank/UI clicks do not generate manual releases. Per-click maximum 23; flying total capped at 360; replenish removed seeds gradually after about 11-17 seconds and clean up expired/offscreen particles.
- Sky stars use twice the regular maximum seed light profile, avoid moon/timer, and twinkle independently with cached brightness sprites.
- Directory `scenes/dandelion-night/`; source `source-materials/dandelion.mp4`, color reference `source-materials/dandelion-color-reference.jpg`.

### 8.4 Breeze Between Pages

- Preserve original white background, green open book, orange butterfly, and page mark from `source-materials/book-pages.mp4`; crop phone/social UI and exclude the ending closure.
- First 6.6 seconds, 198 frames at 30 fps, in three static WebP atlases. Automatic turn interval approximately 2.2 seconds.
- A book click queues exactly one additional full turn without cutting a current turn short; blank/UI clicks do not add turns or change untouched automatic cadence.
- Automatic/manual turns request local paper audio through the effects switch; browser gesture/autoplay limits still apply.
- Directory `scenes/book-pages/`; `tools/prepare_book.py` rebuilds atlases and the approximately 0.58-second synthetic effect.

### 8.5 Crystal Guitar

- Preserve the silver iridescent guitar, decorations, and pink-white appearance from `source-materials/guitar.jpg` using cutouts and 2.5D projection, not a freely rotatable full 3D model.
- Subtle floating, clockwise ring projection around the neck axis with front/back depth, two independently fluttering butterflies, and extended matching background.
- Confirmed scale C D E F G A B. Click or stroke the string region to play local synthesized notes, with voice pooling, string light/vibration feedback, and the effects switch. Blank/UI clicks stay silent.
- Dispose residual string sounds, drawing, and input on scene change; respect reduced motion. Directory `scenes/crystal-guitar/`.

### 8.6 Wisteria Starlight

- Purple watercolor vines hang in the upper half, staggered and independently swaying. Longest centerline is 49% of height; clip the entire fringe at halfway. Keep the timer area sparser.
- Creamy-green background from `source-materials/wisteria.jpg`; take only sparkle shapes from `wisteria-sparkles.jpg`, ignoring its blue background/yellow color.
- Click a vine for 24 falling pink-white five-point stars, sparkling crosses, and small diamonds, with independent light, gravity, sideways drift, fade, and cleanup. No automatic star shower or blank/UI activation.
- Cap at 300. Reduced motion stops wind and reduces each burst to 12. No new audio. Watercolor is a procedural redraw, not a pixel-exact reproduction. Directory `scenes/wisteria-glow/`.

### 8.7 Night Flight

- Large lower-center subtly floating airplane window, black surroundings, silver-white illuminated frame, deep-to-bright-blue city nightscape inspired by `source-materials/airplane-window.jpg`.
- Two landscape layers with periodic terrain and repeated wide tiles scroll continuously at different speeds. No unrequested flight statistics or additional sound.
- Drag the top handle down/up to close/reopen the blind, with intermediate positions and endpoint clamping. Fully closed, it obscures the actual nightscape pixels within the aperture.
- Pointer capture, release/cancel/blur cleanup, reduced-motion support, and framing clear of timer/controls. Re-entering defaults open. Directory `scenes/airplane-window/`.

## 9. Audio module

Three current local background choices: continuous study rain, soft piano, and forest ambience. Select/switch/stop, volume, and the scene-effects switch are required. Only one background track plays at a time; switching stops the previous track. Stopping ambience does not disable the separate completion cue. Reopening must not force background playback before user interaction.

Current assets are original synthesis, accurately labeled, not natural field recordings or live performances. All files live in `audio/`; source/provenance is in `audio/README.md`. If natural recordings are added later, preserve their source, license, and attribution. The initial natural-recording request remains a historical requirement not fulfilled merely by relabeling synthetic audio; subsequent sound feedback explicitly selected the current synthetic study rain and piano.

- Study rain: 32-second continuous stereo, broad non-tonal texture, stable half-second loudness, no isolated resonant drops, clipping, harsh high-frequency dominance, or abrupt seam.
- Piano: 64-second original stereo soft melody, expected changing pitches, damped harmonics, soft attacks, light room reflections, controlled seam.
- Forest, water, and completion cue retained; page turn and seven 2.8-second plucked-string notes added.
- Legacy tide WAV remains for compatibility but is no longer offered or regenerated. The earlier sparse 1.9-3.2-second drop design was rejected and replaced.

## 10. Daily unlocks, scene ownership, and favorites

- Use the device's local calendar date: midnight is the boundary, not 24 hours since last opening.
- First use chooses an available current scene and owns it. A full cycle grants next-day eligibility; repeated completions on the same day do not immediately change scenery.
- On a later day's everyday open/reload, consume an unused qualification once. Prefer an unseen scene; when all are owned, choose another scene, excluding the current one. Several missed days yield at most one change, not stacked rewards.
- No eligibility means keep the current scene. Repeated same-day opens and backup restoration cannot consume the same grant twice. Persist `consumedDay` and `sceneChangedDay`.
- Profile tabs list owned scenes and favorites, with counts, names, current marker, and a star per row. Star toggling must not switch scenes; clicking a name in either tab switches immediately without resetting a running timer or consuming qualification.
- Favorites must be owned. Validate IDs/arrays/relationship before import; normalize duplicate entries. Legacy records have no historical ownership list, so migrate only their saved current scene and start with no favorites.
- Developer `?preview=ID` changes only displayed scenery, not saved scene/ownership/eligibility. Timer saving continues. Library selection removes the preview query and persists the selected owned scene.

## 11. Module relationships

| Event | Result |
| --- | --- |
| Focus elapsed | Decrease remaining time, add actual focus seconds, save |
| Focus ends | Start break, no cycle count yet |
| Break ends | Count once, cue, record eligibility, prepare focus paused, save |
| Pause/reset/edit | Update timer according to rules without deleting history |
| Scene gesture | Scene response and optional local effect, no timer reward |
| Statistics/sound/library | No phase skip or duplicate count |
| Refresh/close/reopen | Save/restore paused and evaluate the local day at everyday entry |
| Valid backup import | Replace validated state, pause, update UI and date-dependent selection |

## 12. Local data and files

Storage key remains **`yiyu.garden.v1`**, format version 1. The browser owns this state; the loopback server does not automatically write personal JSON into the project.

| Field | Meaning |
| --- | --- |
| `version` | Backup/schema version |
| `focus`, `rest` | Integer default minutes |
| `phase` | Focus or rest |
| `remaining` | Remaining seconds, fractional values allowed |
| `totalSeconds` | Actual accumulated focus seconds only |
| `cycles` | Nonnegative completed-cycle integer |
| `day` | Most recently recognized local date |
| `eligibleDay` | Most recent qualifying completion date |
| `scene` | Current registered scene ID |
| `consumedDay` | Last consumed qualification, optional in legacy records |
| `sceneChangedDay` | Last automatic change date, optional in legacy records |
| `volume`, `effects` | Saved audio preferences |
| `unlocked`, `favorites` | Owned scene IDs and their favorite subset |

Critical actions save immediately; periodic save targets about once per second. Normal refresh/exit/restart must restore successfully saved state. Sudden crash/power loss is bounded by the last successful write. Show understandable storage failures. Private mode, clearing data, a different browser/origin/profile, or OS storage reclamation cannot be repaired without an external backup.

App source/assets and `source-materials/` do not contain browser records. JSON exports do. Copying or uploading project files does not migrate the browser's data. Transient animation, dialogs, blind position, and current audio session need not persist.

## 13. Backup and restoration

- Profile offers manual JSON export/import containing all required fields and version. Browser download location is user-controlled, not a promised project subdirectory.
- Include a date in new export filenames; existing Chinese filename prefixes remain for the unchanged interface. Accept valid older backups regardless of filename, including former product names.
- Import replaces state; do not merge or double-add totals. Reject corrupt JSON, unsupported versions, invalid values, unknown scenes, or unowned favorites without destroying existing data.
- Restore paused and update settings, statistics, scene/library, and local-date qualification handling.
- No automatic scheduled file backups, cloud backups, backup history manager, or device sync is included.

## 14. Required delivery and excluded scope

Required current scope: complete focus/break flow; frosted timer/vertical settings and centered controls; all eight independent scenes; local statistics, settings, progress, unlocks/favorites; valid backups; local audio/provenance; deterministic qualification consumption; lifecycle cleanup; independent mobile package with verified offline resources and install instructions.

Not included: accounts, cloud database/sync, social features, rankings, task management, complex achievement economy, scene editor/importer, automatic next focus, counting closed-page time, system notifications, native signed IPA/desktop client, automatic file backup, or simultaneous multi-page coordination. Real iPhone installation and a published HTTPS entry remain pending rather than implicitly completed.

## 15. Practical acceptance criteria

These specify methods and expected results, not a claim that all manual steps have been executed. Controlled time and isolated test data may be used; do not overwrite everyday records or restart the user's computer without authorization.

| ID | Action | Required result |
| --- | --- | --- |
| A01 | Start local service and open with network disconnected | Scenes/audio work; no external requests |
| A02 | Inspect dialogs and home at 1280x720 and 1440x900 | Main actions visible, clickable, and non-overlapping |
| A03 | Inspect brand, timer, dots, state, and controls | Current approved brand/scene palette, frosted digits and 28px vertical dots, correct hierarchy, no removed corner/idle text |
| A04 | Leave fish idle, hold/drag, then release/leave | Free swimming, real following, light fade and dispersal |
| A05 | Operate UI and dialogs | Correct actions without scene/audio misfires |
| A06 | Initial start/pause/resume | 25/5 defaults, running decreases, pause stops, resume continues |
| A07 | Wheel and separate duration settings, including invalid input | New duration prepared paused; invalid values rejected |
| A08 | Open timer editor while running, then cancel | Paused, remaining progress not reset |
| A09 | End focus | Automatic break, no completed cycle yet |
| A10 | End break and wait | Distinct cue, one cycle, qualification, focus paused, no automatic next cycle |
| A11 | Pause/resume/reset, then complete | Counts once; control actions themselves never count |
| A12 | Focus about 10 s, pause about 5 s, then rest | Approximately 10 focus seconds accumulated, excluding pause/rest |
| A13 | Accumulate, reset, continue | Past focus remains; only newly elapsed time is added |
| A14 | Background and return | Correct elapsed progression and phase crossings; disclose frozen-browser sound delay |
| A15 | Refresh/close/reopen in both phases | Restore phase/remaining paused; no closed-interval credit |
| A16 | Change settings, complete, exit browser and restart computer | Saved settings/statistics/progress/scene/qualification restored; manual reboot test must actually be performed before marking passed |
| A17 | Play/switch/adjust/stop all backgrounds | Correct described sound/provenance, no overlap, effective volume/stop; synthesis not mislabeled as recordings |
| A18 | Toggle scene effects; stop ambience; finish a cycle | Effects switch independent; completion cue remains available |
| A19 | Export, alter, restore | Snapshot replaces records and restores paused without doubled totals |
| A20 | Import bad JSON/version/values/ownership | Understandable failure, old data intact |
| A21 | Preview multiple scenes and return | Real interaction, no ownership grant or qualification consumption |
| A22 | Inspect sound/source documentation | Accurate synthesis/reference provenance; realtime interaction rather than an unchanged video presented as interactive |

| ID | Daily check | Required result |
| --- | --- | --- |
| B01 | Complete, refresh/reopen on the same day | No early daily change |
| B02 | Reopen after local midnight with unused eligibility | One different scene; prioritize unseen, save ownership |
| B03 | Open next day without qualification | Keep current scene |
| B04 | Reopen repeatedly after a change | No repeat draw or double consumption |
| B05 | Miss several days with one grant | At most one new change |
| B06 | Export/restore scene and consumption fields | Restore selection and usage without duplicate grant |

Additional scene acceptance must check actual pixels/drawing, wind/particle directions, independent twinkling, original book cadence, all seven real guitar notes, upper-half vine clipping, opaque blind closure/reopening, input isolation, capped particles, backups, and cleanup. Library acceptance covers starring/canceling, both list selections, reload/export/import, legacy migration, preview isolation, invalid favorites, and timer continuity. Mobile acceptance covers all scenes offline, actual touch events, audio playback/ranges, missing-cache repair, small/landscape viewports, and transfer of desktop backups; real Safari/home-screen/flight-mode checks remain user-device work.

## 16. Requirement history

| Version | Change |
| --- | --- |
| 1.0 | Initial confirmed timer, warm pond, storage, audio, and acceptance boundaries; distinguish implementation from acceptance |
| 1.1 | Former Focus Garden display name, vertical settings, concise state, dated backups with legacy compatibility |
| 1.2 | Double-size frosted vertical ellipsis; remove specified idle sentence |
| 1.3 | Former brand retained icon; remove both footer corner captions |
| 1.4 | Preserve warm pond, add blue glowing fish and independent scene directories, daily selection/preview |
| 1.5 | Daylight rainy window, fog wiping/return, lifecycle and backup support |
| 1.6 | Independently randomized droplet star material |
| 1.7 | Original purple-night dandelions: 14 heads, left-dense layout, click release and bounded replenishment |
| 1.8 | Supersede purple with deep blue, large initially textured moon, stronger sway, natural drift, glow on every seed |
| 1.9 | Supersede texture/old color/size with Klein blue, smooth reference-yellow moon, 1.5x flowers, silver-white flashing seeds |
| 1.10 | Add independently twinkling sky stars with 2x seed light profile |
| 1.11 | Original-frame book with 2.2-second cadence, queued manual page and paper sound |
| 1.12 | Sparse soft drip audio (later rejected) |
| 1.13 | Replace tides with original soft piano; record three independently tested changes |
| 1.14 | Layered guitar, floating/orbit/wings and confirmed seven-note interaction |
| 1.15 | Supersede sparse drops with continuous stereo study rain |
| 1.16 | Current Focus Paradise brand, coffee/three-note mark, old data/key retained |
| 1.17 | Watercolor upper-half vines and three pink-white falling sparkle shapes |
| 1.18 | Owned/favorite scene library, persisted arrays, preview exit and unseen-first daily grants; supersede no-manual-switch rule |
| 1.19 | Floating airplane window, continuous city view, draggable blind |
| 1.20 | Independent iPhone PWA/package, offline caching, touch/safe areas, explicit initial HTTPS and real-device limits |
| English edition | Translate repository documentation and paths, preserve interface text and stable data IDs; no rewritten Git history |

Earlier first-version restrictions on a fifth scene, mobile work, publication, and owned-scene switching were explicitly superseded by the later user requests above. Original requests for natural recordings are not treated as fulfilled by synthetic audio; current sound provenance remains explicit. Automated success does not assert that every manual acceptance item, including a real computer reboot or iPhone installation, has passed.

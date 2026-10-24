# Mobile verification record

Recorded baseline: 2026-10-23. Complete command: `node --test --test-concurrency=1`.

**68 passed, 0 failed, 0 skipped**, approximately 261 seconds: the existing 61 desktop checks, six mobile checks, and one archive-integrity check.

Coverage includes eight scenes, real touch-event simulation, portrait/landscape and small viewports, offline reload, actual looping audio, 206 byte/suffix ranges and invalid-range 416, cache-loss detection/repair, desktop/favorite backup transfer, elapsed-time catch-up, and paused reopening. No third-party requests or runtime errors were observed. Desktop runtime sources were unchanged for that delivery.

The first complete run missed a threshold in the old two-instant wisteria brightness comparison. Sampling several timestamps to check a real bright/dim range fixed the test; scene runtime code was unchanged. Focused checks and a new complete 68-test run passed afterward.

The ZIP contains static runtime source/assets, instructions, and previews, not original source videos, Git, or personal browser records. CRC and byte-exact comparison validate each archive member; the final archive checksum report sits beside the ZIP.

English repository edition, 2026-10-24: directory/document/source-reference names are now English and the archive is regenerated with a `mobile/` root. The Chinese interface, stable scene IDs, storage key, and backup compatibility remain intact. Updated language/path and runtime checks are recorded in the parent `TEST_RESULTS.md` after execution.

Limits: Edge/Chromium mobile/touch emulation is not physical iPhone Safari acceptance. No HTTPS site or real home-screen installation has been completed. Follow `IPHONE_INSTALL.md` for first online installation, a second readiness check from the icon, and flight-mode verification. Background/lock-screen completion alerts are not guaranteed.

## English-edition execution: 2026-10-24

The complete suite passed **70 tests, 0 failures, 0 skips**, approximately 283 seconds, including two new language/path audits. All repository paths and Markdown, and all ZIP paths and Markdown, are English. Related mobile/archive/language checks passed nine tests before the complete run. The archive was regenerated after this report update and byte/CRC/language checked again. Runtime behavior and the Chinese interface remain unchanged; real iPhone installation and HTTPS publication remain pending as stated above.

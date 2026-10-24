# Focusden for iPhone

A complete independent PWA runtime containing all eight interactive scenes, local audio, Pomodoro timing, statistics, owned/favorite scenery, and JSON backups. The home-screen icon is a coffee cup with three musical notes. The existing Chinese application interface is preserved; all repository instructions and paths are in English.

**This is a file/deployment package. It has not been published to an HTTPS installation address or installed on a physical iPhone. The ZIP is not an iPhone installer.**

Read [IPHONE_INSTALL.md](IPHONE_INSTALL.md). iOS 17 or newer and Safari in normal browsing mode are recommended.

| Path | Purpose |
| --- | --- |
| `index.html`, `app.js`, `style.css` | Complete application source |
| `mobile.css`, `mobile.js` | Mobile layouts, safe areas, and offline readiness |
| `scenes/`, `audio/` | All eight scene runtimes and local sounds |
| `manifest.webmanifest`, `sw.js`, `assets/icon-*.png` | Home-screen identity and offline caching |
| `asset-list.json`, `build-info.json` | Runtime inventory and content version |
| `server.cjs` | Computer-only loopback preview on port 8787 |
| `previews/` | Phone-size screenshots, not runtime dependencies |
| `Focusden-mobile.zip` | Complete transport archive, excluding itself |
| `archive-checksums.json` | Final ZIP size, SHA-256, and verification result beside the archive |
| `ACCEPTANCE_RESULTS.md` | Verification evidence and real-device limits |

Approximately 14.4 MB of original runtime resources, about 13 MB compressed. Git metadata, temporary tools, original large reference videos, and personal browser records are intentionally excluded. All runnable source and prepared assets are included; an HTTPS static host can serve them without an account system, database, API, or Node backend.

Desktop behavior remains at its original address. Phone and computer data are separate; transfer JSON backups rather than expecting automatic sync. Common scene documentation describes desktop preview links; use port 8787 for this local mobile preview, or the corresponding path on the deployed HTTPS origin.

From the parent project, `python tools/build_mobile.py` rebuilds the managed mobile files (Pillow required), and `python tools/package_mobile.py` creates/verifies the ZIP. This is an independent copy; preserve any manual mobile edits before rebuilding, because managed source files are overwritten.

# iPhone installation and offline use

## File package versus installation

This package is a deployable PWA, not a signed IPA. Sending the ZIP through WeChat, AirDrop, or Files does not install a home-screen app or its offline cache. iPhone installation first needs an HTTPS address accessible in Safari.

Current HTTPS address: **https://vapor-pilly.github.io/Focusden/mobile/**. The user enabled GitHub Pages and confirmed iPhone installation on 2026-10-24. Offline startup and background behavior must still be checked on that device. `127.0.0.1:8787` is computer-only preview, not a phone-accessible installation URL. A plain-HTTP LAN address is not an offline installation solution for this package.

## First installation

1. Deploy this folder's static runtime files to an HTTPS static host. Keep `index.html` at the entry point and preserve the relative `assets/`, `audio/`, and `scenes/` structure. `sw.js` belongs beside `index.html`; do not rewrite missing WAV/JS requests into HTML.
2. Open that HTTPS address in iPhone Safari. Open the bottom-left profile panel and wait for its offline-ready message. The initial download is approximately 14.4 MB; keep the network connected.
3. Use Safari **Share -> Add to Home Screen**. If **Open as Web App** appears, enable it, then add the icon.
4. **Open from the new home-screen icon while still online, confirm offline readiness there again, and only then import a backup.** Home-screen and Safari storage may be separate; Safari caching alone is not proof that the installed app has its own cache.
5. Enable Airplane Mode, reopen from the icon, switch among owned scenes, operate the blind, and play rain. Only this establishes offline acceptance on your particular iPhone.

The interface remains Chinese. The profile panel is the bottom-left person icon; backup export/import are the two controls below the scene library, and the offline status/install-help section is below them.

## Transfer desktop records

1. Export a JSON backup from the desktop profile panel. Send it to the phone and save it in Files.
2. Open Focusden from its home-screen icon, choose profile backup import, and select that JSON.
3. Check cycle count, focus time, unlocked scenes, and favorites. Restoration is paused; start manually.
4. There is no automatic device sync. To move phone progress back, export on the phone and import on the computer. Import replaces current records; it does not merge totals from two devices.

## Update an installed copy

1. Open the existing home-screen icon with internet access and leave it open while resources download. The service worker checks for a new version and only activates its replacement after the complete resource set is cached.
2. Fully close the app from the app switcher, then reopen it to load the new page and styles. If an update is still downloading, allow it to finish online before reopening again.
3. Keep the same app icon and HTTPS address. Normal updates preserve statistics, saved timing, favorites, and scene ownership. Do not clear website data or delete/reinstall the app to force an update.

## Everyday behavior and limits

- After complete caching, application, scenery, and audio run from local device cache. An online reopen may check same-origin updates; there are no third-party fonts, CDNs, analytics, or audio requests.
- Normal refresh/restart preserves saved records. Use the same home-screen app. Domain/port changes, another browser, deleting the app, or clearing site data can separate or remove records. The app cannot guarantee against OS storage reclamation; export important backups regularly.
- While the page survives, the mobile timer catches up actual elapsed background time. If iOS terminates it, reopening restores the last saved remaining time paused. **PWA completion audio is not guaranteed to sound on time while locked or backgrounded; this app is not a native system alarm.** Start sounds through a user gesture.
- Pull/push the blind handle; hold water to guide fish; drag to wipe fog; tap book/flowers/vines; tap or stroke strings.
- The profile's offline-repair button can replenish missing cache resources while online without deleting focus records.

## Computer preview

Run `node server.cjs` inside `mobile/`, then open http://127.0.0.1:8787/ . Browser device tools can simulate a phone. This address is local to the computer; use an isolated test profile and do not confuse preview records with phone data.

## Verification scope

Automated checks cover phone-sized layouts and real touch-event simulation, all-scene offline reopening, actual offline audio playback and Safari-style byte ranges, cache loss/repair, desktop-backup transfer, small screens, and landscape. The engine is Edge/Chromium, not physical iPhone Safari. Adding to the Home Screen, flight-mode startup, and lock-screen behavior must still be confirmed on your device.

## Official references

- [Apple: turn a website into an app in Safari](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios)
- [MDN: Service Workers require a secure origin](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [WebKit: storage and persistence policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [WebKit: home-screen storage isolation](https://webkit.org/tracking-prevention/)
- [WebKit: inactive iOS pages may be suspended](https://webkit.org/blog/8970/how-web-content-can-affect-power-usage/)

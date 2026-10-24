# Rainy Green Window

A daytime rainy view through glass: soft green tree silhouettes, diffuse natural light, thin even fog, and scattered small droplets. Each droplet independently flashes a gentle four-point sparkle and halo at random times. No window frame, furniture, or extra scenery is added.

Hold and drag to wipe a small clear area. Fog gradually returns in approximately 13 seconds. Droplets remain separate from the pointer; they do not become pointer-following stars. Buttons and dialogs do not wipe the glass; losing focus ends the gesture.

- `scene.js`: registration and display copy.
- `renderer.js`: trees, fog, droplets, wiping, and lifecycle cleanup.
- `preview.png`: actual page screenshot, not needed at runtime.

Preview: http://127.0.0.1:8765/?preview=rain-window

No new external images or network dependencies are required. Background sound is still selected manually in the sound panel. Switching away disposes the old drawing and input handlers.

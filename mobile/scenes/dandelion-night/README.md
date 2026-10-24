# Moonlit Wishes: scene four

Realtime glowing filaments inspired by `source-materials/dandelion.mp4`. The color reference is `source-materials/dandelion-color-reference.jpg`; the original reference files are not modified by rendering.

Current appearance:

- Saturated Klein-blue gradient, centered on `#002FA7`.
- A large upper-right moon colored `#FFDC69`, smooth and textureless, with a soft exterior halo.
- Fourteen staggered flower heads along the bottom, denser on the left and sparser on the right. Head radii and filament sizes are 1.5 times the earlier version; roots, height pattern, and enhanced wind sway are retained.
- Every attached and flying seed has a silver-white core, soft halo, and four-point star rays with independent bright/dim phases.
- A few seeds drift naturally without input; clicking a particular head releases more seeds toward the upper right.
- Blank areas and UI do not cause manual releases. Replenishment, particle limits, offscreen cleanup, timer behavior, and backup compatibility remain intact.
- Additional independent sky stars have twice the standard maximum seed's halo and star-ray size. They avoid the moon and timer; 32 cached brightness levels keep drawing lightweight.

`scene.js` defines layout and configuration; `renderer.js` implements drawing and interaction; `preview.png` records the page.

Preview: http://127.0.0.1:8765/?preview=dandelion-night

The third scene remains in `../rain-window/`, with its confirmed milestone tagged `rain-window-v1`. This scene does not replace the ponds or rain window.

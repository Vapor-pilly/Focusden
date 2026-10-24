# Night Flight: scene eight

Inspired by `source-materials/airplane-window.jpg`: a dark cabin, a large lower-center silver-white glowing frame, and a blue nightscape. Realtime local Canvas redraws the scene; the reference image is not an online or runtime dependency.

The window floats slightly up and down. Its metal frame has layered cool-white highlights. Inside, deep-blue sky, distant terrain, city lights, and roads extend horizontally. Two wide periodic landscape layers scroll at different speeds with duplicate tiles for continuous coverage. No flight-data overlay or new sound was requested.

Hold the top handle and pull down to close the blind or push up to reopen it. Intermediate positions are supported. The blind is clipped to the aperture and fully covers the view at its closed limit. Pointer capture keeps dragging after leaving the handle; release, cancellation, lost focus, and disposal clear interaction. Re-entering starts open; blind position is transient rather than an added persistent field.

Reduced motion stops automatic floating and landscape movement but leaves dragging usable. Desktop framing was checked at 1440x900 and 1280x720, clear of the timer and play button. The mobile copy has separate portrait/landscape framing.

This directory contains configuration, drawing code, instructions, and `preview.png` / `closed-preview.png`. The scene supports daily ownership unlocks, profile switching, favorites, and backups; the previous seven scenes remain intact.

Preview: http://127.0.0.1:8765/?preview=airplane-window

Tests: `node --test --test-concurrency=1 tests/airplane-window.test.cjs tests/scenes-selection.test.cjs`.

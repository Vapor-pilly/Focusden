# Wisteria Starlight: scene seven

References: `source-materials/wisteria.jpg` and `source-materials/wisteria-sparkles.jpg`. The first supplies purple watercolor vines and a light creamy-green background. The second supplies only five-point stars, sparkling crosses, and small diamonds; its blue background and yellow star color are ignored.

Canvas redraws the watercolor style through translucent overlapping petals and pigment patches, not video playback or a pixel-exact copy. Flowers are painted into offscreen stamps once. Vines sway independently, hang from the top, and have staggered lengths. The longest centerline is 49% of the viewport; the entire fringe is clipped to the upper half. The timer area is sparser.

Click a vine for 24 pink-white particles of all three shapes, with halos, independent twinkling, downward gravity, sideways drift, and eventual fading. Blank/UI clicks do not trigger them. Particles are capped at 300. Reduced motion stops wind sway and lowers each burst to 12. No additional audio was requested or added.

`scene.js`, `renderer.js`, `preview.png`, and `interaction-preview.png` are kept here. Older scenes remain available; daily unlocks, saved ownership, favorites, backups, and lifecycle cleanup are supported.

Preview: http://127.0.0.1:8765/?preview=wisteria-glow

Tests: `node --test --test-concurrency=1 tests/wisteria-glow.test.cjs tests/scenes-selection.test.cjs`.

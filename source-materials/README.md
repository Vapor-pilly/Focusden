# Source visual references

User-provided original references are retained for asset preparation and visual comparison. Runtime scenes use their own local renderers and prepared assets; the originals are not fetched during normal app use.

| File | Used for |
| --- | --- |
| `ocean-reference.mp4` | Fish-school movement and the blue ocean palette |
| `book-pages.mp4` | Original book imagery and measured automatic turn cadence |
| `dandelion.mp4` | Dandelion filament/seed motion |
| `dandelion-color-reference.jpg` | Klein blue and smooth reference-yellow moon |
| `guitar.jpg` | Original iridescent guitar and decorative cutouts |
| `wisteria.jpg` | Purple watercolor vine appearance |
| `wisteria-sparkles.jpg` | Sparkle shapes only, excluding its background/color |
| `airplane-window.jpg` | Silver frame, dark surroundings, and blue nightscape |

English filenames replace the former Chinese filenames without changing their binary content. Preparation scripts under `tools/` reference these names. The mobile runtime package intentionally omits the original large reference files; it includes all prepared assets needed for operation. Reference ownership or redistribution rights are not changed by renaming files.

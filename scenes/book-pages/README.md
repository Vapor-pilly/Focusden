# Breeze Between Pages: scene five

Uses the original open-book imagery from `source-materials/book-pages.mp4`: white background, green cover, orange butterfly, and the mark on the right page. Phone/social UI is cropped away; the closing-book segment at the end is excluded. The book itself is not redesigned.

The first three turn starts are approximately 0, 2.2, and 4.4 seconds. The first 6.6 seconds provide 198 frames at 30 fps, stored as three static WebP atlases. Automatic turns retain the approximately 2.2-second source cadence.

Click the book for one extra complete turn. A click during a turn queues another rather than interrupting it. Untouched playback keeps the original cadence; blank and UI clicks do not add turns. Automatic and manual turns trigger a local paper effect controlled by the scene-effects switch. Initial automatic playback may be silent until a user gesture because of browser autoplay rules.

`tools/prepare_book.py` rebuilds the atlases and original synthesized paper sound; unrelated source-recording audio is not reused.

Preview: http://127.0.0.1:8765/?preview=book-pages

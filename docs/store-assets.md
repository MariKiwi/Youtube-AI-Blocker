# Store Assets

The repository includes a small screenshot mockup site under `example/` for store listing imagery.

## Included mockup scenes

- `example/index.html`: a styled page with screenshot-ready layouts for the extension popup, marked feed cards, and watch-page blocking/actions
- `example/styles.css`: presentation styles for the mockup

The page is meant for local capture and cropping, not production deployment.

## Usage

Open `example/index.html` in a browser and capture the sections you need for the Chrome Web Store listing.

Suggested crops:

1. Full-page hero and showcase for an overview shot
2. Popup card for settings and blocking controls
3. Feed grid for marked thumbnails and confidence states
4. Watch scene for inline voting controls and the block overlay

## Notes

- The mockup reuses the shared artwork in `website/assets/`
- If the extension UI or visible moderation states change, update the mockup and `tests/example-promo.test.js`
- Keep `tests/TEST_CATALOG.md` aligned with any added screenshot scenes or behavior changes

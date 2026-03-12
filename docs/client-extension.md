# Client Extension

## Current foundation

The client is scaffolded as a Chromium Manifest V3 extension with no build step.

Current pieces:

- `client/manifest.json`: extension manifest
- `client/background/background.js`: installation bootstrap
- `client/common/settings.js`: shared settings storage
- `client/common/api.js`: shared API client wrapper
- `client/content/content.js`: YouTube content-script bootstrap
- `client/popup/`: extension popup UI for settings

## Current settings

- `apiBaseUrl`
- `blockingEnabled`
- `debugUnknownIndicators`

These settings are stored through `chrome.storage.sync` when available.

Source-tree default local API:

- `http://127.0.0.1:3000`

Packaged builds can override this through the root `.env` file. `make build-extension` and `make build-firefox-addon` stamp the built extension with `EXTENSION_DEFAULT_API_BASE_URL` and the matching API host permission.

## Current scope

The extension now also includes the first watch-page integration and initial card highlighting:

- detect the default YouTube watch page
- find the player action row
- fetch the current video state from the API
- inject a YouTube-like placeholder control group next to the native buttons
- detect visible video cards on home/search/recommendation-style pages
- bulk-lookup visible video IDs through the API
- inject confidence badges onto flagged video thumbnails

Current UI behavior:

- unknown videos show `AI Unknown` plus a working `Flag as AI` button
- known videos show confidence, score, and working vote buttons
- if the current device already voted, the matching vote button is shown as active
- visible video cards show a confidence badge and subtle state-colored highlight when the video is known
- if `debugUnknownIndicators` is enabled, unknown video cards also show an `AI Unknown` badge for DOM/debug verification
- if `blockingEnabled` is on, videos still considered AI-flagged are covered by a block overlay on cards and on the watch page
- blocked videos can be temporarily revealed with `Show anyway` for the current session
- API failures show an `AI Error` state instead of failing silently
- request feedback is shown as a temporary bottom-left toast instead of inline in the action row
- the extension generates one anonymous local device ID for one-vote-per-device enforcement

The anonymous device ID is stored locally on the browser device. Extension settings remain in sync storage.

## Load in Chromium

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose "Load unpacked"
4. Select the `client/` directory

## Log filtering

The extension now logs with a stable `[YAIB]` prefix.

To filter extension-specific logs in DevTools:

1. Open the Console tab
2. Use the filter box
3. Search for `[YAIB]`

This removes most unrelated YouTube and browser noise from the console view.

# Client

This directory will contain the Chromium browser extension for YouTube AI Blocker.

Planned responsibilities:

- Detect YouTube videos on supported pages
- Query the API for AI flags and confidence levels
- Highlight flagged videos
- Optionally block flagged videos
- Let users mark videos as AI and vote on existing flags
- Provide a settings page for extension and API configuration

## Current scaffold

- `manifest.json`: Chromium MV3 manifest
- `background/`: extension background service worker
- `common/`: shared settings and API helpers
- `content/`: content-script bootstrap for YouTube
- `popup/`: popup-based settings UI

## Current watch-page integration

The content script now:

- detects YouTube watch pages
- reads the current video ID from the URL
- fetches the current video state from the API
- injects a YouTube-like placeholder control group into the watch-page action row
- detects visible video cards on home/search/recommendation layouts
- bulk-lookups visible video IDs and decorates known videos with AI badges

Current rendering behavior:

- `unknown`: shows `AI Unknown` and a working `Flag as AI` button
- known videos: show confidence, score, and working `Upvote` / `Downvote` buttons
- if this browser device already voted on the video, the matching button renders as active
- known video cards get a confidence badge on the thumbnail plus a subtle highlight on the card shell
- request states: show temporary toast feedback while flags or votes are being submitted

The extension also generates a local anonymous device ID so one-vote-per-device enforcement works with the server API.

## Current settings UI

The popup currently supports:

- Blocking on/off
- API server URL
- Reset to default settings

Default local API URL:

- `http://127.0.0.1:3000`

Additional debug option:

- `debugUnknownIndicators`: show `AI Unknown` badges on videos with no DB record so page detection can be verified

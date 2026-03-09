# Test Catalog

## `tests/server.routes.test.js`

Purpose:
- Verifies the current Fastify route behavior for the server foundation

Coverage:
- `GET /health` returns the expected service status payload
- `GET /videos/:youtubeVideoId` returns `unknown` for videos not found in storage
- `GET /videos/:youtubeVideoId` maps stored video records into the public API response shape
- `GET /videos/:youtubeVideoId` rejects invalid YouTube video IDs with a stable `400` response
- `POST /videos/bulk-lookup` returns a mixed set of known and unknown videos in request order
- `POST /videos/bulk-lookup` validates IDs and payload shape
- Write endpoints are rate-limited
- Request sanitization trims device IDs before service use
- `POST /videos/:youtubeVideoId/flag` accepts anonymous device IDs and returns the flagged video response
- `POST /videos/:youtubeVideoId/flag` validates YouTube IDs and request payloads
- `POST /videos/:youtubeVideoId/flag` rejects duplicate device votes with `409`
- `POST /videos/:youtubeVideoId/vote` accepts `up` and `down` votes for existing flagged videos
- `POST /videos/:youtubeVideoId/vote` validates IDs and payloads
- `POST /videos/:youtubeVideoId/vote` rejects unknown videos with `404`
- `POST /videos/:youtubeVideoId/vote` rejects repeated identical votes with `409`

## `tests/confidence.test.js`

Purpose:
- Verifies the v1 confidence and status calculation logic

Coverage:
- Low confidence for net positive scores from 1 to 4
- Medium confidence for net positive scores from 5 to 14
- High confidence for net positive scores of 15 or more
- Disputed results for scores from `-5` to `0`
- Unflagged results for scores below `-5`

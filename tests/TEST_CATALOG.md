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

## `tests/docker-config.test.js`

Purpose:
- Verifies that the Compose and Docker configuration required to run the API stack exists and stays wired correctly

Coverage:
- `docker-compose.yml` defines `api`, `website`, and `postgres`
- Compose wires API startup to PostgreSQL health
- The server Dockerfile installs dependencies, generates Prisma, and starts through the container entrypoint
- The website Dockerfile serves the static landing page through Nginx and accepts build-time public link config
- The website Dockerfile accepts build-time Search Console and Umami configuration
- The root environment example includes the required deployment variables for the stack and extension packaging
- Backup and reset operational scripts exist and reference the expected Docker commands
- Make targets exist for deploy, update, stop, and start stack lifecycle operations

## `tests/client-config.test.js`

Purpose:
- Verifies that the Chromium extension foundation exists and exposes the expected popup/settings surface

Coverage:
- The manifest defines MV3 popup, background worker, content script, and storage permission
- The popup contains controls for blocking, debug unknown indicators, and API server configuration
- Shared client settings define the default API URL, normal sync settings, a debug toggle, and local anonymous device ID storage
- The content script includes watch-page action-row injection scaffolding, interactive flag/vote controls, per-device active vote state, card-level bulk lookups, blocking overlays with reveal controls, and transient toast feedback states
- The extension includes a stable `[YAIB]` logger prefix for filtering console output
- The content CSS includes dark-mode-safe variables, active vote button styling, card highlight/badge styling, blocking overlays, and toast styling for action feedback
- The repository includes Chromium and Firefox packaging scripts, build targets, and publishing docs for generating clean unpacked bundles and store upload ZIPs with deploy-time API URL, website URL, and Firefox add-on metadata injection

## `tests/security.test.js`

Purpose:
- Verifies that current injection hardening remains in place across the extension, website, and website build pipeline

Coverage:
- The extension content script avoids `innerHTML` in API-driven UI rendering paths
- The website runtime validates public URLs before applying them to links or scripts
- The website build avoids shell-based HTML substitution and uses escaped file generation instead
- Extension network entry points validate request URLs before use

## `tests/website.test.js`

Purpose:
- Verifies that the static project website exists and includes the expected public-facing content and assets

Coverage:
- The landing page includes SEO metadata, core project messaging, FAQ content, and env-configurable public link targets
- The website includes a privacy settings surface and opt-in analytics consent UI
- The website stylesheet includes themed responsive layout rules for the landing page
- The hero preview artwork fills the preview screen directly without relying on a nested frame wrapper
- The website script provides lightweight progressive enhancement for staged reveals, footer year output, public link patching from the generated config file, and Umami consent gating

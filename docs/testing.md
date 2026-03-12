# Testing

## Current approach

The project currently uses Node's built-in test runner for server tests.

This keeps the early test setup simple and avoids introducing a larger test stack before the API surface has stabilized.

## Test locations

- `tests/server.routes.test.js`: route-level tests for the current Fastify API
- `tests/confidence.test.js`: unit tests for confidence and status calculation
- `tests/docker-config.test.js`: deployment config tests for Compose and Docker
- `tests/client-config.test.js`: extension scaffold tests for manifest and popup settings
- `tests/website.test.js`: static landing page tests for public-facing content and assets
- `tests/security.test.js`: injection-hardening regression tests for client, website, and build paths

## Running tests

From the repository root:

```bash
make test-all
```

Direct execution:

```bash
node --test tests/*.test.js
```

## Design notes

- Route tests use Fastify's injection support
- Database-backed behavior is mocked through service injection
- This allows API behavior to be tested without requiring a live PostgreSQL instance
- Confidence tests enforce the current point-based flagging model, including the unflagged threshold below `-5`
- Bulk lookup tests verify that API responses preserve request order and fill unknown videos explicitly
- Rate-limit tests verify write-endpoint throttling without needing a real network server
- Website tests keep the landing page SEO metadata, GitHub link, and core messaging from silently regressing
- Client packaging tests keep the extension ZIP build workflow, deploy-time config stamping, and publishing docs from regressing
- Docker config tests also keep the Makefile stack lifecycle commands from drifting away from the intended Compose workflow
- Website tests also verify that the featured hero artwork fills the preview screen without a nested frame wrapper
- Website tests also verify that deploy-time public link config is present for store/source/release links
- Website tests also verify that Search Console placeholders and opt-in Umami consent wiring stay present
- Security tests keep URL validation, safe DOM construction, and shell-safe website build injection from regressing

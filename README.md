# YouTube AI Blocker

This repository contains the server and browser client for YouTube AI Blocker.

## Repository structure

- `server/`: Fastify API, Prisma schema, database access, and server-side logic
- `client/`: Chromium browser extension that integrates with YouTube and the API

## Local development plan

Phase 1 starts with the server.

Expected local setup flow:

1. Run PostgreSQL with Docker
2. Configure the server with environment variables
3. Install server dependencies
4. Run Prisma generate and migrations
5. Run the API locally
4. Build the browser extension after the API is stable

## Notes

- The first version uses anonymous voting
- One vote is allowed per device per video
- Videos with no record are treated as `unknown`
- Video score is point-based: upvotes add `+1`, downvotes add `-1`, and videos below `-5` become `unflagged`
- The client should default to the official API server, but allow a custom server URL

## Current repository status

- `server/` contains the initial Fastify and Prisma scaffold
- `client/` is reserved for the Chromium extension
- `docker-compose.yml` starts the local PostgreSQL instance

## Testing

- Execute all current tests with `make test-all`
- Test documentation lives in `docs/testing.md`
- The test index lives in `tests/TEST_CATALOG.md`

## Server docs

- API reference: `docs/api.md`
- Deployment notes: `docs/server-deployment.md`

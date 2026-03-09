# YouTube AI Blocker

This repository contains the server and browser client for YouTube AI Blocker.

## Repository structure

- `server/`: Fastify API, Prisma schema, database access, and server-side logic
- `client/`: Chromium browser extension that integrates with YouTube and the API

## Local development plan

Phase 1 starts with the server.

Expected local setup flow:

1. Copy `.env.example` to `.env`
2. Start the API stack with `docker compose up --build`
3. Optionally seed sample data with `docker compose exec api npm run seed`
4. Build the browser extension after the API is stable

## Notes

- The first version uses anonymous voting
- One vote is allowed per device per video
- Videos with no record are treated as `unknown`
- Video score is point-based: upvotes add `+1`, downvotes add `-1`, and videos below `-5` become `unflagged`
- The client should default to the official API server, but allow a custom server URL

## Current repository status

- `server/` contains the Fastify API, Prisma schema, and Docker image definition
- `client/` is reserved for the Chromium extension
- `docker-compose.yml` starts the full API stack

## Operations

- Clean reset: `make reset-stack`
- Manual database backup: `make backup-db`

## Testing

- Execute all current tests with `make test-all`
- Test documentation lives in `docs/testing.md`
- The test index lives in `tests/TEST_CATALOG.md`

## Server docs

- API reference: `docs/api.md`
- Deployment notes: `docs/server-deployment.md`

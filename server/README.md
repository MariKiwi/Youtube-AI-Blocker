# Server

This directory will contain the Fastify API, Prisma setup, and PostgreSQL integration for YouTube AI Blocker.

Planned responsibilities:

- Expose API endpoints for video lookup, flagging, and voting
- Store video records and votes
- Calculate AI confidence levels
- Enforce one vote per device per video as far as practical in an anonymous system

## Stack

- Fastify
- Prisma
- PostgreSQL
- Docker for local database setup

## Initial setup

Compose-first setup from the repository root:

1. Copy root `.env.example` to `.env`
2. Run `docker compose up --build`
3. Optionally seed the database with `docker compose exec api npm run seed`
4. Use `make backup-db` for manual dumps
5. Use `make reset-stack` for a clean start with an empty database

Local non-Docker server commands are still available:

```bash
cd server
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
pnpm dev
```

## Current Phase 1 foundation

- App entrypoint in `src/server.js`
- Fastify app builder in `src/app.js`
- Environment-based config in `src/config.js`
- Prisma client setup in `src/db.js`
- Health endpoint at `GET /health`
- Video lookup endpoint at `GET /videos/:youtubeVideoId`
- Bulk video lookup endpoint at `POST /videos/bulk-lookup`
- Video flag endpoint at `POST /videos/:youtubeVideoId/flag`
- Video vote endpoint at `POST /videos/:youtubeVideoId/vote`
- Prisma schema in `prisma/schema.prisma`

## Runtime configuration

- `CORS_ALLOWED_ORIGINS`: comma-separated allowed origins
- `WRITE_RATE_LIMIT_WINDOW_MS`: rate-limit window for write endpoints
- `WRITE_RATE_LIMIT_MAX_REQUESTS`: max write requests per IP and route per window

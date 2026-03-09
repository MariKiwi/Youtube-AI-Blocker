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

1. Copy `.env.example` to `.env`
2. Start PostgreSQL from the repository root with `docker compose up -d`
3. Install dependencies in `server/`
4. Run Prisma generate and migrations
5. Start the API locally

Expected commands:

```bash
cd server
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

## Current Phase 1 foundation

- App entrypoint in `src/server.js`
- Fastify app builder in `src/app.js`
- Environment-based config in `src/config.js`
- Prisma client setup in `src/db.js`
- Health endpoint at `GET /health`
- Video lookup endpoint at `GET /videos/:youtubeVideoId`
- Video flag endpoint at `POST /videos/:youtubeVideoId/flag`
- Video vote endpoint at `POST /videos/:youtubeVideoId/vote`
- Prisma schema in `prisma/schema.prisma`

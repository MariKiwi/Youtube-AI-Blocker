# Server Deployment

## Single Compose workflow

The repository now supports a single Compose-based workflow for both local startup and simple production-style deployment.

From the repository root:

1. Copy `.env.example` to `.env`
2. Run `docker compose up --build -d`
3. Optionally seed data with `docker compose exec api npm run seed`
4. Create manual backups with `make backup-db`

The `api` container:
- Builds the server image
- Waits for PostgreSQL
- Runs `prisma migrate deploy`
- Starts the Fastify server

## Production recommendation

Use:
- Environment variables for all secrets and runtime settings
- HTTPS in front of the API
- Restricted CORS origins for the production extension and website
- Persistent storage for PostgreSQL if Postgres runs in the same stack

## Production-ready Compose notes

The current Compose file is suitable for a single-host production deployment when:

- `.env` contains strong PostgreSQL credentials
- `.env` uses a production-specific `POSTGRES_VOLUME_NAME`
- The host is protected by HTTPS through a reverse proxy
- Backups are configured for the Postgres volume
- CORS is locked to the real extension and site origins

Recommended production flow:

```bash
cp .env.example .env
docker compose build
docker compose up -d
```

To update after code changes:

```bash
docker compose up --build -d
```

## Clean start

If you need a guaranteed clean database on a host, use:

```bash
make reset-stack
docker compose up --build -d
```

This removes the containers and the configured Postgres volume.

For production, use a production-specific `POSTGRES_VOLUME_NAME` in `.env` so it does not accidentally reuse a local or previous stack volume.

## Manual backups

To create a SQL backup:

```bash
make backup-db
```

Backups are written to `BACKUP_DIR`, which defaults to `./backups`.

## Current production assumptions

- PostgreSQL is the production database
- The API is stateless apart from the database
- The built-in rate limiter is suitable for a single-instance prototype, not final multi-instance production
- A stronger shared rate-limit store should be added later for scaled deployments

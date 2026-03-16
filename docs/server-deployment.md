# Server Deployment

## Single Compose workflow

The repository now supports a single Compose-based workflow for both local startup and simple production-style deployment.

From the repository root:

1. Copy `.env.example` to `.env`
2. Run `make deploy-stack`
3. Optionally seed data with `docker compose exec api npm run seed`
4. Open the website on `http://localhost:8080` unless `WEBSITE_PORT` was changed
5. Create manual backups with `make backup-db`

The `api` container:
- Builds the server image
- Waits for PostgreSQL
- Runs `prisma migrate deploy` using the committed Prisma migrations in `server/prisma/migrations/`
- Starts the Fastify server

The `website` container:
- Builds a separate static image from `website/`
- Serves the landing page through Nginx
- Is independently deployable from the API image even though both are managed by the same Compose file

## Shared deployment values

The root `.env` file is also used as the packaging source of truth for the browser extension builds.

Key values:

- `PUBLIC_WEBSITE_URL`: public website URL
- `PUBLIC_API_BASE_URL`: public API URL
- `EXTENSION_DEFAULT_API_BASE_URL`: default API URL written into packaged extensions
- `EXTENSION_VERSION`: version written into packaged extension manifests
- `EXTENSION_DEFAULT_BLOCKING_ENABLED`: default blocking setting written into packaged extensions
- `EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS`: default debug-indicator setting written into packaged extensions
- `CHROME_WEB_STORE_URL`: public Chrome listing URL used on the website
- `FIREFOX_ADDONS_URL`: public Firefox listing URL used on the website
- `GITHUB_SOURCE_URL`: public source repository URL used on the website
- `GITHUB_RELEASES_URL`: public release download URL used on the website
- `GOOGLE_SITE_VERIFICATION`: Google Search Console verification token written into the built website homepage
- `UMAMI_SCRIPT_URL`: Umami script URL for opt-in analytics
- `UMAMI_WEBSITE_ID`: Umami website ID for opt-in analytics
- `UMAMI_HOST_URL`: optional Umami host URL attribute when needed by your Umami deployment
- `UMAMI_DOMAINS`: optional Umami domains attribute for domain restriction
- `FIREFOX_ADDON_ID`: Firefox add-on ID for packaged builds

Recommended pattern:

- `PUBLIC_WEBSITE_URL` should be the public landing page domain
- `PUBLIC_API_BASE_URL` should be the public API origin the extension should call
- `EXTENSION_DEFAULT_API_BASE_URL` should usually match `PUBLIC_API_BASE_URL`
- `CORS_ALLOWED_ORIGINS` should explicitly include the website origin and any other browser origins you intend to allow

This keeps the deployed API, website, and packaged extension pointing at the same environment.

## Website analytics and verification

The website supports two deploy-time integrations:

- Google Search Console verification via `GOOGLE_SITE_VERIFICATION`
- Umami analytics via `UMAMI_*` variables

Current behavior:

- Search Console verification is written into the built homepage HTML during the website image build
- Umami is not loaded by default
- Umami is only injected after explicit visitor consent
- The site stores the consent choice in a first-party cookie so the preference can be remembered
- Visitors can reopen privacy settings from the site footer and revoke analytics later

This is a conservative implementation intended to support GDPR/DSGVO-friendly opt-in analytics. It is not legal advice, and the final legal review remains your responsibility.

## Production recommendation

Use:
- Environment variables for all secrets and runtime settings
- HTTPS in front of the API
- HTTPS in front of the website
- Restricted CORS origins for the production extension and website
- Persistent storage for PostgreSQL if Postgres runs in the same stack

## Production-ready Compose notes

The current Compose file is suitable for a single-host production deployment when:

- `.env` contains strong PostgreSQL credentials
- `.env` uses a production-specific `POSTGRES_VOLUME_NAME`
- The host is protected by HTTPS through a reverse proxy
- The website port is either published directly or placed behind the same reverse proxy
- Backups are configured for the Postgres volume
- CORS is locked to the real extension and site origins

Recommended production flow:

```bash
cp .env.example .env
make deploy-stack
```

Important migration note:

- Fresh servers depend on the committed Prisma migrations under `server/prisma/migrations/`
- If those migration files are missing from the deployed checkout, `prisma migrate deploy` will succeed without creating the tables
- In that broken state, health checks may still pass while API reads fail with Prisma `P2021` table-not-found errors

To update after code changes:

```bash
make update-stack
```

Important PostgreSQL note:

- PostgreSQL only uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` when initializing a fresh data directory
- If the named Postgres volume already exists, changing those values in `.env` will not rewrite the existing database credentials
- `make deploy-stack` now warns when the configured Postgres volume already exists
- If you intended a clean first deploy with new credentials, run `make reset-stack` before deploying
- If you need to preserve data, keep using the original credentials or restore a backup into a fresh volume

To stop the stack without removing data:

```bash
make stop-stack
```

To start a previously stopped stack again:

```bash
make start-stack
```

## Clean start

If you need a guaranteed clean database on a host, use:

```bash
make reset-stack
make deploy-stack
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


## Website routing and sitemap

The website container now generates clean folder-style routes during the image build, so public URLs can be served as `/` and `/manual-install/` instead of `index.html` and `manual-install.html`. The same build step also generates `sitemap.xml` automatically from the discovered HTML pages, using `PUBLIC_WEBSITE_URL` as the sitemap base URL.

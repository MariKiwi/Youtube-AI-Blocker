# Server Deployment

## Local development

1. Start PostgreSQL with `docker compose up -d`
2. Configure `server/.env`
3. Run migrations
4. Optionally seed the database with `pnpm seed`
5. Start the API

## Production recommendation

Use:
- A managed PostgreSQL provider
- Environment variables for all secrets and runtime settings
- HTTPS in front of the API
- Restricted CORS origins for the production extension and website

Recommended production database options:
- Railway PostgreSQL
- Neon
- Supabase Postgres
- Managed Postgres from a VPS or cloud provider

## Current production assumptions

- PostgreSQL is the production database
- The API is stateless apart from the database
- The built-in rate limiter is suitable for a single-instance prototype, not final multi-instance production
- A stronger shared rate-limit store should be added later for scaled deployments


import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

test("docker compose defines api, website, and postgres services", async () => {
  const compose = await readFile(`${root}/docker-compose.yml`, "utf8");

  assert.match(compose, /^services:\n/m);
  assert.match(compose, /^  api:\n/m);
  assert.match(compose, /^  website:\n/m);
  assert.match(compose, /^  postgres:\n/m);
  assert.match(compose, /depends_on:\n\s+postgres:\n\s+condition: service_healthy/m);
  assert.match(compose, /DATABASE_URL: postgresql:\/\//);
  assert.match(compose, /WEBSITE_PORT:-8080/);
  assert.match(compose, /PUBLIC_WEBSITE_URL: \$\{PUBLIC_WEBSITE_URL:-https:\/\/your-website\.example\}/);
  assert.match(compose, /CHROME_WEB_STORE_URL: \$\{CHROME_WEB_STORE_URL:-https:\/\/chromewebstore\.google\.com\/\}/);
  assert.match(compose, /FIREFOX_ADDONS_URL: \$\{FIREFOX_ADDONS_URL:-https:\/\/addons\.mozilla\.org\/\}/);
  assert.match(compose, /GITHUB_SOURCE_URL: \$\{GITHUB_SOURCE_URL:-https:\/\/github\.com\/MariKiwi\/Youtube-AI-Blocker\}/);
  assert.match(compose, /GITHUB_RELEASES_URL: \$\{GITHUB_RELEASES_URL:-https:\/\/github\.com\/MariKiwi\/Youtube-AI-Blocker\/releases\}/);
  assert.match(compose, /GOOGLE_SITE_VERIFICATION: \$\{GOOGLE_SITE_VERIFICATION:-\}/);
  assert.match(compose, /UMAMI_SCRIPT_URL: \$\{UMAMI_SCRIPT_URL:-\}/);
  assert.match(compose, /UMAMI_WEBSITE_ID: \$\{UMAMI_WEBSITE_ID:-\}/);
  assert.match(compose, /UMAMI_HOST_URL: \$\{UMAMI_HOST_URL:-\}/);
  assert.match(compose, /UMAMI_DOMAINS: \$\{UMAMI_DOMAINS:-\}/);
  assert.match(compose, /name: \$\{POSTGRES_VOLUME_NAME:-youtube-ai-blocker-postgres-data\}/);
});

test("server Dockerfile runs Prisma and starts the API", async () => {
  const dockerfile = await readFile(`${root}/server/Dockerfile`, "utf8");

  assert.match(dockerfile, /npm ci/);
  assert.match(dockerfile, /npx prisma generate/);
  assert.match(dockerfile, /CMD \["sh", "scripts\/container-start\.sh"\]/);
});

test("server repository includes committed Prisma migrations for deploy", async () => {
  const migrationSql = await readFile(`${root}/server/prisma/migrations/20260312235000_initial_schema/migration.sql`, "utf8");
  const migrationLock = await readFile(`${root}/server/prisma/migrations/migration_lock.toml`, "utf8");

  assert.match(migrationSql, /CREATE TABLE "videos"/);
  assert.match(migrationSql, /CREATE TABLE "votes"/);
  assert.match(migrationSql, /CREATE TYPE "VideoStatus"/);
  assert.match(migrationLock, /provider = "postgresql"/);
});

test("website Dockerfile serves the static landing page through nginx", async () => {
  const dockerfile = await readFile(`${root}/website/Dockerfile`, "utf8");
  const nginxConfig = await readFile(`${root}/website/nginx.conf`, "utf8");

  assert.match(dockerfile, /FROM node:22-alpine AS builder/);
  assert.match(dockerfile, /FROM nginx:1\.29-alpine/);
  assert.match(dockerfile, /ARG PUBLIC_WEBSITE_URL=/);
  assert.match(dockerfile, /ARG CHROME_WEB_STORE_URL=/);
  assert.match(dockerfile, /ARG FIREFOX_ADDONS_URL=/);
  assert.match(dockerfile, /ARG GITHUB_SOURCE_URL=/);
  assert.match(dockerfile, /ARG GITHUB_RELEASES_URL=/);
  assert.match(dockerfile, /ARG GOOGLE_SITE_VERIFICATION=/);
  assert.match(dockerfile, /ARG UMAMI_SCRIPT_URL=/);
  assert.match(dockerfile, /ARG UMAMI_WEBSITE_ID=/);
  assert.match(dockerfile, /ARG UMAMI_HOST_URL=/);
  assert.match(dockerfile, /ARG UMAMI_DOMAINS=/);
  assert.match(dockerfile, /WORKDIR \/app/);
  assert.match(dockerfile, /COPY \. \./);
  assert.match(dockerfile, /COPY nginx\.conf \/etc\/nginx\/conf\.d\/default\.conf/);
  assert.match(dockerfile, /COPY --from=builder \/app \/usr\/share\/nginx\/html/);
  assert.match(dockerfile, /build-public-config\.mjs/);
  assert.match(dockerfile, /inject-google-verification\.mjs/);
  assert.doesNotMatch(dockerfile, /sed -i/);
  assert.match(nginxConfig, /try_files \$uri \$uri\/ \/index\.html/);
  assert.match(nginxConfig, /expires 7d/);
});

test("compose environment example includes required deployment variables", async () => {
  const envExample = await readFile(`${root}/.env.example`, "utf8");

  assert.match(envExample, /^PUBLIC_WEBSITE_URL=/m);
  assert.match(envExample, /^PUBLIC_API_BASE_URL=/m);
  assert.match(envExample, /^EXTENSION_DEFAULT_API_BASE_URL=/m);
  assert.match(envExample, /^CHROME_WEB_STORE_URL=/m);
  assert.match(envExample, /^FIREFOX_ADDONS_URL=/m);
  assert.match(envExample, /^GITHUB_SOURCE_URL=/m);
  assert.match(envExample, /^GITHUB_RELEASES_URL=/m);
  assert.match(envExample, /^GOOGLE_SITE_VERIFICATION=/m);
  assert.match(envExample, /^UMAMI_SCRIPT_URL=/m);
  assert.match(envExample, /^UMAMI_WEBSITE_ID=/m);
  assert.match(envExample, /^UMAMI_HOST_URL=/m);
  assert.match(envExample, /^UMAMI_DOMAINS=/m);
  assert.match(envExample, /^FIREFOX_ADDON_ID=/m);
  assert.match(envExample, /^FIREFOX_MIN_VERSION=/m);
  assert.match(envExample, /^API_PORT=/m);
  assert.match(envExample, /^WEBSITE_IMAGE_NAME=/m);
  assert.match(envExample, /^WEBSITE_IMAGE_TAG=/m);
  assert.match(envExample, /^WEBSITE_PORT=/m);
  assert.match(envExample, /^POSTGRES_DB=/m);
  assert.match(envExample, /^POSTGRES_USER=/m);
  assert.match(envExample, /^POSTGRES_PASSWORD=/m);
  assert.match(envExample, /^POSTGRES_VOLUME_NAME=/m);
  assert.match(envExample, /^BACKUP_DIR=/m);
  assert.match(envExample, /^CORS_ALLOWED_ORIGINS=/m);
});

test("backup and reset scripts exist for operations", async () => {
  const backupScript = await readFile(`${root}/scripts/backup-db.sh`, "utf8");
  const deployScript = await readFile(`${root}/scripts/deploy-stack.sh`, "utf8");
  const resetScript = await readFile(`${root}/scripts/reset-stack.sh`, "utf8");
  const makefile = await readFile(`${root}/Makefile`, "utf8");

  assert.match(backupScript, /pg_dump/);
  assert.match(backupScript, /BACKUP_DIR/);
  assert.match(deployScript, /docker volume inspect/);
  assert.match(deployScript, /Existing Postgres volume detected/);
  assert.match(deployScript, /docker compose up --build -d/);
  assert.match(resetScript, /docker compose down -v --remove-orphans/);
  assert.match(makefile, /^deploy-stack:\n\tsh \.\/scripts\/deploy-stack\.sh/m);
  assert.match(makefile, /^update-stack:\n\tdocker compose up --build -d/m);
  assert.match(makefile, /^stop-stack:\n\tdocker compose stop/m);
  assert.match(makefile, /^start-stack:\n\tdocker compose start/m);
});

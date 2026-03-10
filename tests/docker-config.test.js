import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("docker compose defines api, website, and postgres services", async () => {
  const compose = await readFile(`${root}/docker-compose.yml`, "utf8");

  assert.match(compose, /^services:\n/m);
  assert.match(compose, /^  api:\n/m);
  assert.match(compose, /^  website:\n/m);
  assert.match(compose, /^  postgres:\n/m);
  assert.match(compose, /depends_on:\n\s+postgres:\n\s+condition: service_healthy/m);
  assert.match(compose, /DATABASE_URL: postgresql:\/\//);
  assert.match(compose, /WEBSITE_PORT:-8080/);
  assert.match(compose, /name: \$\{POSTGRES_VOLUME_NAME:-youtube-ai-blocker-postgres-data\}/);
});

test("server Dockerfile runs Prisma and starts the API", async () => {
  const dockerfile = await readFile(`${root}/server/Dockerfile`, "utf8");

  assert.match(dockerfile, /npm ci/);
  assert.match(dockerfile, /npx prisma generate/);
  assert.match(dockerfile, /CMD \["sh", "scripts\/container-start\.sh"\]/);
});

test("website Dockerfile serves the static landing page through nginx", async () => {
  const dockerfile = await readFile(`${root}/website/Dockerfile`, "utf8");
  const nginxConfig = await readFile(`${root}/website/nginx.conf`, "utf8");

  assert.match(dockerfile, /FROM nginx:1\.29-alpine/);
  assert.match(dockerfile, /COPY nginx\.conf \/etc\/nginx\/conf\.d\/default\.conf/);
  assert.match(dockerfile, /COPY \. \/usr\/share\/nginx\/html/);
  assert.match(nginxConfig, /try_files \$uri \$uri\/ \/index\.html/);
  assert.match(nginxConfig, /expires 7d/);
});

test("compose environment example includes required deployment variables", async () => {
  const envExample = await readFile(`${root}/.env.example`, "utf8");

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
  const resetScript = await readFile(`${root}/scripts/reset-stack.sh`, "utf8");
  const makefile = await readFile(`${root}/Makefile`, "utf8");

  assert.match(backupScript, /pg_dump/);
  assert.match(backupScript, /BACKUP_DIR/);
  assert.match(resetScript, /docker compose down -v --remove-orphans/);
  assert.match(makefile, /^deploy-stack:\n\tdocker compose up --build -d/m);
  assert.match(makefile, /^update-stack:\n\tdocker compose up --build -d/m);
  assert.match(makefile, /^stop-stack:\n\tdocker compose stop/m);
  assert.match(makefile, /^start-stack:\n\tdocker compose start/m);
});

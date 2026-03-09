import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("docker compose defines api and postgres services", async () => {
  const compose = await readFile(`${root}/docker-compose.yml`, "utf8");

  assert.match(compose, /^services:\n/m);
  assert.match(compose, /^  api:\n/m);
  assert.match(compose, /^  postgres:\n/m);
  assert.match(compose, /depends_on:\n\s+postgres:\n\s+condition: service_healthy/m);
  assert.match(compose, /DATABASE_URL: postgresql:\/\//);
  assert.match(compose, /name: \$\{POSTGRES_VOLUME_NAME:-youtube-ai-blocker-postgres-data\}/);
});

test("server Dockerfile runs Prisma and starts the API", async () => {
  const dockerfile = await readFile(`${root}/server/Dockerfile`, "utf8");

  assert.match(dockerfile, /npm ci/);
  assert.match(dockerfile, /npx prisma generate/);
  assert.match(dockerfile, /CMD \["sh", "scripts\/container-start\.sh"\]/);
});

test("compose environment example includes required deployment variables", async () => {
  const envExample = await readFile(`${root}/.env.example`, "utf8");

  assert.match(envExample, /^API_PORT=/m);
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

  assert.match(backupScript, /pg_dump/);
  assert.match(backupScript, /BACKUP_DIR/);
  assert.match(resetScript, /docker compose down -v --remove-orphans/);
});

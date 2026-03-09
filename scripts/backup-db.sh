#!/bin/sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/postgres-${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-youtube_ai_blocker}" \
  -d "${POSTGRES_DB:-youtube_ai_blocker}" \
  > "${BACKUP_FILE}"

echo "Database backup written to ${BACKUP_FILE}"


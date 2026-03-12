#!/bin/sh
set -eu

POSTGRES_VOLUME_NAME="${POSTGRES_VOLUME_NAME:-youtube-ai-blocker-postgres-data}"

if docker volume inspect "${POSTGRES_VOLUME_NAME}" >/dev/null 2>&1; then
  echo "Existing Postgres volume detected: ${POSTGRES_VOLUME_NAME}"
  echo "If POSTGRES_DB, POSTGRES_USER, or POSTGRES_PASSWORD changed since the volume was created, PostgreSQL will keep the old credentials."
  echo "If this should be a clean first deploy, run 'make reset-stack' first. Otherwise keep using the original database credentials."
fi

docker compose up --build -d

#!/bin/sh
set -eu

attempt=1
max_attempts=20

while true; do
  set +e
  output="$(npx prisma migrate deploy 2>&1)"
  status=$?
  set -e

  if [ "$status" -eq 0 ]; then
    break
  fi

  echo "$output"

  if printf '%s' "$output" | grep -q 'P1000'; then
    echo 'Prisma could reach PostgreSQL, but authentication failed.'
    echo 'This usually means POSTGRES_USER or POSTGRES_PASSWORD changed while reusing an existing Postgres volume.'
    echo "If this is meant to be a clean first deploy, run 'make reset-stack' and deploy again."
    echo 'If you need to keep existing data, restore the original database credentials or restore from a backup into a fresh volume.'
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Prisma migrations failed after ${max_attempts} attempts"
    exit 1
  fi

  echo "Waiting for database before retrying migrations (${attempt}/${max_attempts})"
  attempt=$((attempt + 1))
  sleep 3
done

exec node src/server.js

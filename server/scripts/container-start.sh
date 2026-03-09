#!/bin/sh
set -eu

attempt=1
max_attempts=20

until npx prisma migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Prisma migrations failed after ${max_attempts} attempts"
    exit 1
  fi

  echo "Waiting for database before retrying migrations (${attempt}/${max_attempts})"
  attempt=$((attempt + 1))
  sleep 3
done

exec node src/server.js


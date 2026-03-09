#!/bin/sh
set -eu

echo "Stopping containers and removing volumes for a clean start..."
docker compose down -v --remove-orphans
echo "Stack reset complete. The next 'docker compose up --build -d' will start with a clean database."


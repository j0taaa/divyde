#!/bin/sh
set -e

echo "Starting entrypoint..."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "WARNING: DATABASE_URL is not set. Skipping Prisma db push."
  exec "$@"
fi

if [ "${SKIP_DB_PUSH:-}" = "1" ] || [ "${SKIP_DB_PUSH:-}" = "true" ]; then
  echo "Skipping Prisma db push (SKIP_DB_PUSH=${SKIP_DB_PUSH})."
  exec "$@"
fi

MAX_RETRIES="${PRISMA_DB_PUSH_MAX_RETRIES:-30}"
SLEEP_SECONDS="${PRISMA_DB_PUSH_RETRY_DELAY_SECONDS:-2}"

echo "Running 'prisma db push --skip-generate' (up to ${MAX_RETRIES} retries)..."
i=1
while [ "$i" -le "$MAX_RETRIES" ]; do
  if npx prisma db push --skip-generate; then
    echo "Prisma db push succeeded."
    break
  fi
  echo "Prisma db push failed (attempt ${i}/${MAX_RETRIES}). Retrying in ${SLEEP_SECONDS}s..."
  i=$((i + 1))
  sleep "$SLEEP_SECONDS"
done

if [ "$i" -gt "$MAX_RETRIES" ]; then
  echo "ERROR: Prisma db push failed after ${MAX_RETRIES} attempts."
  exit 1
fi

echo "Starting application..."
exec "$@"
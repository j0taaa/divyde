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
DB_PUSH_FLAGS="${PRISMA_DB_PUSH_FLAGS:-}"

# Some Prisma versions/docs mention flags that are NOT valid for `prisma db push`
# (e.g. `--skip-generate`). If those leak into PRISMA_DB_PUSH_FLAGS, Prisma will
# exit immediately and the app will never start (often surfacing as Traefik 502s).
case " ${DB_PUSH_FLAGS} " in
  *" --skip-generate "*)
    echo "WARNING: PRISMA_DB_PUSH_FLAGS contains '--skip-generate', which is not supported by 'prisma db push'. Ignoring it."
    ;;
esac
# Strip unsupported flags (keep it POSIX-sh compatible)
DB_PUSH_FLAGS="$(printf '%s' "$DB_PUSH_FLAGS" | sed -E 's/(^|[[:space:]])--skip-generate([[:space:]]|$)/ /g; s/[[:space:]]+/ /g; s/^ //; s/ $//')"

echo "Running 'prisma db push ${DB_PUSH_FLAGS}' (up to ${MAX_RETRIES} retries)..."
i=1
while [ "$i" -le "$MAX_RETRIES" ]; do
  # shellcheck disable=SC2086
  if npx prisma db push ${DB_PUSH_FLAGS}; then
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
#!/bin/sh
set -e

echo "🔄 Starting entrypoint script..."

# Extract host and port from DATABASE_URL if not explicitly set
if [ -z "$DATABASE_HOST" ] && [ -n "$DATABASE_URL" ]; then
  DATABASE_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/?]*\).*|\1|p')
  echo "📝 Extracted DATABASE_HOST from URL: $DATABASE_HOST"
fi

if [ -z "$DATABASE_PORT" ] && [ -n "$DATABASE_URL" ]; then
  DATABASE_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\)/.*|\1|p')
  echo "📝 Extracted DATABASE_PORT from URL: $DATABASE_PORT"
fi

DATABASE_HOST=${DATABASE_HOST:-db}
DATABASE_PORT=${DATABASE_PORT:-5432}

echo "🔄 Waiting for database at ${DATABASE_HOST}:${DATABASE_PORT}..."

# Wait for PostgreSQL to be ready
until nc -z "$DATABASE_HOST" "$DATABASE_PORT" 2>/dev/null; do
  echo "⏳ Waiting for PostgreSQL at ${DATABASE_HOST}:${DATABASE_PORT}..."
  sleep 2
done

echo "✅ Database is ready!"

# Run Prisma db push to ensure schema is in sync
echo "🔄 Syncing database schema..."
# Use node directly since node_modules/.bin may not be available in production image
node ./node_modules/prisma/build/index.js db push --skip-generate

echo "✅ Database schema is in sync!"

# Execute the main command
echo "🚀 Starting application..."
exec "$@"
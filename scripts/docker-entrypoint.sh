#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."

# Wait for PostgreSQL to be ready
until nc -z ${DATABASE_HOST:-db} ${DATABASE_PORT:-5432}; do
  echo "⏳ Waiting for PostgreSQL at ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}..."
  sleep 2
done

echo "✅ Database is ready!"

# Run Prisma db push to ensure schema is in sync
echo "🔄 Syncing database schema..."
npx prisma db push

echo "✅ Database schema is in sync!"

# Execute the main command
exec "$@"


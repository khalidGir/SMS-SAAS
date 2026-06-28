#!/bin/sh
set -e

echo "⏳ Running Prisma migrations..."
npx prisma migrate deploy

if [ "$PRISMA_SEED" = "true" ]; then
  echo "🌱 Seeding database..."
  node prisma/seed.mjs
fi

echo "🚀 Starting application..."
exec "$@"

#!/bin/sh
set -e

npx prisma generate

attempt=1
until npx prisma migrate deploy; do
  if [ "$attempt" -ge 30 ]; then
    echo "Database migration failed after $attempt attempts."
    exit 1
  fi
  echo "Waiting for database... attempt $attempt"
  attempt=$((attempt + 1))
  sleep 2
done

if [ "$RUN_SEED" = "true" ]; then
  npm run db:seed
fi

node dist/main.js

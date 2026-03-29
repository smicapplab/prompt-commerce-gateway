#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Prompt Commerce Gateway — Database Reset Utility
#
# This script:
#   1. Detects if the database is local (Docker) or remote (Supabase)
#   2. Ensures dependencies and Prisma client are up-to-date
#   3. Drops all tables and recreates the schema
#   4. Applications all migrations
#   5. Reruns the database seed (prisma/seed.ts)
#   6. Verifies the reset was successful
#
# Usage: ./scripts/reset-db.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

# ANSI colours
G='\033[0;32m'
Y='\033[0;33m'
R='\033[0;31m'
B='\033[0;34m'
N='\033[0m'

echo ""
echo "  Prompt Commerce Gateway — Database Reset"
echo "  ─────────────────────────────────────────"
echo ""

# ── 1. Load & Export Environment ──────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo -e "${R}[error] .env not found.${N}"
  exit 1
fi

# Export all variables from .env so they are available to sub-processes
set -a
source .env
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${R}[error] DATABASE_URL not found in .env${N}"
  exit 1
fi

# ── 2. Prerequisites ──────────────────────────────────────────────────────────
echo -e "  ${B}▶ Checking dependencies...${N}"
if [ ! -d "node_modules" ]; then
  echo -e "    node_modules not found, installing..."
  npm install
fi

echo -e "  ${B}▶ Generating Prisma client...${N}"
npx prisma generate

# ── 3. Detect Environment ─────────────────────────────────────────────────────
IS_LOCAL=false
if echo "$DATABASE_URL" | grep -qE "(localhost|127\.0\.0\.1)"; then
  IS_LOCAL=true
fi

if $IS_LOCAL; then
  echo -e "\n  Detected Environment: ${G}Local (Docker)${N}"
  
  # Ensure Docker Postgres is running
  if ! docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo -e "  Starting Docker Postgres..."
    docker compose up postgres -d
    
    echo -e "  Waiting for Postgres to be ready..."
    for i in $(seq 1 30); do
      if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
  fi
else
  echo -e "\n  Detected Environment: ${R}Remote (Supabase/Test)${N}"
  echo -e "  ${R}WARNING: This will DESTROY all data in the remote database!${N}"
  echo ""
  read -p "  Are you absolutely sure you want to proceed? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "  Reset cancelled."
      exit 0
  fi
fi

# ── 4. Execute Reset ──────────────────────────────────────────────────────────
echo -e "\n  ${B}▶ Resetting database schema...${N}"
npx prisma migrate reset --force

# Just in case migrate reset skipped seeding (e.g. if it errored partway)
# we explicitly run the seed command.
echo -e "\n  ${B}▶ Ensuring database is seeded...${N}"
npm run db:seed

# ── 5. Verification ───────────────────────────────────────────────────────────
echo -e "\n  ${B}▶ Verifying Admin User...${N}"
# Simple check to see if we can query the admin user
if npx ts-node -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.adminUser.count().then(c => { console.log('count=' + c); process.exit(c > 0 ? 0 : 1); }).catch(() => process.exit(1))" | grep -q "count=[1-9]"; then
  echo -e "  ${G}✔ Admin user found in database.${N}"
else
  echo -e "  ${R}✘ Admin user NOT found! Seeding may have failed.${N}"
  exit 1
fi

echo -e "\n  ${G}✔ Database reset and verified successfully!${N}"
echo ""

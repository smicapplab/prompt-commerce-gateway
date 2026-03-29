#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Prompt Commerce Gateway — Database Reset Utility
#
# This script:
#   1. Detects if the database is local (Docker) or remote (Supabase)
2.  #   2. Drops all tables and recreates the schema
3.  #   3. Applications all migrations
4.  #   4. Reruns the database seed (prisma/seed.ts)
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

# ── 1. Load Environment ───────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo -e "${R}[error] .env not found.${N}"
  exit 1
fi

# Use grep to find URLs (sourcing is risky for complex Postgres strings)
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d= -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
  echo -e "${R}[error] DATABASE_URL not found in .env${N}"
  exit 1
fi

# ── 2. Detect Environment ─────────────────────────────────────────────────────
IS_LOCAL=false
if echo "$DATABASE_URL" | grep -qE "(localhost|127\.0\.0\.1)"; then
  IS_LOCAL=true
fi

if $IS_LOCAL; then
  echo -e "  Detected Environment: ${G}Local (Docker)${N}"
  
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
  echo -e "  Detected Environment: ${R}Remote (Supabase/Prod)${N}"
  echo -e "  ${R}WARNING: This will DESTROY all data in the remote database!${N}"
  echo ""
  read -p "  Are you absolutely sure you want to proceed? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "  Reset cancelled."
      exit 0
  fi
fi

# ── 3. Execute Reset ──────────────────────────────────────────────────────────
echo -e "\n  ${B}▶ Resetting database...${N}"
npx prisma migrate reset --force

echo -e "\n  ${G}✔ Database reset and seeded successfully!${N}"
echo ""

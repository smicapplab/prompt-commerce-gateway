#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Prompt Commerce Gateway — Dev Launcher
#
# For first-time setup run:
#   Local (Docker):  ./setup-local.sh
#   Supabase:        ./setup-supabase.sh
#
# This script is for daily dev use. It:
#   1. Ensures .env exists
#   2. Ensures node_modules exist
#   3. Starts Postgres in Docker (if DATABASE_URL points to localhost)
#   4. Generates Prisma client (fast if already generated)
#   5. Applies pending migrations (prisma migrate deploy)
#   6. Starts the NestJS dev server on port 3002
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# ANSI colours
Y='\033[0;33m'  # yellow
G='\033[0;32m'  # green
R='\033[0;31m'  # red
N='\033[0m'     # reset

PREFIX_GW="${Y}[gateway-api] ${N}"
PREFIX_UI="${G}[gateway-ui]  ${N}"

pids=()

cleanup() {
  echo ""
  echo "Stopping gateway services…"
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo "Done."
}
trap cleanup EXIT INT TERM

run_with_prefix() {
  local prefix="$1"
  shift
  "$@" 2>&1 | while IFS= read -r line; do
    echo -e "${prefix}${line}"
  done &
  pids+=($!)
}

echo ""
echo "  Prompt Commerce Gateway — Dev Launcher"
echo "  ───────────────────────────────────────"
echo ""

# ── Pre-flight: .env ──────────────────────────────────────────────────────────
if [ ! -f "$DIR/.env" ]; then
  echo -e "${R}[error] .env not found.${N}"
  echo "  Run ./setup-local.sh (Docker) or ./setup-supabase.sh first."
  exit 1
fi

# Load DATABASE_URL to decide if we need Docker
set -a; source "$DIR/.env"; set +a

# Backfill DIRECT_DATABASE_URL if missing (older .env)
if ! grep -q "^DIRECT_DATABASE_URL=" "$DIR/.env"; then
  echo "DIRECT_DATABASE_URL=${DATABASE_URL}" >> "$DIR/.env"
  echo -e "${Y}[gateway] Added DIRECT_DATABASE_URL to .env${N}"
  export DIRECT_DATABASE_URL="${DATABASE_URL}"
fi

# ── Pre-flight: Clear Port 3002 ───────────────────────────────────────────────
echo -e "${PREFIX_GW}Checking port 3002…"
PIDS=$(lsof -ti :3002 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo -e "${Y}[gateway] Stopping existing process on port 3002 (PID $PIDS)…${N}"
  echo "$PIDS" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# ── npm install ───────────────────────────────────────────────────────────────
if [ ! -d "$DIR/node_modules" ]; then
  echo -e "${PREFIX_GW}Installing dependencies…"
  npm install 2>&1 | sed "s/^/$(echo -e "$PREFIX_GW")/"
fi

# ── Docker Postgres (only for local DATABASE_URL) ─────────────────────────────
IS_LOCAL=false
if echo "${DATABASE_URL:-}" | grep -qE "(localhost|127\.0\.0\.1)"; then
  IS_LOCAL=true
fi

if $IS_LOCAL; then
  echo -e "${PREFIX_GW}Starting Docker Postgres…"
  docker compose up postgres -d 2>&1 | sed "s/^/$(echo -e "$PREFIX_GW")/"

  echo -e "${PREFIX_GW}Waiting for Postgres to be ready…"
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
      echo -e "${G}[gateway] Postgres ready (${i}s)${N}"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo -e "${R}[gateway] Postgres not ready after 30s — check: docker compose logs postgres${N}"
      exit 1
    fi
    sleep 1
  done
else
  echo -e "${PREFIX_GW}Using remote DATABASE_URL (skipping Docker)"
fi

# ── Frontend Setup ────────────────────────────────────────────────────────────
if [ ! -d "$DIR/frontend/node_modules" ]; then
  echo -e "${PREFIX_UI}Installing frontend dependencies…"
  cd "$DIR/frontend" && npm install 2>&1 | sed "s/^/$(echo -e "$PREFIX_UI")/"
  cd "$DIR"
fi

# ── Prisma generate ───────────────────────────────────────────────────────────
echo -e "${PREFIX_GW}Generating Prisma client…"
npx prisma generate 2>&1 | sed "s/^/$(echo -e "$PREFIX_GW")/"

# ── Apply pending migrations ──────────────────────────────────────────────────
echo -e "${PREFIX_GW}Applying pending migrations…"
npx prisma migrate deploy 2>&1 | sed "s/^/$(echo -e "$PREFIX_GW")/" || true

# ── Start the servers ─────────────────────────────────────────────────────────
echo -e "${PREFIX_GW}Starting Gateway API…"
run_with_prefix "$PREFIX_GW" bash -c "npm run dev"

echo -e "${PREFIX_UI}Starting Gateway UI…"
run_with_prefix "$PREFIX_UI" bash -c "cd frontend && npm run dev"

echo ""
echo -e "  ${Y}Gateway API${N}   → http://localhost:${GATEWAY_PORT:-3002}"
echo -e "  ${G}Gateway UI${N}    → http://localhost:5173"
echo -e "  ${Y}MCP SSE hub${N}  → http://localhost:${GATEWAY_PORT:-3002}/sse"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

wait

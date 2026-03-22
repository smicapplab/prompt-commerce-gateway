#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Prompt Commerce Gateway — Local Setup (Docker Postgres)
#
# Runs once to bootstrap your local dev environment:
#   1. Ensures .env exists (copies from .env if not present)
#   2. Installs npm dependencies
#   3. Starts PostgreSQL in Docker
#   4. Waits for the DB to be healthy
#   5. Generates the Prisma client
#   6. Creates + applies all migrations  (prisma migrate dev)
#   7. Seeds the default admin user
#
# After setup, run `./dev.sh` to start the server.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

G='\033[0;32m'  # green
Y='\033[0;33m'  # yellow
R='\033[0;31m'  # red
B='\033[0;34m'  # blue
N='\033[0m'     # reset

step() { echo -e "\n${B}▶  $1${N}"; }
ok()   { echo -e "${G}✔  $1${N}"; }
warn() { echo -e "${Y}⚠  $1${N}"; }
fail() { echo -e "${R}✖  $1${N}"; exit 1; }

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  Prompt Commerce Gateway — Local Setup   ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# ── 1. Environment file ───────────────────────────────────────────────────────
step "Environment file"
if [ ! -f "$DIR/.env" ]; then
  warn ".env not found — creating from defaults"
  cat > "$DIR/.env" <<'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pc_gateway
DIRECT_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pc_gateway
GATEWAY_PORT=3002
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=1d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
UPLOAD_DIR=./uploads
EOF
  ok ".env created with local defaults"
else
  ok ".env already exists"
fi

# Ensure DIRECT_DATABASE_URL is set (backfill for older .env files)
if ! grep -q "DIRECT_DATABASE_URL" "$DIR/.env"; then
  DB_URL=$(grep "^DATABASE_URL=" "$DIR/.env" | cut -d= -f2-)
  echo "" >> "$DIR/.env"
  echo "# Added by setup-local.sh" >> "$DIR/.env"
  echo "DIRECT_DATABASE_URL=$DB_URL" >> "$DIR/.env"
  warn "Added DIRECT_DATABASE_URL=$DB_URL to .env"
fi

# ── 2. npm install ────────────────────────────────────────────────────────────
step "npm dependencies"
if [ ! -d "$DIR/node_modules" ]; then
  npm install
  ok "Dependencies installed"
else
  ok "node_modules already present (run 'npm install' to update)"
fi

# ── 3. Docker Postgres ────────────────────────────────────────────────────────
step "Docker Postgres"
if ! command -v docker &>/dev/null; then
  fail "Docker is not installed. Please install Docker Desktop and try again."
fi

docker compose up postgres -d
ok "Postgres container started"

# ── 4. Wait for healthy ───────────────────────────────────────────────────────
step "Waiting for Postgres to be ready"
RETRIES=30
for i in $(seq 1 $RETRIES); do
  if docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    ok "Postgres is ready (attempt $i)"
    break
  fi
  if [ "$i" -eq "$RETRIES" ]; then
    fail "Postgres did not become healthy after ${RETRIES}s. Check: docker compose logs postgres"
  fi
  echo -n "."
  sleep 1
done

# ── 5. Prisma generate ────────────────────────────────────────────────────────
step "Generating Prisma client"
npx prisma generate
ok "Prisma client generated"

# ── 6. Migrate ────────────────────────────────────────────────────────────────
step "Running migrations (prisma migrate dev)"
echo "  This creates migration files under prisma/migrations/ and applies them."
echo "  If you see a prompt for a migration name, type one (e.g. 'init')."
echo ""
npx prisma migrate dev
ok "Migrations applied"

# ── 7. Seed ───────────────────────────────────────────────────────────────────
step "Seeding database"
npx ts-node prisma/seed.ts
ok "Seed complete"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${G}╔══════════════════════════════════════════╗${N}"
echo -e "  ${G}║  Local setup complete!                   ║${N}"
echo -e "  ${G}╠══════════════════════════════════════════╣${N}"
echo -e "  ${G}║  Next step:  ./dev.sh                    ║${N}"
echo -e "  ${G}║  Admin:      http://localhost:3002        ║${N}"
echo -e "  ${G}╚══════════════════════════════════════════╝${N}"
echo ""

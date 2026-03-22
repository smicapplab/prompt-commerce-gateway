#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Prompt Commerce Gateway — Supabase Setup
#
# Runs once to bootstrap the gateway against a Supabase PostgreSQL instance:
#   1. Guides you through setting DATABASE_URL and DIRECT_DATABASE_URL
#   2. Installs npm dependencies
#   3. Generates the Prisma client
#   4. Applies all pending migrations (prisma migrate deploy — no new files)
#   5. Seeds the default admin user
#
# Supabase connection strings:
#   DATABASE_URL      → Transaction pooler  (port 6543)  — used at runtime
#   DIRECT_DATABASE_URL → Direct connection (port 5432)  — used for migrations
#
# Find both URLs in: Supabase Dashboard → Settings → Database → Connection string
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

G='\033[0;32m'
Y='\033[0;33m'
R='\033[0;31m'
B='\033[0;34m'
N='\033[0m'

step() { echo -e "\n${B}▶  $1${N}"; }
ok()   { echo -e "${G}✔  $1${N}"; }
warn() { echo -e "${Y}⚠  $1${N}"; }
fail() { echo -e "${R}✖  $1${N}"; exit 1; }

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  Prompt Commerce Gateway — Supabase      ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  You will need two connection strings from the Supabase dashboard:"
echo "  Dashboard → Settings → Database → Connection string"
echo ""
echo "  • DATABASE_URL     = 'Transaction' mode (port 6543)"
echo "  • DIRECT_DATABASE_URL = 'Session' mode (port 5432)"
echo ""

# ── 1. Environment file ───────────────────────────────────────────────────────
step "Environment file"

ENV_FILE="$DIR/.env"

if [ -f "$ENV_FILE" ]; then
  echo -e "${Y}  An .env file already exists. Options:${N}"
  echo "  [1] Update DATABASE_URL and DIRECT_DATABASE_URL in the existing .env"
  echo "  [2] Leave .env as-is (use existing values)"
  read -rp "  Choice [1/2]: " CHOICE
else
  CHOICE="1"
  warn ".env not found — will create it"
fi

if [ "$CHOICE" = "1" ]; then
  echo ""
  echo -e "  ${Y}Paste your Supabase URLs below (or press Enter to keep existing value):${N}"
  echo ""

  # DATABASE_URL
  CURRENT_DB_URL=""
  [ -f "$ENV_FILE" ] && CURRENT_DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || echo "")
  echo -e "  ${B}Transaction pooler URL${N} (port 6543, used at runtime)"
  echo -e "  Example: postgresql://postgres.xxxx:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
  [ -n "$CURRENT_DB_URL" ] && echo -e "  Current:  $CURRENT_DB_URL"
  read -rp "  DATABASE_URL: " NEW_DB_URL
  DB_URL="${NEW_DB_URL:-$CURRENT_DB_URL}"
  [ -z "$DB_URL" ] && fail "DATABASE_URL is required."

  # DIRECT_DATABASE_URL
  CURRENT_DIRECT_URL=""
  [ -f "$ENV_FILE" ] && CURRENT_DIRECT_URL=$(grep "^DIRECT_DATABASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || echo "")
  echo ""
  echo -e "  ${B}Direct connection URL${N} (port 5432, used for migrations)"
  echo -e "  Example: postgresql://postgres:pass@db.xxxx.supabase.co:5432/postgres"
  [ -n "$CURRENT_DIRECT_URL" ] && echo -e "  Current:  $CURRENT_DIRECT_URL"
  read -rp "  DIRECT_DATABASE_URL: " NEW_DIRECT_URL
  DIRECT_URL="${NEW_DIRECT_URL:-$CURRENT_DIRECT_URL}"
  [ -z "$DIRECT_URL" ] && fail "DIRECT_DATABASE_URL is required."

  # Write / update .env
  if [ ! -f "$ENV_FILE" ]; then
    # Create fresh .env from supabase example
    if [ -f "$DIR/.env.supabase.example" ]; then
      cp "$DIR/.env.supabase.example" "$ENV_FILE"
      warn "Created .env from .env.supabase.example — review and update JWT_SECRET and ADMIN_PASSWORD!"
    else
      cat > "$ENV_FILE" <<EOF
GATEWAY_PORT=3002
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
UPLOAD_DIR=./uploads
EOF
    fi
  fi

  # Update or insert DATABASE_URL
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # Use a temp file to avoid sed -i issues across platforms
    TMP=$(mktemp)
    grep -v "^DATABASE_URL=" "$ENV_FILE" > "$TMP"
    echo "DATABASE_URL=$DB_URL" >> "$TMP"
    mv "$TMP" "$ENV_FILE"
  else
    echo "DATABASE_URL=$DB_URL" >> "$ENV_FILE"
  fi

  # Update or insert DIRECT_DATABASE_URL
  if grep -q "^DIRECT_DATABASE_URL=" "$ENV_FILE"; then
    TMP=$(mktemp)
    grep -v "^DIRECT_DATABASE_URL=" "$ENV_FILE" > "$TMP"
    echo "DIRECT_DATABASE_URL=$DIRECT_URL" >> "$TMP"
    mv "$TMP" "$ENV_FILE"
  else
    echo "DIRECT_DATABASE_URL=$DIRECT_URL" >> "$ENV_FILE"
  fi

  ok ".env updated"
else
  ok "Using existing .env values"
fi

# Validate the URLs are set
source "$ENV_FILE" 2>/dev/null || true
[ -z "${DATABASE_URL:-}" ] && fail "DATABASE_URL is not set in .env"
[ -z "${DIRECT_DATABASE_URL:-}" ] && fail "DIRECT_DATABASE_URL is not set in .env"

# ── 2. npm install ────────────────────────────────────────────────────────────
step "npm dependencies"
if [ ! -d "$DIR/node_modules" ]; then
  npm install
  ok "Dependencies installed"
else
  ok "node_modules already present"
fi

# ── 3. Prisma generate ────────────────────────────────────────────────────────
step "Generating Prisma client"
npx prisma generate
ok "Prisma client generated"

# ── 4. Deploy migrations ──────────────────────────────────────────────────────
step "Applying migrations to Supabase (prisma migrate deploy)"
echo "  This applies all migrations from prisma/migrations/ — no new files created."
npx prisma migrate deploy
ok "Migrations deployed"

# ── 5. Seed ───────────────────────────────────────────────────────────────────
step "Seeding database"
npx ts-node prisma/seed.ts
ok "Seed complete"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${G}╔═══════════════════════════════════════════════╗${N}"
echo -e "  ${G}║  Supabase setup complete!                     ║${N}"
echo -e "  ${G}╠═══════════════════════════════════════════════╣${N}"
echo -e "  ${G}║  Next step: npm run start  (or pm2)           ║${N}"
echo -e "  ${G}╚═══════════════════════════════════════════════╝${N}"
echo ""
echo -e "  ${Y}⚠  Security reminder:${N}"
echo "     • Set a strong JWT_SECRET in .env"
echo "     • Change the default ADMIN_PASSWORD"
echo ""

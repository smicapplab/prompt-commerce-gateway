#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Prompt Commerce Gateway — Production Deployment Script (EC2 / PM2)
#
# Prerequisites on the EC2 instance:
#   • Node 20+   (nvm recommended)
#   • npm        (bundled with Node)
#   • PM2        (npm install -g pm2)
#   • .env       populated with DATABASE_URL, DIRECT_DATABASE_URL, JWT_SECRET,
#                ADMIN_USERNAME, ADMIN_PASSWORD, UPLOAD_DIR, PORT, etc.
#                Run setup-supabase.sh once to create/populate it.
#
# Usage:
#   chmod +x run.sh
#   ./run.sh
#
# On first deploy PM2 will start the app.  Subsequent runs do a zero-downtime
# reload.  After the first successful run, persist the process list with:
#   pm2 save && pm2 startup
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ANSI colour codes
G='\033[0;32m'
B='\033[0;34m'
R='\033[0;31m'
N='\033[0m'

# Print the failing step on any error
trap 'echo -e "\n${R}❌ Deployment failed at the step above. See error output above for details.${N}\n"' ERR

echo -e "\n${B}🚀 Starting Prompt Commerce Gateway Deployment...${N}\n"

# ── Guard: .env must exist ────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  echo -e "${R}❌ .env not found.${N}"
  echo -e "   Run ${G}./setup-supabase.sh${N} first to create and populate it."
  exit 1
fi

# ── Guard: DATABASE_URL must be set ──────────────────────────────────────────
# Use grep rather than sourcing .env — Postgres URLs contain '?', '&', '='
# which bash misinterprets when the file is sourced directly.
if ! grep -qE '^DATABASE_URL=.+' .env; then
  echo -e "${R}❌ DATABASE_URL is not set in .env.${N}"
  echo -e "   Run ${G}./setup-supabase.sh${N} to configure your Supabase connection strings."
  exit 1
fi

# ── 1. Ensure logs directory exists ──────────────────────────────────────────
mkdir -p logs uploads

# ── 2. Install dependencies ───────────────────────────────────────────────────
echo -e "${G}Step 1/5: Installing dependencies...${N}"
npm install

# ── 3. Generate Prisma client ─────────────────────────────────────────────────
echo -e "${G}Step 2/5: Generating Prisma client...${N}"
npm run db:generate

# ── 4. Apply database migrations ─────────────────────────────────────────────
echo -e "${G}Step 3/5: Applying database migrations...${N}"
# db:migrate:prod runs 'prisma migrate deploy' — applies pending migrations
# without creating new migration files (safe for production).
npm run db:migrate:prod

# ── 5. Build the application ──────────────────────────────────────────────────
echo -e "${G}Step 4/5: Building application...${N}"
npm run build

# ── 6. Start / reload with PM2 ───────────────────────────────────────────────
echo -e "${G}Step 5/5: Launching with PM2...${N}"
if pm2 show prompt-commerce-gateway > /dev/null 2>&1; then
  echo -e "  Application exists — reloading for zero-downtime..."
  pm2 reload ecosystem.config.cjs --env production
else
  echo -e "  First deploy — starting new PM2 instance..."
  pm2 start ecosystem.config.cjs --env production
fi

# ── Done ──────────────────────────────────────────────────────────────────────
trap - ERR
echo -e "\n${B}✅ Deployment complete!${N}"
echo -e "To tail logs:   ${G}pm2 logs prompt-commerce-gateway${N}"
echo -e "To see status:  ${G}pm2 list${N}"
echo -e "\nRemember to run ${R}pm2 save${N} after the first deploy so the process"
echo -e "restarts automatically on server reboot.\n"

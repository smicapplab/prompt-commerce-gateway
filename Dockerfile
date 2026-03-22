FROM node:20-alpine AS base
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts=false

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
# Cap heap to 460 MB so tsc fits inside Render free tier's 512 MB RAM
RUN NODE_OPTIONS="--max-old-space-size=460" npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
# Prisma CLI is a devDep but is needed at runtime to run `migrate deploy`
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
# prisma.config.ts tells Prisma v7 how to connect for migrations
COPY prisma.config.ts ./
COPY src/public ./src/public

# Render dynamically assigns PORT; 10000 is the Render default
EXPOSE 10000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

# Prompt Commerce Gateway

The customer-facing hub of the Prompt Commerce network. The gateway connects independent retail stores (managed via the [Prompt Commerce Seller](../prompt-commerce)) to customers through a Telegram shopping bot powered by AI chat.

---

## Architecture

```
prompt-commerce-gateway/
  src/
    auth/           ← JWT auth for admin panel
    catalog/        ← Product cache (CachedProduct, CachedCategory) + delta sync
    orders/         ← Order processing
    retailers/      ← Retailer registry + gateway key issuance
    settings/       ← Key-value store for bot token, AI config, etc.
    telegram/       ← Telegram bot (grammy) + AI chat service
    public/         ← Static HTML: landing, register.html, admin.html
  prisma/
    schema.prisma   ← PostgreSQL schema (Retailer, CachedProduct, CachedCategory, Setting, …)
```

**Port:** 3002
**Database:** PostgreSQL (Docker in local dev, managed Postgres in production)

---

## Features

### Telegram Shopping Bot

Customers interact with the gateway entirely through Telegram. The bot is configured with a token stored in the database (set via the admin Settings tab — no restart needed).

**Commands:**

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + quick help |
| `/search <query>` | Search products across all connected stores |
| `/stores` | Browse stores by name, then browse their catalog |
| `/cart` | View cart contents |
| `/help` | Full command reference |

**Free-text search** — typing anything without a command triggers a cross-store search automatically.

### Natural Language Search

The bot parses natural language queries to extract filters before hitting the database. No AI call needed — pure regex.

Supported filter patterns:

| Pattern | Example |
|---------|-------------|
| Price ceiling | `laptop under 50k`, `shoes below 3000`, `max 1500` |
| Price floor | `bags above 500`, `more than 1000`, `at least 200` |
| Price range | `between 500 and 2000`, `500 to 2000`, `500-2000` |
| Stock filter | `in stock headphones`, `available sneakers` |
| Intent stripping | `find me a laptop under 50k` → keywords: `laptop`, maxPrice: 50000 |

Search uses multi-word AND logic: `"apple laptop"` splits into `["apple", "laptop"]` and requires every word to appear somewhere across title, description, SKU, or tags. Results are sorted by price ascending for easy comparison shopping.

The search header reflects active filters:
```
🔍 laptop · under ₱50,000 — 5 results across all stores
```

### AI Chat (per store)

Each store can have an AI assistant configured. Customers can ask product questions, get recommendations, and compare items. AI config (provider, API key, model) is pushed automatically from the seller admin when settings are saved — no manual gateway configuration needed.

- **Claude** — via `@anthropic-ai/sdk` with tool-use agentic loop
- **Gemini** — via `@google/generative-ai` with function declarations
- **OpenAI** — via `openai` SDK with function calling
- **Model override** — specify any model string (e.g. `gemini-1.5-flash`, `claude-3-5-sonnet`) per store.

### Payment Integration (Strategy Pattern)

The gateway supports multiple payment providers via a pluggable adapter system:

- **Stripe** — Hosted Checkout Sessions with HMAC signature verification.
- **PayMongo** — GCash, Maya, and GrabPay support via redirect.
- **Mock** — Instant success for testing and demo purposes.
- **Webhooks** — Dedicated module for receiving and verifying status updates from providers, automatically updating order status and notifying the buyer via Telegram.
- **Shared Order Lifecycle** — Support for the standardized progression: `pending` → `paid` → `picking` → `packing` → `ready_for_pickup` → `in_transit` → `delivered`.

### Delta Sync (Seller → Gateway)

The seller pushes only changed products and categories rather than wiping and re-inserting the full catalog:

- **Upsert** — new and updated items are merged row-by-row via Prisma `upsert`
- **Delete** — soft-deleted items in the seller are hard-deleted from the gateway cache
- Endpoint: `POST /api/stores/:slug/sync` — detects payload format automatically (delta `{ upsert, delete }` or legacy full snapshot `{ categories, products }`)

### Retailer Registry & Admin Panel

- **Public registration** (`/register.html`) — retailers submit their store details and business permit for verification
- **Admin panel** (`/admin.html`) — verify stores, issue `gk_` platform keys, suspend/reactivate retailers
- **Settings tab** — configure the Telegram bot token without restarting the server; stored in the `Setting` table

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Postgres)

### 1. Clone

```bash
git clone https://github.com/smicapplab/prompt-commerce-gateway.git
cd prompt-commerce-gateway
```

### 2. Configure environment

```bash
cp .env.example .env
```

Key variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prompt_commerce
JWT_SECRET=change-me-to-a-long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=3002
```

Telegram bot token and AI API keys are stored in the database (via the admin Settings tab), not in `.env`.

### 3. Install and migrate

```bash
npm install
npx prisma migrate dev
npx prisma generate
```

### 4. Run

```bash
# Development (from the gateway directory)
./dev.sh        # Linux / macOS — starts Docker Postgres + ts-node-dev
dev.bat         # Windows

# Or start manually
npm run dev
```

---

## EC2 / Production Deployment

A `run.sh` script is included for running the gateway on an EC2 instance (or any Linux server with Node + Docker):

```bash
chmod +x run.sh
./run.sh
```

`run.sh`:
1. Pulls the latest code (`git pull`)
2. Installs dependencies
3. Runs Prisma migrations
4. Builds the NestJS app
5. Restarts via PM2 (`prompt-commerce-gateway`)

Zero-downtime updates:

```bash
git pull && ./run.sh
```

PM2 setup for first deploy:

```bash
npm run build
pm2 start dist/main.js --name prompt-commerce-gateway
pm2 save && pm2 startup
```

---

## API Reference

### Sync

```
POST /api/stores/:slug/sync
Headers: x-gateway-key: <key>
Body (delta):    { upsert: { categories, products }, delete: { categoryIds, productIds } }
Body (snapshot): { categories, products }
```

### AI Config (pushed from seller)

```
PATCH /api/stores/:slug/ai-config
Headers: x-gateway-key: <key>
Body: { provider, gemini_api_key, claude_api_key, model }
```

### Settings

```
GET  /api/settings/:key
PUT  /api/settings/:key     Body: { value }
```

### Retailers

```
GET    /api/retailers           ← admin only
POST   /api/retailers           ← public registration
PATCH  /api/retailers/:id       ← verify, issue key, suspend
```

---

## Admin Panel

Open `/admin.html` after starting the server. Tabs:

- **Retailers** — list all registered stores, verify, issue/revoke gateway keys
- **Settings** — set the Telegram bot token (paste from @BotFather)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS |
| Database | PostgreSQL via Prisma ORM |
| Telegram bot | grammy |
| AI (Claude) | `@anthropic-ai/sdk` |
| AI (Gemini) | `@google/generative-ai` |
| Auth | JWT (`@nestjs/jwt` + Passport) |
| Process manager | PM2 |

---

## Roadmap / TODO

- [ ] **Vector / semantic search** — generate product embeddings on sync using a Hugging Face model (`all-MiniLM-L6-v2` via `@xenova/transformers` running locally, or HF Inference API). Store vectors in PostgreSQL via `pgvector`. At query time, embed the search string and return nearest neighbours by cosine similarity. This enables `"apple laptop"` → `"Apple MacBook Pro"` without requiring exact tag matches.
- [ ] Cart persistence — save carts to the database so they survive bot restarts
- [ ] Order placement through Telegram — full checkout flow in-bot
- [ ] Multi-language bot responses
- [ ] Webhook mode for Telegram (replace long-polling in production)

---

## License

MIT

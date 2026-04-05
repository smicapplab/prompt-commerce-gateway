# Prompt Commerce Gateway

The customer-facing hub of the Prompt Commerce network. The gateway connects independent retail stores (managed via the [Prompt Commerce Seller](../prompt-commerce)) to customers through a Telegram shopping bot powered by AI chat.


---

## 🚀 Live Demo

Experience Prompt Commerce in action:
- 🛒 **Customer Gateway**: [https://gateway.13.212.57.92.nip.io/](https://gateway.13.212.57.92.nip.io/)
- ⚡ **Admin Dashboard**: [https://admin.13.212.57.92.nip.io/](https://admin.13.212.57.92.nip.io/)

---


## Architecture

```
prompt-commerce-gateway/
  src/
    catalog/        ← Product cache (CachedProduct, CachedCategory) + Unified Search + delta sync
    orders/         ← Order sync receiver, gateway order ledger, fulfillment metrics
    payments/       ← Payment adapter pattern (Mock / COD / Assisted / PayMongo / Stripe)
    registry/       ← Retailer registry + gateway key issuance
    settings/       ← Key-value store for bot token, global config, default payment provider
    telegram/       ← Telegram bot (grammy) + AI chat + persistent cart + order status notifications
    mcp/            ← retailer-client.ts — HTTP calls to seller MCP server
  frontend/
    src/routes/
      admin/        ← SvelteKit 5 admin dashboard (retailers, orders, payments, settings tabs)
      stores/       ← Public web storefront (store directory, product grid, cross-store search)
  prisma/
    schema/         ← Split schema files (retailers, catalog, carts, payments, order-attachments, settings, admin)
```

**Port:** 3002
**Database:** PostgreSQL (Docker in local dev, managed Postgres in production)

---

## Features

### Telegram Shopping Bot

Customers interact entirely through Telegram. The bot token is stored in the database — change it in the admin Settings tab with no restart needed.

**Commands:**

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + store list |
| `/search <query>` | Search products across all connected stores |
| `/stores` | Browse stores, then browse their catalog |
| `/cart` | View cart contents |
| `/help` | Full command reference |
| `/myid` | Returns your Telegram chat ID (for store owners setting up order notifications) |

**Free-text search** — typing anything without a command triggers a cross-store search automatically.

### Public Web Storefront

A high-performance SvelteKit interface for customers who prefer browsing in a web browser.

- **Store Directory**: Browse all active retailers in the network.
- **Storefront Detail**: Dynamic product grids with category filtering and real-time stock status.
- **Deep Image Resolution**: Gateway dynamically resolves seller-side image uploads to valid absolute URLs.
- **Optimized Browsing**: Infinite search and "Load More" pagination for a premium, low-latency experience.

### Natural Language Search (Unified)

The gateway parses natural language queries into structured filters (price, stock, keywords). This intelligence is unified in `CatalogService` and shared across the Telegram bot and the Web Storefront.

**Search Engine Features:**
- **Natural Language Parsing**: Pure regex parsing with zero latency.
- **Multi-word AND Logic**: `"apple laptop"` matches if every word appears across title, description, SKU, or tags.
- **High Performance**: PostgreSQL B-Tree indexes on `title` and `[active, price]` for rapid range queries.
- **Case-Insensitive Tags**: Tags are normalized to lowercase on sync and during search.

| Pattern | Example |
|---------|---------|
| Price ceiling | `laptop under 50k`, `shoes below 3000`, `max 1500` |
| Price floor | `bags above 500`, `more than 1000`, `at least 200` |
| Price range | `between 500 and 2000`, `500 to 2000`, `500-2000` |
| Stock filter | `in stock headphones`, `available sneakers` |
| Intent stripping | `find me a laptop under 50k` → keywords: `laptop`, maxPrice: 50000 |

### Persistent Shopping Cart

- Cart items are stored in PostgreSQL (`carts` table) — survive gateway restarts.
- Per-user, per-store scoping: `@@unique([userId, storeSlug, productId])`.
- Injected as `CartService` into `TelegramService` — all operations are async, transactional, and validated against the live product catalog.
- `add()` uses an upsert with quantity increment, so re-adding an item increases quantity rather than duplicating it. Quantity is clamped (1-99) for safety.

### Checkout & Order Flow

- **Multi-step checkout in-bot** — customers provide name, email, and delivery address through a guided conversation.
- **Payment Method Selection** — dynamically offers a choice of enabled methods (COD, Online, Assisted) based on seller configuration.
- **Dynamic Delivery Options** — supports both **Home Delivery** and **Store Pickup** based on seller settings.
- **Input validation** — name (1–100 chars), email (RFC-compliant regex + 254-char max), address (1–300 chars).
- **Order rate limiting** — atomic one-order-per-30-seconds guard per user to prevent double-submissions.
- **Automated Customer Notifications** — buyers receive real-time Telegram updates for every status change (e.g., "Order is being packed", "Out for delivery").
- **Robust Order Tracking** — full support for tracking numbers and courier links mirrored from the seller.

### Payment Integration (Universal Adapter)

Supports any combination of payment providers simultaneously via a pluggable adapter:

| Provider | Method |
|----------|--------|
| **Mock** | Instant `paid` status for risk-free testing |
| **COD** | Cash on Delivery flow with manual seller confirmation |
| **Assisted** | Offline payments (Bank, GCash QR) with customizable buyer instructions |
| **PayMongo** | GCash, Maya, GrabPay (redirect) with link-specific webhook handling |
| **Stripe** | Hosted Checkout Sessions (cards, worldwide) |

Sellers can enable multiple methods; the gateway automatically resolves the primary online provider for webhooks and provides selection buttons in Telegram. Payment config is pushed automatically from the seller admin on every save.

### Network Order Dashboard (Admin Only)

A centralized ledger for managing orders across the entire retail network:
- **Global Order Ledger**: View and filter orders from all stores by status, delivery type, or date.
- **Fulfillment Metrics**: Track average fulfillment time (Creation → Terminal Status) per store or across the network.
- **Internal History**: View mirrored order timelines and collaborative notes from sellers.
- **Attachment Viewing**: Access receipts and documents attached by sellers directly from the gateway dashboard.

**Order lifecycle:**

```
pending_payment → paid ──────────────────────────────────────────────────┐
pending ─────────────────────────────────────────────────────────────────┤
paid ─────────────── picking → packing → in_transit → delivered          │
                                       ↘ ready_for_pickup → picked_up   │
                                                                          ↓
                                                      cancelled / refunded
```

COD and Assisted orders start at `pending_payment`; the seller manually marks them `paid` once payment is confirmed. Pickup orders follow the `ready_for_pickup → picked_up` branch and cannot transition to `in_transit`.

### AI Chat & Conversation Mirroring

Each store can enable an AI assistant for product discovery and recommendations:

- **Claude** — `@anthropic-ai/sdk` with tool-use agentic loop (up to 5 rounds)
- **Gemini** — `@google/generative-ai` with function declarations
- **OpenAI** — `openai` SDK with function calling
- **Conversation Mirroring** — All Telegram/Web chats are mirrored to the seller's SQLite in real-time with automatic retries on failure.
- **Human Handover** — Seamlessly switch from AI to human agent; the gateway synchronizes mode changes across all channels.
- **Security Hardening** — XSS protection via HTML escaping for sender names and store names in all customer-facing templates.
- **Custom system prompt** — per-store persona pushed from seller admin and stored on the `Retailer` row.
- **Model override** — any model string can be specified (e.g. `gemini-1.5-flash`, `claude-opus-4-5`).

AI config is pushed automatically from the seller admin on every save.

### Delta Sync (Seller → Gateway)

The seller pushes only changed products and categories rather than wiping and re-inserting:

- **Upsert** — active items are merged row-by-row via Prisma `upsert`.
- **Delete** — soft-deleted items in the seller are hard-deleted from the gateway cache.
- **Image URL absolutization** — relative `/uploads/…` paths in synced products are prefixed with `SELLER_PUBLIC_URL` (env → DB setting → request origin) so Telegram can display images.
- Endpoint: `POST /api/stores/:slug/sync` — detects payload format automatically (delta `{ upsert, delete }` or legacy full snapshot `{ categories, products }`).

### Config Push Endpoints

All config is pushed from the seller; the gateway never has its own config UIs for these:

| Endpoint | What it receives |
|----------|-----------------|
| `PATCH /api/stores/:slug/ai-config` | AI provider, API key, model, system prompt |
| `PATCH /api/stores/:slug/payment-config` | Payment provider, secret key, public key, webhook secret, payment instructions, link template |
| `PATCH /api/stores/:slug/store-config` | `allowsPickup` flag (enables pickup delivery option in Telegram checkout) |
| `PATCH /api/stores/:slug/telegram-config` | Seller's Telegram notification chat ID |

Each has a corresponding `GET …/status` endpoint polled by the seller UI to confirm the push landed.

### Retailer Registry & Admin Panel

- **Public registration** (`/register.html`) — retailers submit store details for verification.
- **Admin dashboard** (`/admin` — SvelteKit 5 frontend) — verify stores, issue `gk_` platform keys, suspend/reactivate, view the network order ledger, and configure the Telegram bot token without restarting the server.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Postgres)

### 1. Clone both repos

```bash
git clone https://github.com/smicapplab/prompt-commerce.git
git clone https://github.com/smicapplab/prompt-commerce-gateway.git
```

Place them under the same parent folder, then start everything from that folder:

```bash
./dev.sh        # Linux / macOS
dev.bat         # Windows
```

`dev.sh` handles: Docker Postgres → Prisma migrations → `prisma generate` → both services. See the seller README for full details.

### Manual start (gateway only)

```bash
cd prompt-commerce-gateway
cp .env.example .env   # edit DATABASE_URL if needed
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Key `.env` variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prompt_commerce
JWT_SECRET=change-me-to-a-long-random-string
PORT=3002
GATEWAY_PUBLIC_URL=https://your-gateway.example.com   # for payment redirect URLs
```

Telegram bot token and all AI/payment API keys are stored in the database (via admin panel), not in `.env`.

---

## Production Deployment (EC2 / Linux)

```bash
chmod +x run.sh
./run.sh
```

`run.sh`: git pull → npm install → `prisma generate` → `prisma migrate deploy` → build → `pm2 reload`.

PM2 setup for first deploy:

```bash
npm run build
pm2 start dist/main.js --name prompt-commerce-gateway
pm2 save && pm2 startup
```

### Environment

```env
GATEWAY_PUBLIC_URL=https://gateway.example.com   # payment success/cancel/webhook URLs
TELEGRAM_BOT_TOKEN=...                            # fallback for local dev only; use DB in prod
```

### Payment Webhook Registration

After configuring a real payment provider in seller Settings → Payments, register this URL with the provider dashboard:

```
https://gateway.example.com/webhooks/payment/<store-slug>
```

---

## API Reference

### Product & Category Sync

```
POST /api/stores/:slug/sync
Headers: x-gateway-key: <platform_key_or_user_temp_token>
Body (delta):    { upsert: { categories, products }, delete: { categoryIds, productIds } }
Body (snapshot): { categories, products }
```

### Order Sync

```
POST /api/stores/:slug/orders/sync
Headers: x-gateway-key: <platform_key>
Body: {
  upsert: {
    orders:     [{ id, status, delivery_type, tracking_number, ... }],
    orderNotes: [{ id, order_id, note, created_by, deleted_at, ... }],
    orderFiles: [{ id, order_id, file_url, mime_type, size_bytes, ... }]
  }
}
```

Pushed in 500-row batches by the seller whenever dirty rows (`is_synced = 0`) exist. Buyer receives a Telegram notification on every status change.

### Config Push (from seller)

```
PATCH /api/stores/:slug/ai-config
PATCH /api/stores/:slug/payment-config
PATCH /api/stores/:slug/store-config
PATCH /api/stores/:slug/telegram-config
Headers: x-gateway-key: <platform_key>
```

### Webhooks

```
POST /webhooks/payment/:slug    ← PayMongo / Stripe callbacks (HMAC verified)
GET  /payment/success           ← buyer success redirect page
GET  /payment/cancel            ← buyer cancel redirect page
```

### Retailers

```
GET    /api/retailers           ← admin only
POST   /api/retailers           ← public registration
PATCH  /api/retailers/:id       ← verify, issue key, suspend
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS |
| Database | PostgreSQL via Prisma ORM |
| Telegram bot | grammy |
| AI (Claude) | `@anthropic-ai/sdk` |
| AI (Gemini) | `@google/generative-ai` |
| AI (OpenAI) | `openai` |
| Auth | JWT (`@nestjs/jwt` + Passport) |
| Process manager | PM2 |

---

## Roadmap

- [ ] **Vector / semantic search** — product embeddings via HuggingFace (`all-MiniLM-L6-v2`) stored in pgvector. Enables `"apple laptop"` → `"Apple MacBook Pro"` without exact tag matches.
- [ ] **Telegram webhook mode** — replace long-polling with proper webhooks for production.
- [ ] Multi-language bot responses.

---

## License

MIT

# Prompt Commerce Gateway

The customer-facing hub of the Prompt Commerce network. The gateway connects independent retail stores (managed via the [Prompt Commerce Seller Admin](../prompt-commerce)) to customers through a Telegram shopping bot and a public web storefront, powered by AI.

---

## 🚀 Live Demo

- 🛒 **Customer Gateway**: [https://gateway.13.212.57.92.nip.io/](https://gateway.13.212.57.92.nip.io/)
- ⚡ **Admin Dashboard**: [https://admin.13.212.57.92.nip.io/](https://admin.13.212.57.92.nip.io/)

---

## Architecture

```
prompt-commerce-gateway/
  src/
    address-picker/ ← Google Places Mini App controller + one-time token service
    catalog/        ← Product cache (CachedProduct, CachedCategory) + Unified Search + delta sync
    orders/         ← Order sync receiver, gateway order ledger, fulfillment metrics
    payments/       ← Payment adapter pattern (Mock / COD / Assisted / PayMongo / Stripe)
    registry/       ← Retailer registry + gateway key issuance
    settings/       ← Key-value store for bot token, global config, default payment provider
    telegram/       ← Telegram bot (grammy) + AI chat + persistent cart + order status notifications
    whatsapp/       ← WhatsApp bot (Meta Cloud API) — full checkout, AI chat, order notifications
    mcp/            ← retailer-client.ts — HTTP calls to seller MCP server
  frontend/
    src/
      lib/
        api.ts      ← apiFetch helper — respects VITE_API_BASE for decoupled deployments
        components/
          admin/    ← Modular admin components (AdminSidebar, RetailerList, OrderDashboard,
                    ←   ChatLog, PaymentSettings, SystemSettings, LoginPanel)
      routes/
        admin/      ← SvelteKit 5 admin dashboard (retailers, orders, payments, settings tabs)
        stores/     ← Public web storefront (store directory, product grid, cross-store search)
  shared/
    types.ts        ← Shared TypeScript interfaces used by both NestJS backend and SvelteKit frontend
  prisma/
    schema/         ← Split schema files (retailers, catalog, carts, payments, order-attachments,
                       telegram_users, telegram_sessions, whatsapp_users, whatsapp_sessions,
                       address_picker, ph_locations, conversations, settings, admin)
  public/
    address-picker.html ← Google Places Mini App (token + API key injected at serve time)
```

**Ports:**
- `GATEWAY_PORT=3002` — NestJS API + serves built frontend (`scripts/run.sh` / PM2)
- Port `3003` — Vite dev server only, proxies `/api/*` to NestJS at 3002 (`dev.sh`)

**Database:** PostgreSQL (Docker in local dev, managed Postgres in production)

---

## Features

### Telegram Shopping Bot

Customers interact entirely through Telegram. The bot token is stored in the database — change it in the admin Settings tab with no restart needed.

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + store list |
| `/search <query>` | Search products across all connected stores |
| `/stores` | Browse stores, then browse their catalog |
| `/cart` | View cart contents |
| `/help` | Full command reference |
| `/myid` | Returns your Telegram chat ID (for store owners setting up order notifications) |

Free-text input (without a `/` command) triggers a cross-store product search automatically.

### Public Web Storefront

A SvelteKit interface for customers who prefer browsing in a web browser.

- **Store Directory**: Browse all active retailers in the network.
- **Storefront Detail**: Dynamic product grids with category filtering and real-time stock status.
- **Deep Image Resolution**: Gateway dynamically resolves seller-side image uploads to valid absolute URLs.
- **Pagination**: Infinite search and "Load More" pagination.

### Natural Language Search (Unified)

The gateway parses natural language queries into structured filters. This logic lives in `CatalogService` and is shared across the Telegram bot and Web Storefront.

| Pattern | Example |
|---------|---------|
| Price ceiling | `laptop under 50k`, `shoes below 3000`, `max 1500` |
| Price floor | `bags above 500`, `more than 1000`, `at least 200` |
| Price range | `between 500 and 2000`, `500 to 2000`, `500-2000` |
| Stock filter | `in stock headphones`, `available sneakers` |
| Intent stripping | `find me a laptop under 50k` → keywords: `laptop`, maxPrice: 50000 |

### Persistent Shopping Cart

Cart items are stored in PostgreSQL (`carts` table) and survive gateway restarts. Per-user, per-store scoping with upsert-based quantity increment (clamped 1–99).

### WhatsApp Shopping Bot

Full checkout and AI chat parity with the Telegram bot, delivered via Meta Cloud API webhooks. The same address picker mini app, order sync, and saved profile/address logic applies. Users are keyed by their WhatsApp phone number.

### Checkout & Order Flow

- **Rich Search Results**: Products with images are returned as individual photo cards with prominent pricing and one-step action buttons (Add to Cart, Buy Now). Fallbacks to text lists for pagination or items lacking images.
- **Smart Profile Extraction**: Seamless checkout flow automatically prefills the customer's name and email if they have ordered before, skipping redundant prompts.
- **Google Places Address Picker (Mini App)**: Buyers tap a button to open an in-app web form powered by the Google Places API. It shows real-time address suggestions (Philippines-scoped), captures a fully structured address including `streetLine`, `barangay`, `city`, `province`, `postalCode`, `lat`, and `lng`, and submits via a secure one-time token (10-min TTL). Cancelling falls back to free-text entry.
- **Saved Addresses**: After entering an address (via picker or free text), buyers are prompted to save it as "Home", "Office", or a custom label. Saved addresses appear as one-tap quick-pick buttons on future checkouts.
- **Payment Method Selection**: Dynamically offers a choice of all enabled methods (COD, Mock, PayMongo, Stripe, Assisted) based on seller configuration.
- **Dynamic Delivery Options**: Supports both Home Delivery and Store Pickup based on seller settings.
- **Input validation**: Name (1–100 chars), email (RFC-compliant regex + 254-char max), address (1–300 chars).
- **Order rate limiting**: Atomic one-order-per-30-seconds guard per user to prevent double-submissions.
- **Automated Customer Notifications**: Buyers receive real-time Telegram/WhatsApp updates for every order status change.
- **Robust Order Tracking**: Full support for tracking numbers and courier links mirrored from the seller.

### Payment Integration (Universal Adapter)

Sellers can enable any combination of payment providers simultaneously. The gateway resolves them all via a pluggable adapter pattern.

| Provider | Flow |
|----------|------|
| **Mock** | Hosted fake credit card form at `/mock-pay` — safe for demos and testing |
| **COD** | Cash on Delivery — seller manually confirms payment |
| **Assisted** | Offline payments (Bank transfer, GCash QR) with customizable buyer instructions |
| **PayMongo** | GCash, Maya, GrabPay (redirect) with HMAC-verified webhook handling |
| **Stripe** | Hosted Checkout Sessions (cards, worldwide) |

When a buyer selects Mock or any online provider, they receive a "💳 Pay Now" button linking to the payment page. COD and Assisted flows provide instructions inline.

### Gateway Admin Dashboard

A modular SvelteKit 5 admin panel composed of focused, independently maintainable components:

| Component | Responsibility |
|---|---|
| `LoginPanel` | Auth form with JWT session management, idle timeout (1h), absolute limit (4h) |
| `AdminSidebar` | Tab navigation with pending-retailer badge counter |
| `RetailerList` | Filtered retailer table with verify / suspend / platform key actions |
| `OrderDashboard` | Cross-network order ledger with stats, notes, fulfillment tracking |
| `ChatLog` | Live conversation viewer with 5-second polling, mode switching, force-close |
| `PaymentSettings` | Default payment provider config |
| `SystemSettings` | Telegram bot token, webhook URL management |

### Network Order Dashboard (Admin Only)

A centralized ledger for managing orders across the entire retail network:

- **Global Order Ledger**: View and filter orders from all stores by status, delivery type, or date.
- **Fulfillment Metrics**: Track average fulfillment time (Creation → Terminal Status) per store or network-wide.
- **Internal History**: View mirrored order timelines and collaborative notes from sellers.
- **Attachment Viewing**: Access receipts and documents attached by sellers.

**Order lifecycle:**

```
pending_payment → paid ──────────────────────────────────────────────────┐
pending ─────────────────────────────────────────────────────────────────┤
paid ─────────────── picking → packing → in_transit → delivered          │
                                       ↘ ready_for_pickup → picked_up   │
                                                                          ↓
                                                      cancelled / refunded
```

COD and Assisted orders start at `pending_payment`; the seller manually marks them `paid` once payment is confirmed. Pickup orders follow the `ready_for_pickup → picked_up` branch.

### AI Chat

Each store can enable an AI assistant for product discovery and recommendations:

- **Claude** — `@anthropic-ai/sdk` with tool-use agentic loop (up to 5 rounds)
- **Gemini** — `@google/generative-ai` with function declarations
- **OpenAI** — `openai` SDK with function calling
- **Conversation Mirroring** — All Telegram chats are mirrored to the seller's SQLite in real-time.
- **Human Handover** — Seamlessly switch from AI to human agent; the gateway synchronizes mode changes.
- **Custom system prompt** — per-store persona pushed from seller admin.
- **Model override** — any model string can be specified (e.g. `gemini-1.5-flash`, `claude-opus-4-5`).

AI config is pushed automatically from the seller admin on every save.

### Delta Sync (Seller → Gateway)

The seller pushes only changed products and categories rather than wiping and re-inserting:

- **Upsert** — active items are merged row-by-row via Prisma `upsert`.
- **Delete** — soft-deleted items in the seller are hard-deleted from the gateway cache.
- **Image URL absolutization** — relative `/uploads/…` paths are prefixed with `SELLER_PUBLIC_URL` so Telegram can display images.
- Endpoint: `POST /api/stores/:slug/sync` — accepts delta `{ upsert, delete }` or legacy full snapshot.

### Config Push Endpoints

All config is pushed from the seller; the gateway has no separate config UIs for these.

| Endpoint | What it receives |
|----------|-----------------|
| `PATCH /api/stores/:slug/ai-config` | AI provider, API key, model, system prompt |
| `PATCH /api/stores/:slug/payment-config` | Payment methods array, provider keys, webhook secret, payment instructions |
| `PATCH /api/stores/:slug/store-config` | `allowsPickup` flag |
| `PATCH /api/stores/:slug/telegram-config` | Seller's Telegram notification chat ID |
| `PATCH /api/stores/:slug/google-config` | `googlePlacesBrowserKey` (address picker), `googleMapsEmbedKey` (order maps) |

Each has a corresponding `GET …/status` endpoint polled by the seller UI to confirm the push landed.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)

### Full Stack (Seller + Gateway — recommended)

From the parent folder that contains both repos:

```bash
./dev.sh        # Linux / macOS
dev.bat         # Windows
```

`dev.sh` handles: Docker Postgres → Prisma migrations → `prisma generate` → both services.

**URLs when running `dev.sh`:**
- Seller Admin: `http://localhost:3000/admin`
- Gateway API: `http://localhost:3002/api`
- Gateway UI (Vite, with HMR): `http://localhost:3003`

### Gateway Only (standalone)

```bash
cd prompt-commerce-gateway

# First time only
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh     # creates .env, starts Docker Postgres, runs migrations, seeds admin

# Fetch and seed the massive PSGC geographic database for checkout:
npx ts-node scripts/seed-ph-addresses.ts

# Start dev server
./scripts/dev.sh
```

**URL:** `http://localhost:3003` (Vite) proxies to NestJS at `http://localhost:3002`

---

## Environment Variables

All variables are documented in `.env.example`. Use `.env.supabase.example` for Supabase/production.

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Runtime PostgreSQL connection URL |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL URL for Prisma migrations (must bypass poolers) |
| `JWT_SECRET` | Secret for JWT signing — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Important for Production

| Variable | Description |
|----------|-------------|
| `GATEWAY_PUBLIC_URL` | Public URL of this gateway — **required** for payment redirect links. Without it, Telegram rejects payment URL buttons pointing to localhost. |
| `GATEWAY_PORT` | HTTP port (default: `3002`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Gateway admin credentials — change from defaults immediately |

### Optional / Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIR` | `./uploads` | Path for uploaded permit files |
| `EMAIL_USER` | — | Gmail address for order notification emails |
| `EMAIL_APP_PASSWORD` | — | Gmail App Password (requires 2FA enabled) |
| `TELEGRAM_BOT_TOKEN` | — | Fallback bot token for local dev. In production, set via admin panel |
| `ANTHROPIC_API_KEY` | — | Fallback AI key for local dev. In production, set per-store via seller admin |
| `ENABLE_MOCK_PAYMENT` | `false` | Set to `true` to enable the `/mock-pay` checkout page (safe for demos and testing) |

---

## Production Deployment (EC2 / Linux)

### 1. First-time setup

```bash
cd prompt-commerce-gateway
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh     # interactive: sets DATABASE_URL, DIRECT_DATABASE_URL, seeds admin
```

Edit `.env` and set:

```env
GATEWAY_PUBLIC_URL=https://gateway.example.com
JWT_SECRET=<generated-secret>
ADMIN_PASSWORD=<strong-password>
```

### 2. Deploy

```bash
chmod +x scripts/run.sh
./scripts/run.sh
```

`run.sh` handles: `npm install` → `prisma generate` → `prisma migrate deploy` → build (API + frontend) → PM2 start/reload.

After deployment, both the API and built frontend are served from a single NestJS process at **`http://localhost:3002`**.

### 3. Persist PM2 across reboots

```bash
pm2 save && pm2 startup
```

### Payment Webhook Registration

After configuring a real payment provider in seller Settings → Payments, register this webhook URL with the provider dashboard:

```
https://gateway.example.com/webhooks/payment/<store-slug>
```

---

## API Reference

### Product & Category Sync

```
POST /api/stores/:slug/sync
Headers: x-gateway-key: <platform_key>
Body (delta):    { upsert: { categories, products }, delete: { categoryIds, productIds } }
Body (snapshot): { categories, products }
```

### Order Sync

```
POST /api/stores/:slug/orders/sync
Headers: x-gateway-key: <platform_key>
Body: {
  upsert: {
    orders: [{
      id, status, delivery_type, tracking_number, courier_name, tracking_url,
      cancellation_reason, payment_provider, payment_instructions,
      created_at, updated_at, buyer_ref, total    ← buyer_ref + total required for
    }],                                              manual-order placeholder records
    orderNotes: [{ id, order_id, note, created_by, deleted_at, ... }],
    orderFiles: [{ id, order_id, file_url, mime_type, size_bytes, ... }]
  }
}
```

### Address Picker

```
GET  /address-picker?token=<uuid>         ← serves Mini App HTML (validates token, injects API key)
POST /address-picker/submit               ← consumes token; routes to channel handler
Body (confirm):  { token, address: { streetLine, barangay, city, province, postalCode, lat, lng, formattedAddress } }
Body (cancel):   { token, cancelled: true }
```

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
GET  /mock-pay?ref=<ref>        ← mock payment checkout page (requires ENABLE_MOCK_PAYMENT=true in prod)
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
| Admin UI | SvelteKit 5 (Svelte 5 Runes) + Tailwind CSS |
| Frontend types | Shared `shared/types.ts` — zero `any` in frontend |
| AI (Claude) | `@anthropic-ai/sdk` |
| AI (Gemini) | `@google/generative-ai` |
| AI (OpenAI) | `openai` |
| Address Picker | Google Places New JS Library (AutocompleteSuggestion + Place.fetchFields) |
| Auth | JWT (`@nestjs/jwt` + Passport), 1h idle / 4h absolute session limit |
| Process manager | PM2 |

---

## Roadmap

- [ ] **Vector / semantic search** — product embeddings via HuggingFace (`all-MiniLM-L6-v2`) stored in pgvector.
- [x] **Telegram webhook mode** — supported alongside polling mode; configure URL via admin Settings tab.
- [x] **WhatsApp Business Bot** — Full parity with Telegram: search, cart, checkout (Google Places address picker), AI chat, order notifications via Meta Cloud API.
- [ ] **Web Storefront Cart & Checkout** — full shopping flow in the browser (currently Telegram/WhatsApp-only).
- [ ] **Multi-language bot responses**.

---

## License

MIT

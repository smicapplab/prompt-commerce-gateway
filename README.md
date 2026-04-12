# Prompt Commerce Gateway

The customer-facing hub of the Prompt Commerce network. The gateway connects independent retail stores (managed via the [Prompt Commerce Seller Admin](../prompt-commerce)) to customers through automated shopping bots on **Telegram** and **WhatsApp**, and a public web storefront—all powered by an agentic AI backbone.

---

## 🚀 Live Demo

- 🛒 **Customer Gateway**: [https://gateway.13.212.57.92.nip.io/](https://gateway.13.212.57.92.nip.io/)
- ⚡ **Admin Dashboard**: [https://admin.13.212.57.92.nip.io/](https://admin.13.212.57.92.nip.io/)

---

## 🔐 Security & Reliability

The gateway is built with enterprise-grade security to protect both merchants and customers:
- **Persistent Rate Limiting**: Prisma-backed rate limiting for login attempts and order placement, ensuring protection even in multi-instance deployments.
- **Secure Authentication**: JWT-based session management using `httpOnly` cookies to mitigate XSS risks.
- **SSRF Protection**: Advanced IPv4 and IPv6 DNS validation for all outgoing MCP and image-proxy requests.
- **Atomic Checkout**: Transactional order processing with manual-reconciliation logging for "orphaned" orders, ensuring no payment or order data is ever lost.

---

## 🧠 AI-Powered Discoverability

The gateway enriches the shopping experience with deep AI integration:
- **Semantic Tagging Engine**: Automatically generates domain-agnostic semantic metadata for every synced product. Whether selling shoes or airline tickets, the AI understands context to make your catalog searchable by meaning (e.g., "basketball shoes" matches "Nike Air Jordan").
- **Natural Language Search**: A unified parsing engine that strips noise words and handles complex price/stock filters across all channels.
- **Visual AI Results**: AI-found products are rendered as **rich interactive photo cards** on Telegram and WhatsApp, matching the premium look of the primary search engine.

---

## Architecture

```
prompt-commerce-gateway/
  src/
    address-picker/ ← Google Places Mini App controller + one-time token service
    catalog/        ← Product cache + TaggingService (Semantic Metadata) + Unified Search
    orders/         ← Order sync receiver, gateway order ledger, fulfillment metrics
    payments/       ← Payment adapter pattern (Mock / COD / Assisted / PayMongo / Stripe)
    registry/       ← Retailer registry + gateway key issuance + Sanitization
    settings/       ← Key-value store for bot token, global config, gateway AI keys
    telegram/       ← Telegram bot (grammy) + AI chat + Rich Photo Cards
    whatsapp/       ← WhatsApp bot (Meta Cloud API) — full feature parity
    mcp/            ← retailer-client.ts — HTTP calls to seller MCP server
  frontend/
    src/
      routes/
        admin/      ← SvelteKit 5 admin dashboard
        stores/     ← Public web storefront
  shared/
    types.ts        ← Shared TypeScript interfaces for full-stack safety
  prisma/
    schema/         ← Split schema files (retailers, catalog, carts, payments, etc.)
```

**Ports:**
- `GATEWAY_PORT=3002` — NestJS API + serves built frontend
- Port `3003` — Vite dev server only (proxies to 3002)

---

## Features

### Unified Messaging Bots (Telegram & WhatsApp)
Full parity across both messaging giants. Customers interact with your store through a custom AI persona.

| Feature | Description |
|---------|-------------|
| **Agentic AI Chat** | Multi-round tool-use loop (Claude, Gemini, or OpenAI) |
| **Rich Search** | Individual photo cards with prominent pricing and action buttons |
| **Smart Cart** | Persistent, cross-session shopping cart |
| **Human Handover** | One-tap transition from AI assistant to a real person |
| **Status Updates** | Real-time push notifications for every order milestone |

### Public Web Storefront
A high-performance SvelteKit interface for desktop and mobile browsers.
- **Store Directory**: Browse all verified retailers in the network.
- **Deep Image Resolution**: Dynamically resolves and proxies seller-side image uploads.
- **Infinite Pagination**: Smooth "Load More" experience for large catalogs.

### Natural Language Search
The gateway parses natural language queries into structured filters:
- **Price ceiling**: `laptop under 50k`
- **Price floor**: `bags above 500`
- **Range**: `shoes between 500 and 2000`
- **Intent stripping**: `find me a white sneakers` → keywords: `white sneakers`

---

### Checkout & Order Flow
- **Google Places Mini App**: Precise, structured delivery address collection including lat/lng.
- **Address Book**: Saved addresses ("Home", "Office") for 1-tap reuse.
- **Universal Payments**: Pluggable adapters for Stripe, PayMongo, COD, and Assisted flows.
- **Order Rate Limiting**: Atomic guard to prevent accidental double-submissions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | NestJS |
| **Database** | PostgreSQL via Prisma ORM |
| **Telegram** | grammy |
| **WhatsApp** | Meta Cloud API |
| **Admin UI** | SvelteKit 5 (Svelte 5 Runes) + Tailwind CSS |
| **AI** | Anthropic Claude, Google Gemini, OpenAI |
| **Address Picker** | Google Places New JS Library |

---

## Roadmap

- [ ] **Vector Search** — pgvector integration for true multi-modal semantic discovery.
- [x] **Semantic Tagging** — Automated metadata enrichment during catalog sync.
- [x] **Rich Messaging Cards** — Unified, visual search results across bots.
- [ ] **Browser Checkout** — Bringing the full bot checkout flow to the web storefront.

---

## License

MIT

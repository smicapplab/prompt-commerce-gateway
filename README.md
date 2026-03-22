# Prompt Commerce — Gateway

The Gateway is the customer-facing hub of Prompt Commerce. it connects retail stores to customers through a Telegram shopping bot and a modern API.

## Core Stack
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Bot**: grammy (Telegram Bot API)
- **AI**: Claude, Gemini, and OpenAI (agentic tool-use)
- **Payments**: Stripe, PayMongo, and Mock adapters

## Key Features
- **Telegram Shopping Bot**: AI-powered conversational shopping with natural language search filters (price, stock, intent).
- **Multi-Store Registry**: Manage retailer registrations, platform keys, and cached catalogs.
- **Delta Sync API**: Receives row-by-row updates from Seller services to keep the public catalog fresh.
- **Payment Processing**: Strategy-based payment integration supporting hosted checkout sessions and webhooks.

## Quick Start
1. **Install**: `npm install`
2. **Setup**: `cp .env.example .env` (Configure `DATABASE_URL`, `JWT_SECRET`, etc.)
3. **Migrate**: `npx prisma migrate dev`
4. **Run**: `./dev.sh` (Starts Docker Postgres and the NestJS app)

Gateway API: [http://localhost:3002](http://localhost:3002)

## Project Structure
- `src/catalog/`: Sync endpoints and product caching logic.
- `src/telegram/`: Bot handlers and AI chat orchestration.
- `src/payments/`: Payment gateway adapters and webhook handling.
- `src/retailers/`: Merchant registry and key management.

## Integration
Retailers connect by syncing their catalog to `POST /api/stores/:slug/sync`. AI and Payment configurations are pushed automatically from the Seller Admin to ensure the bot always uses the merchant's preferred providers.

---
License: MIT

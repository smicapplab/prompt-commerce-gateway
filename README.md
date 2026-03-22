# Prompt Commerce Gateway

The central hub for the Prompt Commerce network. This gateway connects independent retail stores (MCP servers) to AI assistants (Claude, ChatGPT), enabling a unified shopping experience across a distributed catalog.

## Purpose

The Gateway serves three primary roles in the ecosystem:

1.  **Retailer Registry**: A public portal for small businesses to register their stores and submit business permits for verification.
2.  **Verification Center**: An admin dashboard where gateway operators verify store credentials and issue `gk_` platform keys.
3.  **SSE Gateway**: Translates the Model Context Protocol (MCP) into Server-Sent Events (SSE), allowing AI clients to query products from multiple verified stores via a single connection.

## Key Features

- **Public Store Registration**: Guided form for retailers to join the network.
- **Admin Management**: Secure panel for verifying stores, issuing keys, and suspending/reactivating retailers.
- **Distributed Search**: Aggregates product search requests across all connected seller servers.
- **Platform Key Security**: Enforces `x-gateway-key` validation for all MCP connections.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: Prisma with SQLite (default) or PostgreSQL
- **Auth**: JWT-based authentication for Gateway Admin
- **Protocol**: Model Context Protocol (MCP) over SSE

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Setup Environment
Copy the example environment file and update the values:
```bash
cp .env.example .env
```
Key variables:
- `DATABASE_URL`: Connection string for your database.
- `JWT_SECRET`: Secret key for admin session tokens.
- `ADMIN_USERNAME`/`ADMIN_PASSWORD`: Credentials for the Gateway Admin panel.

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
npm run db:migrate
npm run db:generate
```

### 5. Run the Server
```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

### 5. Start for Development
From the `prompt-commerce-gateway` directory:

```bash
# Mac / Linux
./dev.sh

# Windows
dev.bat
```

## Public Endpoints

- **`/`**: Landing page with connection instructions.
- **`/register.html`**: Retailer registration portal.
- **`/admin.html`**: Gateway oversight and verification panel.
- **`/sse`**: The entry point for AI clients (Claude Desktop).

## Connecting as an AI Client

Add the gateway to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "prompt-commerce": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

## License

MIT

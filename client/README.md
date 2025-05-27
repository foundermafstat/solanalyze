# OKX Web3 Portfolio & Analytics Platform

A full-stack Web3 application for portfolio analytics, wallet management, and blockchain data exploration. Built with Next.js, React, Tailwind CSS, shadcn/ui, TypeScript, and Prisma. The platform provides seamless integration with Solana wallets, real-time balance and transaction tracking, and a robust API for blockchain and exchange data.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Client Implementation](#client-implementation)
- [Server Implementation](#server-implementation)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development & Scripts](#development--scripts)
- [Security & Best Practices](#security--best-practices)
- [License](#license)

---

## Features
- **Multi-Chain Wallet Integration**: Connect and manage Solana wallets via web extension.
- **Real-Time Portfolio Dashboard**: View balances, recent transactions, and analytics for connected wallets.
- **Blockchain Explorer Links**: Direct links to Solana Explorer for all transactions.
- **Network Switching**: Easily toggle between Solana mainnet, devnet, and testnet.
- **Secure Authentication**: Only authenticated users can access sensitive account data.
- **Responsive UI**: Modern, accessible interface built with Tailwind CSS and shadcn/ui.
- **Backend API**: Unified endpoints for wallet data, exchange rates, and blockchain analytics.

---

## Architecture Overview

```
client/ (Next.js, React, Tailwind, shadcn/ui)
├── app/
│   ├── api/            # API endpoints (Next.js route handlers)
│   ├── components/     # UI and layout components
│   ├── lib/            # Utilities (blockchain, API, helpers)
│   └── styles/         # Tailwind and custom styles
└── ...

server/ (Node.js, Prisma, Axios)
├── src/
│   ├── api/            # REST API endpoints
│   ├── prisma/         # Database schema and migrations
│   └── utils/          # Common backend logic
└── ...
```

---

## Client Implementation

- **Framework**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui 2.1.8, TypeScript 5+
- **Wallet Integration**: Uses `@solana/wallet-adapter-react` for secure wallet connection and state management.
- **Network Selection**: State is persisted in `localStorage` and can be changed via the UI.
- **Account Page**: `/account/[address]` displays wallet address, balance, and latest transactions. Access is restricted to authenticated users.
- **Transaction Explorer Links**: Each transaction links to the appropriate Solana Explorer page for the selected network.
- **Error Handling**: User-friendly error messages for connection, balance, and transaction retrieval.
- **Responsive Design**: Fully responsive, accessible, and consistent with the design system.

### Key UI Routes
- `/` — Home dashboard
- `/wallet` — Wallet connection and overview
- `/account/[address]` — Dynamic user account page (protected)

---

## Server Implementation

- **Framework**: Node.js 20+, TypeScript, Prisma 5+, Axios
- **Database**: Managed via Prisma ORM (PostgreSQL recommended)
- **API Layer**: RESTful endpoints for:
  - Wallet analytics (balance, transactions)
  - Exchange rate data
  - Blockchain metadata
- **Security**: Input validation, error handling, and sensitive data protection.
- **Extensibility**: Modular structure for adding new blockchains or data sources.

---

## API Endpoints

### Client-side (Next.js Route Handlers)
- `GET /api/account/:address/balance` — Get wallet balance
- `GET /api/account/:address/transactions` — Get recent transactions
- `GET /api/network` — Get or set current Solana network

### Server-side (Node.js/Prisma)
- `GET /api/user/:id` — Get user profile
- `POST /api/user/:id/wallet` — Link a wallet to user
- `GET /api/analytics/portfolio` — Portfolio analytics for authenticated user
- `GET /api/exchange-rates` — Get current exchange rates

> **Note:** Some endpoints may require authentication via JWT or session.

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- pnpm >= 10.x (recommended)
- PostgreSQL (for server-side database)

### Installation

```bash
# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys, database URL, etc.

# Run database migrations (server)
pnpm run db:migrate

# Start development server (client)
pnpm dev

# (Optional) Start backend API server
cd ../server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Environment Variables

- `NEXT_PUBLIC_SOLANA_MAINNET_RPC` — Solana mainnet RPC endpoint
- `NEXT_PUBLIC_SOLANA_DEVNET_RPC` — Solana devnet RPC endpoint
- `NEXT_PUBLIC_SOLANA_TESTNET_RPC` — Solana testnet RPC endpoint
- `DATABASE_URL` — PostgreSQL connection string (server)
- `EXTERNAL_API_KEY` — API key for exchange rates or analytics providers

> See `.env.example` for the full list and documentation.

---

## Development & Scripts

- `pnpm dev` — Start the Next.js development server
- `pnpm build` — Build for production
- `pnpm lint` — Run ESLint
- `pnpm test` — Run tests
- `pnpm db:migrate` — Run database migrations (server)

---

## Security & Best Practices
- All sensitive data is stored securely and never exposed to the client.
- Authentication required for protected routes and endpoints.
- Input validation and error handling throughout the stack.
- Follows modern TypeScript and ESLint standards.
- Responsive and accessible UI by design.

---

## License

MIT License. See [LICENSE](../LICENSE) for details.
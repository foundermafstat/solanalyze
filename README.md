![alt text](https://cdn.dorahacks.io/static/files/197114b00b74cec06fc3abd4e4e9eb0e.png@128h.webp)
# Solanalyze

A sophisticated full-stack Web3 application for portfolio analytics, wallet management, and blockchain data exploration. Built with Next.js, React, Tailwind CSS, shadcn/ui, TypeScript, and Prisma. The platform provides seamless integration with Solana wallets, real-time balance and transaction tracking, and a robust API for blockchain and exchange data, enhanced with AI-powered analytics and real-time market data through WebSockets.

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
- **AI-Powered Analytics**: Integrated AI agent that provides intelligent insights and recommendations based on your portfolio and market conditions, accessible through a WebRTC-powered chat interface.
- **Real-Time Market Data**: Live price charts and market data powered by OKX WebSocket API, ensuring up-to-the-second accuracy for all market information.
- **Real-Time Portfolio Dashboard**: View balances, recent transactions, and analytics for connected wallets with live updates.
- **Blockchain Explorer Links**: Direct links to Solana Explorer for all transactions.
- **Network Switching**: Easily toggle between Solana mainnet, devnet, and testnet.
- **Secure Authentication**: Only authenticated users can access sensitive account data.
- **Responsive UI**: Modern, accessible interface built with Tailwind CSS and shadcn/ui.
- **Backend API**: Unified endpoints for wallet data, exchange rates, and blockchain analytics.

---

## Architecture Overview

Solanalyze features a sophisticated, event-driven microservices architecture designed for high performance and scalability. The system's complexity is managed through clear separation of concerns and robust error handling.

```
client/ (Next.js, React, Tailwind, shadcn/ui)
├── app/
│   ├── api/            # API endpoints (Next.js route handlers)
│   ├── components/     # UI and layout components
│   ├── lib/            # Utilities (blockchain, API, AI integration, WebRTC)
│   └── styles/         # Tailwind and custom styles
└── ...

server/ (Node.js, Prisma, Axios)
├── src/
│   ├── api/            # REST API endpoints
│   ├── websocket/      # WebSocket server and message handlers
│   ├── ai/             # AI agent integration and processing
│   ├── prisma/         # Database schema and migrations
│   └── utils/          # Common backend logic, WebRTC signaling
└── ...
```

### System Complexity Highlights
- **Bi-directional Communication**: Real-time data flow between client and server using WebSockets
- **AI Integration**: On-demand AI processing with WebRTC for low-latency communication
- **Data Synchronization**: Complex state management for real-time updates across components
- **Error Resilience**: Comprehensive error handling and reconnection logic for WebSocket connections
- **Performance Optimization**: Efficient data processing and rendering for real-time chart updates

---

## Client Implementation

- **Framework**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui 2.1.8, TypeScript 5+
- **Real-time Data Visualization**: Interactive charts powered by OKX WebSocket API, displaying live market data with minimal latency.
- **AI Chat Interface**: WebRTC-based chat interface for interacting with the AI agent, providing instant portfolio analysis and market insights.
- **Wallet Integration**: Uses `@solana/wallet-adapter-react` for secure wallet connection and state management.
- **Network Selection**: State is persisted in `localStorage` and can be changed via the UI.
- **WebSocket Management**: Robust WebSocket connection handling with automatic reconnection and error recovery.
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
# Change directory to client
cd client

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
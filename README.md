# AgentPay - AI Agent Payment Protocol

> 🏆 Built for the M1 Hackathon powered by Replit

Payment infrastructure for the agentic internet. AI agents pay each other for services in real-time using the x402 protocol on Movement Network.

## 🚀 Features

- **x402 Payment Protocol** - HTTP-native micropayments for every API request
- **Privy Embedded Wallets** - Seamless onboarding, no seed phrases required
- **Movement Network** - Fast, low-cost transactions perfect for micropayments
- **Agent Marketplace** - Discover and monetize AI services
- **Real-time Analytics** - Track earnings, spending, and service performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Movement Network (Testnet)
- **Authentication**: Privy SDK (Embedded Wallets)
- **Payments**: x402 Protocol
- **Styling**: Custom CSS Design System

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Privy Account ([Get one here](https://dashboard.privy.io))

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Abhishekgoyal007/AgentPay.git
cd AgentPay
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
# Create .env.local with the following:
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
MOVEMENT_PAY_TO=your-wallet-address
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Privy Setup

1. Create an account at [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app
3. Copy your App ID to \`NEXT_PUBLIC_PRIVY_APP_ID\`
4. Configure login methods (Email, Google, Twitter, Wallet)

### Movement Network

The app is configured to use Movement Bardock Testnet. Get test MOVE tokens from the [Movement Faucet](https://faucet.movementlabs.xyz).

## 📚 x402 Payment Flow

1. Client requests a service via HTTP
2. Server returns \`402 Payment Required\` with payment requirements
3. Client signs payment transaction using Privy wallet
4. Client resends request with payment signature in \`X-PAYMENT\` header
5. Server verifies payment and executes service
6. Response returned with payment receipt

## 🎯 Hackathon Challenges

This project targets:

- ✅ **Best x402 App on Movement** - Novel use of x402 payment rails
- ✅ **Best App Using Privy Wallets** - Seamless embedded wallet UX
- ✅ **Best Consumer App on Movement** - Agent marketplace for daily use

## 📁 Project Structure

\`\`\`
agentpay/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes with x402
│   │   ├── dashboard/         # Dashboard pages
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   └── marketplace/       # Marketplace components
│   ├── lib/                   # Utilities and config
│   ├── providers/             # React context providers
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── README.md
\`\`\`

## 🔗 Links

- [Movement Network](https://movementnetwork.xyz)
- [x402 Protocol](https://x402.org)
- [Privy](https://privy.io)
- [Movement Developer Portal](https://developer.movementnetwork.xyz)

## 📄 License

MIT

---

Built with ❤️ for the M1 Hackathon

# 🚀 AgentPay - AI Agent Payment Protocol on Movement

> **The payment infrastructure for the agentic internet.** AI agents pay each other for services in real-time using the x402 protocol on Movement Network.

[![Movement Network](https://img.shields.io/badge/Movement-Network-purple)](https://movementlabs.xyz/)
[![x402](https://img.shields.io/badge/x402-Protocol-blue)](https://x402.org)
[![Privy](https://img.shields.io/badge/Privy-Auth-green)](https://privy.io)

## 🏆 M1 Hackathon Submission

AgentPay is our submission for the Movement M1 Hackathon, targeting:
- **x402 Global Payments Challenge** - Native integration with x402 protocol for instant micropayments
- **DeFi Challenge** - Enabling financial transactions between AI agents
- **Best UX Challenge** - Premium dark theme UI with seamless wallet experience

## ✨ Features

### 🤖 AI Agent Management
- Create and manage AI agents with embedded wallets
- Deploy services that can be monetized via x402
- Track earnings, requests, and ratings

### 💸 x402 Payment Protocol
- HTTP-native micropayments for AI services
- Pay-per-request pricing model
- Instant settlement on Movement Network
- No subscriptions, no overhead - just atomic payments

### 🛒 Service Marketplace
- Browse AI services from other agents
- GPT-4 text generation, image creation, translation, and more
- One-click execution with automatic payment

### 📊 Analytics Dashboard
- Real-time transaction tracking
- Revenue and spending analytics
- Service usage insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhishekgoyal007/AgentPay.git
cd AgentPay

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Mode
The app works in **Demo Mode** by default - you can explore all features with simulated transactions!

### Enable Real Wallets (Optional)

To enable Privy authentication with real embedded wallets:

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Copy your App ID (starts with `cl`)
4. Create `.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

5. Restart the dev server

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom CSS Design System
- **Auth & Wallets**: Privy (embedded wallets)
- **Payments**: x402 Protocol
- **Blockchain**: Movement Network (MEVM)

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── dashboard/          # Dashboard pages
│   │   ├── agents/        # Agent management
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── marketplace/   # Service marketplace
│   │   │   └── [serviceId]/ # Service detail & execution
│   │   └── transactions/  # Transaction history
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
├── hooks/                 # Custom hooks
│   ├── useWallet.ts       # Wallet state & transactions
│   ├── useAgents.ts       # Agent management
│   └── useX402Service.ts  # Service execution with x402
├── providers/             # Context providers
└── lib/                   # Utilities & config
```

## 🔒 x402 Payment Flow

```
1. Client requests service with payment signature
2. Server verifies payment atomically
3. Service executes
4. Result + receipt returned instantly
```

This enables:
- **Sub-second payments** - No waiting for confirmations
- **Atomic execution** - Payment and service are inseparable
- **No trust required** - Cryptographic verification

## 🎯 Use Cases

1. **AI-to-AI Commerce**
   - Agents purchasing compute from other agents
   - Automated data pipeline payments

2. **Micropayment APIs**
   - Pay-per-query AI services
   - Per-image generation pricing

3. **Autonomous Agents**
   - Self-funding agents that earn and spend
   - No human intervention needed

## 🔮 Roadmap

- [ ] Real x402 facilitator integration
- [ ] Move smart contract for escrow
- [ ] Multi-chain support
- [ ] Agent-to-agent direct messaging
- [ ] Service reputation system

## 👥 Team

Built with ❤️ for the Movement M1 Hackathon

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**AgentPay** - Where AI agents transact seamlessly 🚀

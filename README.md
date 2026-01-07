# 🚀 AgentPay - AI Agent Payment Protocol on Movement

> **The payment infrastructure for the agentic internet.** AI agents pay each other for services in real-time using the x402 protocol on Movement Network.

[![Movement Network](https://img.shields.io/badge/Movement-Bardock_Testnet-purple)](https://movementlabs.xyz/)
[![x402](https://img.shields.io/badge/x402-Protocol_v2-blue)](https://x402.org)
[![Privy](https://img.shields.io/badge/Privy-Embedded_Wallets-green)](https://privy.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🏆 M1 Hackathon Submission

AgentPay is our submission for the **Movement M1 Hackathon**, targeting multiple challenges:

| Challenge | Why AgentPay Fits |
|-----------|------------------|
| **🥇 Best x402 App on Movement** | Native x402 implementation with HTTP 402 responses, PAYMENT-SIGNATURE headers, and atomic payments |
| **🥈 Best App Using Privy Wallets** | Seamless embedded wallet creation & transaction signing |
| **🥉 Best DeFi App** | Financial infrastructure enabling agent-to-agent micropayments |

---

## 💡 The Problem

AI agents need to pay for services. Current solutions are broken:

- ❌ **API Keys** - Security risk, require manual management
- ❌ **Subscriptions** - Over-pay or run out of credits
- ❌ **Credit Cards** - High fees, minimum payments, manual KYC

## ✅ The Solution: x402 on Movement

AgentPay implements the **x402 protocol** - an open, HTTP-native payment standard that enables:

```
Agent A wants to use Agent B's GPT service

1. Agent A → Request: GET /api/services/gpt
2. Server  ← Response: HTTP 402 Payment Required
   └─ PAYMENT-REQUIRED header with price, network, wallet
3. Agent A → Signs payment on Movement Network
4. Agent A → Retries with PAYMENT-SIGNATURE header
5. Server  → Verifies, executes, returns result
6. Agent B ← Receives payment instantly
```

**Zero accounts. Zero API keys. Atomic execution.**

---

## ✨ Features

### 🤖 AI Agent Marketplace
- Browse and discover AI services from other agents
- GPT-4 text generation, image creation, translation, code review, and more
- One-click execution with automatic x402 payment

### � x402 Payment Protocol
- **HTTP 402 Payment Required** - Native HTTP status code integration
- **PAYMENT-REQUIRED Header** - Base64-encoded payment requirements
- **PAYMENT-SIGNATURE Header** - Signed payment proof
- **PAYMENT-RESPONSE Header** - Settlement confirmation
- **CAIP-2 Network Identifiers** - `eip155:30732` for Movement Bardock

### 🔐 Privy Embedded Wallets
- Email/social login with automatic wallet creation
- No seed phrases or MetaMask required
- Secure transaction signing
- Movement Network ready out of the box

### 📊 Real-time Analytics
- Track earnings and spending
- Monitor service usage
- View complete transaction history with x402 verification

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Custom Design System |
| **Auth & Wallets** | Privy (embedded wallets) |
| **Payments** | x402 Protocol v2 (`@x402/core`, `@x402/evm`, `@x402/next`) |
| **Blockchain** | Movement Bardock Testnet (Chain ID: 30732) |
| **Transaction Library** | viem, ethers.js |

---

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
The app works in **Demo Mode** by default - you can explore all features with simulated transactions on Movement Testnet!

### Enable Real Privy Wallets (Optional)

To enable Privy authentication with real embedded wallets:

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Enable Movement Network (Chain ID: 30732)
4. Copy your App ID (starts with `cl` or `cm`)
5. Create `.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

6. Restart the dev server

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── api/
│   │   └── services/[serviceId]/ # x402 payment verification API
│   ├── dashboard/
│   │   ├── agents/               # Agent management
│   │   ├── analytics/            # Revenue & usage analytics
│   │   ├── marketplace/          # Service marketplace
│   │   │   └── [serviceId]/      # Service detail & x402 execution
│   │   └── transactions/         # Transaction history
│   └── page.tsx                  # Landing page
├── components/                   # React components
├── hooks/
│   ├── useRealWallet.ts          # Wallet state & x402 payments
│   ├── useX402Service.ts         # Service execution with x402
│   ├── useAgents.ts              # Agent management
│   └── useMarketplace.ts         # Marketplace state
├── lib/
│   ├── x402-config.ts            # x402 protocol configuration
│   └── privy-config.ts           # Privy & Movement config
└── providers/
    └── PrivyProvider.tsx         # Auth context
```

---

## 🔒 x402 Implementation Details

### Payment Requirements (Server → Client)

When a client requests a service without payment:

```json
{
  "status": 402,
  "headers": {
    "PAYMENT-REQUIRED": "base64(...)",
    "X-Price": "0.01 MOVE",
    "X-Network": "eip155:30732"
  },
  "body": {
    "error": "Payment Required",
    "x402": {
      "version": "2.0",
      "scheme": "exact",
      "network": "eip155:30732"
    }
  }
}
```

### Payment Signature (Client → Server)

After signing the payment:

```json
{
  "headers": {
    "PAYMENT-SIGNATURE": "base64({
      signature: '...',
      txHash: '0x...',
      from: '0x...',
      to: '0x...',
      amount: '1000000',
      network: 'eip155:30732',
      timestamp: 1704556800
    })"
  }
}
```

### Settlement Response (Server → Client)

After verification:

```json
{
  "headers": {
    "PAYMENT-RESPONSE": "base64({
      success: true,
      txHash: '0x...',
      settledAt: '2026-01-06T...'
    })"
  }
}
```

---

## 🎯 Use Cases

### 1. AI-to-AI Commerce
Agents autonomously purchasing compute, data, or services from other agents without human intervention.

### 2. Micropayment APIs  
Pay-per-request pricing models that finally make sense. No subscriptions, no overpaying.

### 3. Autonomous Agent Economy
Self-funding agents that earn by providing services and spend by consuming others.

---

## 💰 Revenue Model

AgentPay enables clear revenue generation:

1. **Service Providers** earn MOVE per request
2. **Platform** can take a small percentage fee
3. **No minimum payments** - micropayments as low as 0.001 MOVE

---

## 🔮 Roadmap

- [x] x402 protocol implementation
- [x] Privy embedded wallets
- [x] Movement testnet integration
- [x] Agent marketplace
- [ ] Real on-chain settlement via Movement
- [ ] Move smart contract for escrow
- [ ] Multi-chain support (Base, Solana)
- [ ] Agent-to-agent discovery protocol
- [ ] Real AI API integrations

---

## 🔗 Links

- **Live Demo**: [Coming soon on Vercel]
- **x402 Protocol**: [x402.org](https://x402.org)
- **Movement Network**: [movementlabs.xyz](https://movementlabs.xyz)
- **Privy**: [privy.io](https://privy.io)

---

## 👥 Team

Built with ❤️ for the **Movement M1 Hackathon**

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**AgentPay** - Where AI agents transact seamlessly 🚀

*The future is agentic. The payment rails are x402.*

</div>

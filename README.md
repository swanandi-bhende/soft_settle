# SoftSettle: AI Micro-Credit Network

Decentralized micro-credit infrastructure for AI agents using **off-chain state channels**, **reputation scoring**, and **instant USDC settlements**.


---

## 🎯 Quick Start

```bash
# Terminal 1: Start Backend
cd packages/backend && npm install && npm run dev

# Terminal 2: Start Frontend
cd packages/frontend && npm install && npm run dev

# Open browser
# Desktop: http://localhost:3000
# Mobile: http://your-ip:3000
```

**Then follow [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md) for complete flow (~5 min)**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   SoftSettle Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Next.js + RainbowKit)         Backend (Express)  │
│  ┌────────────────────────────────┐  ┌────────────────────┐ │
│  │ Dashboard                      │  │ REST API           │ │
│  │ ├─ Agent Registration          │  │ ├─ /register-agent │ │
│  │ ├─ Session Monitor             │  │ ├─ /init-session   │ │
│  │ ├─ Micro-Auth Flow             │  │ ├─ /micro-auth     │ │
│  │ ├─ Payout Modal                │  │ ├─ /close-session  │ │
│  │ └─ Integration Status           │  │ └─ /integrations  │ │
│  └────────────────────────────────┘  └────────────────────┘ │
│           ⬇️                                 ⬇️            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           Smart Contracts (Sepolia)                     ││
│  │  ┌──────────────────┐  ┌──────────────────────────────┐  │
│  │  │ ReputationManager│  │  SoftSettleChannel           │  │
│  │  │ ├─ Score Updates │  │  (Nitrolite State Channel)   │  │
│  │  │ └─ ENS Text Records│  │ ├─ Collateral Lock         │  │
│  │  └──────────────────┘  │ ├─ Session Management        │  │
│  │      Updates:          │ ├─ Fund Release              │  │
│  │   vnd.soft-settle     │ └─ Deficit Tracking           │  │
│  │   .score              │                               │  │
│  └──────────────────────────────────────────────────────┘│
│           ↓              ↓              ↓                   │
├─────────────────────────────────────────────────────────┤
│          Partner Integrations (4️⃣  3️⃣  5️⃣)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🟨 YELLOW NETWORK                  
│  ├─ Nitrolite Protocol                                      │   
│  ├─ State Channels                                          │     
│  └─ Off-chain Micro-Tx                                      │         
│                                                             │
│  🔵 CIRCLE/ARC                                              │
│  ├─ USDC Payouts                                            │  
│  ├─ Wallet Management                                       │        
│  └─ Deficit Handling                                        │                     
│                                                             │
│  🟣 ENS                                                     │
│  ├─ Reputation Scoring                                      │    
│  ├─ Text Records                                            │        
│  └─ Credit Management                                       │                     
│                                                         
└──────────────────────────────────
```

---

## 📊 System Flow

```
User Flow                     On-Chain Events        Off-Chain State

1. Register Agent ────────→ (ENS Record Created)
   ✅ Wallet Connected
   ✅ Agent ID assigned
   ✅ Initial score: 500

2. Create Session ────────→ (Collateral Locked)
   ✅ Session ID generated      (SoftSettleChannel)
   ✅ $50 collateral held
   ✅ Nitrolite channel ready

3. Open Nitrolite ───────→ (Channel Initialized)
   ✅ Yellow SDK active           [Off-chain ready]

4. Micro-Auth (x4) ──────→  ✅ Balance updates
   ✅ Sign EIP-712                [State tracking]
   ✅ Verify signature            [No gas cost]
   ✅ Update balance              [100ms/tx]

5. Close & Settle ───────→ (Settlement Finalized)
   ✅ Final state committed       (SoftSettleChannel)
   ✅ Calculate deficit           (Circle ready)
   ✅ Update reputation           (ENS text record)
                             (ReputationManager)

Report                        Dashboard Updated
├─ Total transferred: $20     ✅ Score: 500 → 520
├─ Deficit: $0                ✅ Deals completed: 1
└─ Status: Successful          ✅ Reputation: Rising
```

---



## 📦 Project Structure

```
soft_settle/
├── packages/
│   ├── frontend/              # Next.js dashboard
│   │   ├── pages/
│   │   │   ├── index.tsx      # Landing page
│   │   │   ├── dashboard.tsx  # Main demo interface
│   │   │   ├── register.tsx   # Agent registration
│   │   │   └── monitor.tsx    # Session monitor
│   │   └── components/         # Reusable UI components
│   │
│   ├── backend/               # Express.js server
│   │   └── src/
│   │       ├── index.ts       # Main API server (8 endpoints)
│   │       └── integrations/
│   │           ├── circle.ts     # Circle API wrapper
│   │           ├── ens.ts        # ENS resolver
│   │           └── ipfs.ts       # Logging (optional)
│   │
│   └── contracts/             # Solidity smart contracts
│       ├── contracts/
│       │   ├── SoftSettleChannel.sol    # State channel
│       │   ├── ReputationManager.sol    # ENS reputation
│       │   └── NitroliteCore.sol        # Base protocol
│       └── scripts/
│           └── deploy.ts      # Sepolia deployment
│
├── DEMO_WALKTHROUGH.md        # Step-by-step demo (NEW)
└── README.md                  # This file
```

---

## 🚀 Deployment Status

| Component | Network | Status | Address |
|-----------|---------|--------|---------|
| ReputationManager | Sepolia | ✅ Deployed | `0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa` |
| SoftSettleChannel | Sepolia | ✅ Deployed | `0xB3A0E90884340019fFaA90e8Eb971E71396113e1` |
| Frontend | Localhost | ✅ Running | `http://localhost:3000` |
| Backend API | Localhost | ✅ Running | `http://localhost:4000` |

---

## 🧪 Testing the Demo

### Prerequisites
- Node.js 18+
- MetaMask or wallet (for frontend)
- Sepolia testnet tokens (optional; demo uses mock data)

### Run Demo (5 minutes)
1. Start backend: `cd packages/backend && npm run dev`
2. Start frontend: `cd packages/frontend && npm run dev`
3. Open http://localhost:3000
4. Follow [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)

### API Testing (cURL)

```bash
# Register agent
curl -X POST http://localhost:4000/api/register-agent \
  -H "Content-Type: application/json" \
  -d '{"agentId":"agent1","walletAddress":"0x123"}'

# Check integrations
curl http://localhost:4000/api/integrations

# Create session
curl -X POST http://localhost:4000/api/init-session \
  -H "Content-Type: application/json" \
  -d '{"consumerId":"agent1","providerId":"agent2","collateralAmount":50}'
```

---

## 📝 API Reference

| Endpoint | Method | Purpose | Track |
|----------|--------|---------|-------|
| `/api/register-agent` | POST | Register agent + ENS | ENS |
| `/api/query-reputation/:id` | GET | Fetch credit score | ENS |
| `/api/init-session` | POST | Create session (collateral lock) | Yellow |
| `/api/yellow/open-channel` | POST | Open Nitrolite channel | Yellow |
| `/api/micro-auth` | POST | Off-chain payment signature | Yellow |
| `/api/close-session` | POST | Settle + trigger payout | Circle |
| `/api/monitor-session/:id` | GET | Live session tracking | - |
| `/api/integrations` | GET | Integration status | All |


---

## 🎓 Learning Resources

- [Yellow Network Docs](https://yellow.org/docs)
- [Circle Developer Docs](https://developers.circle.com)
- [ENS Resolver Guide](https://docs.ens.domains/ensip-5-text-records)
- [Hardhat Deployment](https://hardhat.org/hardhat-runner/docs/guides/deploying)

---

## 📄 License

MIT

---


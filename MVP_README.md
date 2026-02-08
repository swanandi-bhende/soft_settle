# SoftSettle MVP - HackMoney 2026

**High-Speed Micro-Credit Layer for AI Agents**

Combining state-channel payments (Yellow Network), USDC settlement (Circle), and reputation management (ENS) into a single MVP for rapid credit clearing.

---

## 🚀 Key Features (3 Partner Integrations)

### 💛 Yellow Network - Nitrolite State Channels
- **Feature**: Off-chain micropayment processing via Nitrolite state channels
- **Contract**: SoftSettleChannel (`0xB3A0E90884340019fFaA90e8Eb971E71396113e1`)
- **Demo**: Agents can open sessions with collateral locking
- **API**: `POST /api/init-session`, `POST /api/micro-auth`

### 💳 Circle/Arc - USDC Settlement
- **Feature**: Automatic USDC payouts on settlement via Circle Wallets on Arc
- **Integration**: Deficit detection triggers Arc USDC transfers
- **Demo**: Session closure automatically calculates and settles on-chain payouts
- **API**: `POST /api/close-session` (triggers Circle if deficit)

### 🆔 ENS - Reputation & Credit Scores
- **Feature**: Agent credit scores stored in ENS text records (`vnd.credit.score`)
- **Contract**: ReputationManager (`0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa`)
- **Demo**: Register agents with starting credit score (500), visible in dashboard
- **API**: `POST /api/register-agent`, `GET /api/query-reputation/:agentId`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│    Frontend (Next.js React Dashboard)   │ ← Displays all 3 integrations
└──────────────────┬──────────────────────┘
                   │ REST APIs
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────────────┐    ┌───▼────────┐
    │ Backend Node.js│    │ Blockchain │
    │ Express Server │    │ (Sepolia)  │
    └────┬──────┬───┘    └──────┬─────┘
         │      │               │
    ┌────▼─┐ ┌──▼──┐ ┌──────────▼──────────┐
    │Yellow│ │ENS  │ │ Circle/Arc         │
    │      │ │Repos│ │ (USDC Settlement)  │
    └──────┘ └─────┘ └────────────────────┘
```

---

## 📦 Project Structure

```
soft_settle/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts          (8 REST endpoints)
│   │   │   ├── integrations/
│   │   │   ├── models/
│   │   │   └── services/
│   │   └── package.json
│   │
│   ├── frontend/
│   │   ├── pages/
│   │   │   ├── dashboard.tsx      (Main MVP UI)
│   │   │   ├── index.tsx          (Landing page)
│   │   │   └── register.tsx
│   │   └── package.json
│   │
│   ├── contracts/
│   │   ├── contracts/             (Solidity 0.8.x)
│   │   │   ├── ReputationManager.sol (ENS integration)
│   │   │   ├── SoftSettleChannel.sol (Yellow Network)
│   │   │   └── NitroliteCore.sol
│   │   ├── scripts/deploy_direct.js (✅ Deployed to Sepolia)
│   │   └── hardhat.config.ts
│   │
│   └── offchain/
│       └── sessionTracker.ts
│
├── DEPLOYMENT.md                   (Deployment instructions)
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Backend (Node.js)

```bash
cd packages/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server (runs on port 4000)
npm start
```

Health check:
```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"..."}
```

### 2. Frontend (Next.js)

```bash
cd packages/frontend

# Install dependencies  
npm install

# Start dev server (runs on port 3000)
npm run dev
```

Navigate to: `http://localhost:3000/dashboard`

### 3. Test Endpoints

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full API testing guide.

---

## 🌐 Live Demo (Deployed)

Once deployed:
- **Frontend**: `https://softsettle.vercel.app` → Dashboard UI
- **Backend**: `https://softsettle-backend.railway.app` → REST APIs
- **Blockchain**: All contracts on **Sepolia testnet**

---

## 📊 Dashboard Demo Flow

1. **Register Agent** (Shows ENS Integration)
   - Enter agent ID (e.g., `alice.eth`)
   - Click "Register Agent" button
   - Agent appears in list with credit score

2. **Create Session** (Shows Yellow + Circle Integration)
   - Click "+ New Session" button
   - New session appears with:
     - Yellow Network collateral ($)
     - Circle Arc balance ($)
     - Real-time progress bar

3. **View Integration Status**
   - All 3 partners shown at top:
     - 💛 Yellow Network (✓ LIVE)
     - 💳 Circle/Arc (✓ LIVE)
     - 🆔 ENS (✓ LIVE)

---

## 🔗 Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| **ReputationManager** | `0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa` |
| **SoftSettleChannel** | `0xB3A0E90884340019fFaA90e8Eb971E71396113e1` |

View on Etherscan:
- https://sepolia.etherscan.io/address/0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa
- https://sepolia.etherscan.io/address/0xB3A0E90884340019fFaA90e8Eb971E71396113e1

---

## 📝 REST API Endpoints

All endpoints return JSON responses with demo data.

### Health & Integration Status
```
GET  /health                                    # Server health
GET  /api/integrations                          # All 3 partner statuses
```

### Agents (ENS Integration)
```
POST /api/register-agent                        # Register with ENS
GET  /api/agents                                # List all agents
GET  /api/query-reputation/:agentId             # Query ENS credit score
```

### Sessions (Yellow + Circle Integration)
```
POST /api/init-session                          # Create Nitrolite session (Yellow)
GET  /api/sessions                              # List active sessions
GET  /api/monitor-session/:sessionId             # Real-time progress (Yellow)
```

### Settlement
```
POST /api/micro-auth                            # Off-chain micro-auth signing (Yellow)
POST /api/close-session                          # Settlement (Circle Arc payout)
```

---

## 💰 Prize Categories

| Partner | Prize | Status |
|---------|-------|--------|
| **Yellow Network** | $15,000 | ✅ Integrated (Nitrolite channels) |
| **Circle** | $10,000 | ✅ Integrated (Arc USDC) |
| **ENS** | $5,000 | ✅ Integrated (Reputation) |

---

## 🎯 Hackathon Submission

### What's Included:

✅ **Working MVP** with 3 partner integrations  
✅ **Live Demo URLs** (Vercel + Railway)  
✅ **Deployed Contracts** on Sepolia (verified)  
✅ **REST Backend** with 8 functional endpoints  
✅ **React Dashboard** showing all integrations  
✅ **2-3 Min Demo Video** (link in submission)  

### How to Test:

1. Visit: `https://softsettle.vercel.app`
2. Go to Dashboard
3. Register an agent (ENS)
4. Create a session (Yellow + Circle)
5. View integration status (all 3 partners live)

---

## 🛠️ Build & Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Railway backend deployment
- Vercel frontend deployment
- Environment configuration
- Demo video recording guide

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for common issues
2. Review backend logs: `npm run dev` in `packages/backend/`
3. Check frontend browser console for API errors

---

**Built for HackMoney 2026**  
Combining Yellow Protocol, Circle USDC, and ENS into a unified credit layer.

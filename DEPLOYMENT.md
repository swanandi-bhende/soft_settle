# SoftSettle MVP - Deployment Guide

## Quick Deploy (2 min)

### Backend → Railway.app

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy backend
cd packages/backend
railway up

# 4. Set environment variables in Railway dashboard:
# - SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
# - SEPOLIA_PRIVATE_KEY=your_private_key
```

Expected: Backend live at `https://[your-project].railway.app`

---

### Frontend → Vercel  

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend
cd packages/frontend
vercel --prod

# 3. Configure environment (optional)
# - NEXT_PUBLIC_API_URL = https://[backend-railway-url]

# 4. Accept defaults to link to GitHub
```

Expected: Frontend live at `https://[project-name].vercel.app`

---

## Demo Video Flow

1. **Register Agent** (ENS Integration)
   - Enter agent ID: `alice.eth`
   - Click "Register Agent"
   - Show registration success

2. **Create Session** (Yellow Network + Circle)
   - Click "+ New Session"
   - Show active session with Yellow collateral + Circle balance
   - Show progress bar

3. **Integration Status**
   - Scroll up to show all 3 partner badges (Yellow, Circle, ENS)
   - Highlight that all are "✓ LIVE"

4. **Agent List**
   - Show registered agents with credit score (ENS)

---

## Deployed Contracts (Sepolia)

- **ReputationManager**: `0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa`
- **SoftSettleChannel**: `0xB3A0E90884340019fFaA90e8Eb971E71396113e1`

---

## Backend API Endpoints

```
GET  http://localhost:4000/health
POST http://localhost:4000/api/register-agent
GET  http://localhost:4000/api/query-reputation/:agentId
POST http://localhost:4000/api/init-session
POST http://localhost:4000/api/micro-auth
POST http://localhost:4000/api/close-session
GET  http://localhost:4000/api/sessions
GET  http://localhost:4000/api/agents
GET  http://localhost:4000/api/integrations
```

All endpoints return JSON with demo data for integration showcase.

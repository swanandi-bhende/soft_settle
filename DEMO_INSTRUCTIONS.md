# 🎥 Demo Video + Submission Guide

## Step 1: Deploy Both Services (10 minutes)

### Deploy Backend to Railway.app

```bash
# 1. Go to railway.app and sign up/login
# 2. Create new project from this repo:
#    GitHub → Select: soft_settle
#    → Select: packages/backend

# 3. Set Environment Variables in Railway:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_PRIVATE_KEY=your_private_key
PORT=4000
REPUTATION_MANAGER_ADDRESS=0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa
SOFT_SETTLE_CHANNEL_ADDRESS=0xB3A0E90884340019fFaA90e8Eb971E71396113e1

# 4. Deploy automatically
# → Railway URL: https://[project-name].railway.app
```

### Deploy Frontend to Vercel

```bash
# 1. Go to vercel.com and sign up/login
# 2. Import project from GitHub:
#    → Select: soft_settle repo
#    → Select: packages/frontend (set as root)

# 3. Set Environment Variables:
NEXT_PUBLIC_API_URL=https://[backend-railway-url].railway.app

# 4. Deploy
# → Vercel URL: https://[project-name].vercel.app
```

**Wait for both to finish deploying (~5 minutes)**

---

## Step 2: Test Live URLs (5 minutes)

### Test Backend API
```bash
# Open terminal and test:
curl https://[backend-railway-url].railway.app/health
# Should return: {"status":"ok","timestamp":"..."}

curl https://[backend-railway-url].railway.app/api/integrations
# Should return: yellow, circle, ens all "✓ Configured"
```

### Test Frontend
```bash
# Open browser:
https://[frontend-vercel-url]/dashboard
# Should load dashboard UI with integration badges
```

---

## Step 3: Record Demo Video (10 minutes)

**Use OBS, ScreenFlow, Camtasia, or browser's screen recorder**

### Demo Script (2-3 minutes):

#### Scene 1: Landing Page (10 sec)
- Go to: `https://[frontend-vercel-url]/`
- Show the hero section: "SoftSettle - Micro-Credit Layer for AI Agents"
- Click "Enter Dashboard" button
- Narrate: "SoftSettle combines three major protocols for fast credit settling"

#### Scene 2: Integration Status (30 sec)
- Show top section with 3 integration badges
- Point to each:
  - **💛 Yellow Network** - "Off-chain state channels for micropayments"
  - **💳 Circle/Arc** - "USDC settlement layer"
  - **🆔 ENS** - "Agent reputation and credit scoring"
- Narrate: "All three partnerships are live and integrated"

#### Scene 3: Register Agent - ENS Integration (45 sec)
- Left panel: "Agent Registration"
- Type agent ID: `alice.eth`
- Click "Register Agent" button
- Show success (agent appears in list)
- Highlight credit score (500) below name
- Narrate: "When we register an agent, their credit score is stored via ENS text records. Starting score is 500 for new agents."

#### Scene 4: Create Session - Yellow + Circle (60 sec)
- Right panel: "+ New Session" button
- Click it (requires 2+ agents registered)
- Show new session card appearing:
  - **Session ID**: `sess_...`
  - **Status**: ACTIVE (green)
  - **Progress Bar**: Animating from 0% → 100%
  - **Yellow Collateral**: $100 USDC
  - **Circle Balance**: $100 USDC
  - **Badges**: 💛 Yellow Nitrolite Channel | 💳 Circle Arc USDC
- Narrate: "Creating a session opens a Yellow Network state channel. We lock $100 as collateral via Yellow's Nitrolite protocol. Circle Arc is standing by to settle any deficits once we close the session."

#### Scene 5: Technical Overview (30 sec)
- Go back to dashboard top
- Show contract addresses in text (screenshot or doc):
  ```
  ReputationManager: 0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa
  SoftSettleChannel: 0xB3A0E90884340019fFaA90e8Eb971E71396113e1
  Network: Sepolia Testnet
  ```
- Narrate: "Both contracts are deployed on Sepolia testnet. All APIs are live and connected to these on-chain components."

#### Outro (30 sec)
- Show dashboard one more time
- Close with: "With SoftSettle, AI agents can settle thousands of transactions for pennies using state channels, store reputation on ENS, and instantly settle deficits with USDC via Circle. Built for HackMoney 2026."

---

## Step 4: Upload & Submit (5 minutes)

### Upload Demo Video

1. **YouTube** (recommended for hackathons):
   ```
   - Upload to YouTube as "Unlisted"
   - Title: "SoftSettle MVP - HackMoney 2026"
   - Description: Paste deployment URLs
   ```

2. **Get Video URL**: 
   ```
   https://youtu.be/[video-id]
   ```

### Gather Submission Info

```markdown
# SoftSettle MVP - HackMoney 2026 Submission

## Live Demo URLs
- **Dashboard**: [Frontend Vercel URL]
- **Backend API**: [Backend Railway URL]/api/integrations
- **GitHub Repo**: [GitHub link]

## Deployment Info
- Frontend: Vercel (Next.js)
- Backend: Railway (Node.js Express)
- Blockchain: Sepolia testnet

## Deployed Contracts
- ReputationManager (ENS): 0x7C81049B93bc487a1ff4f3B00f98d3A990f84FBa
- SoftSettleChannel (Yellow): 0xB3A0E90884340019fFaA90e8Eb971E71396113e1

## Demo Video
[YouTube Unlisted Link]

## Partner Integrations
✅ Yellow Network - Nitrolite State Channels ($15k prize)
✅ Circle/Arc - USDC Settlement ($10k prize)
✅ ENS - Reputation & Credit Scores ($5k prize)

## How to Test
1. Visit [Frontend URL]
2. Go to Dashboard
3. Register agent (shows ENS integration)
4. Create session (shows Yellow + Circle working)
5. See all 3 partners live on dashboard
```

### Submit to Hackathon Portal

1. Go to: **hackathon-portal.example.com** (or provided link)
2. Fill in:
   - **Project Name**: SoftSettle MVP
   - **GitHub Repository**: [Your repo link]
   - **Live Demo URL**: [Frontend Vercel link]
   - **Demo Video**: [YouTube link]
   - **Description**: Copy from above
   - **Track Selection**: Choose all 3 partner tracks (Yellow, Circle, ENS)

3. **Upload**: Cover image (can be screenshot of dashboard)

4. **Submit** ✅

---

## ✅ Final Checklist

Before you submit:

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel  
- [ ] `/api/integrations` returns all 3 partners ✓ LIVE
- [ ] Dashboard loads at [Vercel URL]/dashboard
- [ ] Can register agent successfully
- [ ] Can create session with 2+ agents
- [ ] Demo video recorded (2-3 min)
- [ ] Video uploaded to YouTube (Unlisted)
- [ ] GitHub repo is public
- [ ] README.md and DEPLOYMENT.md are in repo root
- [ ] Submission form filled and submitted

---

## 🚨 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend not starting | Check Rails env vars (SEPOLIA_RPC_URL, PRIVATE_KEY) |
| Frontend can't reach API | Check NEXT_PUBLIC_API_URL env var in Vercel |
| Dashboard shows "Loading..." | Check browser console for CORS or fetch errors |
| Integration status shows "N/A" | Backend `/api/integrations` might be down; restart it |

---

## 📤 You're Ready!

Once deployed:
1. ✅ Backend running
2. ✅ Frontend running
3. ✅ All 3 integrations showing
4. ✅ Demo recorded
5. ✅ Submitted!

**Total time: ~40 minutes**

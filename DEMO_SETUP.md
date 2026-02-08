# SoftSettle Local Demo Setup & Run Guide

## Quick Start (Easiest)

### Windows - Using Batch Script
Double-click `START_DEMO.bat` in the root directory. This will automatically:
- Start the backend server (port 4000)
- Start the frontend dev server (port 3000)
- Open two terminal windows

### Windows - Using PowerShell Script
```powershell
.\START_DEMO.ps1
```

---

## Manual Setup (Step by Step)

### Prerequisites
- **Node.js 18+** installed on your machine
- **npm** (comes with Node.js)

### 1. Initial Setup (One-time)

Navigate to the project root and install all dependencies:

```bash
cd D:\Documents\Swanandi_Projects\soft_settle
npm install --legacy-peer-deps
```

### 2. Build Backend

```bash
cd packages\backend
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 3. Start Backend Server

```bash
cd packages\backend
npm start
```

Backend will run on **http://localhost:4000**

Expected output:
```
Server running on http://localhost:4000
```

### 4. In Another Terminal - Start Frontend Dev Server

```bash
cd packages\frontend
npm run dev
```

Frontend will run on **http://localhost:3000**

---

## Testing the App

1. **Open your browser** to http://localhost:3000
2. **Navigate to the dashboard** to see real-time session data
3. **Check endpoints**:
   - Frontend: http://localhost:3000
   - Backend Health: http://localhost:4000/health
   - Backend API: http://localhost:4000/api/sessions

---

## Available Backend Endpoints (for demo)

```
GET  /health                          - Health check
GET  /api/sessions                    - Get all active sessions
GET  /api/agents                      - Get all agents
POST /api/register-agent              - Register new agent
POST /api/init-session               - Initialize a settlement session
POST /api/close-session              - Close session and settle
GET  /api/query-reputation/:agentId   - Query agent reputation
GET  /api/monitor-session/:sessionId  - Monitor active session
```

---

## Troubleshooting

### "npm command not found"
- Ensure Node.js is installed: Run `node --version`
- If not installed, download from https://nodejs.org/

### Port already in use
- Backend uses port 4000, frontend uses port 3000
- If ports are occupied, kill the process using the port or change it in your code

### Dependency issues
- Run `npm install --legacy-peer-deps` from the root directory again
- Delete `node_modules` folders and reinstall if problems persist

### TypeScript compilation errors
- Run `npm run build` in the backend folder to see details
- Ensure TypeScript types are installed: `npm install --save-dev @types/node @types/express`

---

## Development Workflow

### To make changes to backend:
1. Edit files in `packages/backend/src/`
2. Run `npm run build` to compile
3. Restart the backend server

### To make changes to frontend:
1. Edit files in `packages/frontend/` (pages/, components/, lib/)
2. Changes hot-reload automatically in dev mode
3. No restart needed

---

## Building for Production

### Backend
```bash
cd packages/backend
npm run build
npm start  # Runs the compiled dist/index.js
```

### Frontend
```bash
cd packages/frontend
npm run build
npm start  # Starts Next.js production server
```

---

## Project Structure

```
soft_settle/
├── packages/
│   ├── backend/          - Express.js + Apollo GraphQL server
│   │   ├── src/
│   │   ├── dist/         - Compiled output (after npm run build)
│   │   └── package.json
│   ├── frontend/         - Next.js React app
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   └── contracts/        - Hardhat smart contracts
├── package.json          - Root workspace config
├── START_DEMO.bat        - Auto-start script (Windows)
└── START_DEMO.ps1        - Auto-start script (PowerShell)
```

---

## Need Help?

Check the README.md in the root directory for more details about the SoftSettle project.

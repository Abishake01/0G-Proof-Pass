# 0G ProofPass

> Decentralized Event Attendance Verification Platform on 0G Network

A Web3 application for verifying attendance and contributions at 0G events, featuring:
- MetaMask wallet integration
- Email OTP verification
- Proof of Attendance NFTs on 0G Chain
- Immutable photo/feedback storage on 0G Storage
- AI-powered contribution analysis via 0G Compute
- Tier-based rewards and badge upgrades

## Project Structure

```
0g-proof/
├── frontend/          # React + TypeScript frontend
├── backend/           # Express backend for OTP
├── contracts/         # Solidity smart contracts
└── docs/             # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- 0G testnet tokens (from https://faucet.0g.ai)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your SMTP credentials
npm run dev
```

### Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_OG_CHAIN_ID=16600
VITE_OG_RPC_URL=https://evmrpc-testnet.0g.ai
VITE_OG_STORAGE_INDEXER=https://indexer-storage-testnet-standard.0g.ai
VITE_EVENT_REGISTRY_ADDRESS=0x...
VITE_NFT_CONTRACT_ADDRESS=0x...
VITE_REWARD_TOKEN_ADDRESS=0x...
VITE_BACKEND_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```env
PORT=3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
OTP_EXPIRY_MINUTES=10
ZEROG_NETWORK=testnet
ZEROG_PRIVATE_KEY=0x...
```

## Development Status

- ✅ Phase 1: Project Foundation (Frontend + Backend setup)
- ⏳ Phase 2: Smart Contracts
- ⏳ Phase 3: Core Features
- ⏳ Phase 4: 0G Storage Integration
- ⏳ Phase 5: AI Analysis (0G Compute)
- ⏳ Phase 6: Rewards System
- ⏳ Phase 7: Profile & Dashboard
- ⏳ Phase 8: UI Polish

## Resources

- [0G Documentation](https://docs.0g.ai/)
- [0G Builder Hub](https://build.0g.ai/)
- [Chain Scan](https://chainscan-galileo.0g.ai/)
- [Storage Scan](https://storagescan-galileo.0g.ai/)
- [0G Faucet](https://faucet.0g.ai/)

## License

MIT


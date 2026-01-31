# Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **MetaMask** browser extension
3. **0G Testnet Tokens** from [faucet](https://faucet.0g.ai)
4. **Foundry** for contract deployment (optional for now)

## Step 1: Environment Setup

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with SMTP credentials and 0G compute settings
```

## Step 2: Install Dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

## Step 3: Deploy Smart Contracts (When Ready)

### Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install OpenZeppelin
```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### Deploy to 0G Galileo Testnet
```bash
# Set your private key
export PRIVATE_KEY=0x_your_private_key

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Update contract addresses in frontend/.env
```

## Step 4: Run Development Servers

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## Step 5: Connect Wallet

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Switch to 0G Galileo Testnet (chain ID: 16600)
5. If network not added, MetaMask will prompt to add it

## Step 6: Get Testnet Tokens

1. Visit https://faucet.0g.ai
2. Connect your wallet or paste address
3. Request testnet tokens (0.1 A0GI/day)

## Troubleshooting

### Wallet Connection Issues
- Ensure MetaMask is installed and unlocked
- Check that you're on the correct network (0G Galileo)
- Try disconnecting and reconnecting

### Backend OTP Not Sending
- Verify SMTP credentials in `backend/.env`
- For Gmail, use an App Password (not regular password)
- Check spam folder for OTP emails

### Contract Calls Failing
- Ensure contract addresses are set in `frontend/.env`
- Verify you have testnet tokens for gas
- Check browser console for error messages

### 0G Storage Issues
- SDK integration pending - placeholder structure in place
- Will be implemented when @0glabs/0g-ts-sdk is available

### 0G Compute Issues
- Ensure ZEROG_PRIVATE_KEY is set in backend/.env
- For testnet, you can use free providers
- Optional: Add OpenRouter fallback for reliability

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy with environment variables
```

### Contracts
- Deploy to 0G Mainnet (chain ID: 16661)
- Update contract addresses
- Verify on Chain Scan

## Environment Variables Checklist

### Frontend
- [ ] VITE_OG_CHAIN_ID
- [ ] VITE_OG_RPC_URL
- [ ] VITE_OG_STORAGE_INDEXER
- [ ] VITE_EVENT_REGISTRY_ADDRESS
- [ ] VITE_NFT_CONTRACT_ADDRESS
- [ ] VITE_REWARD_TOKEN_ADDRESS
- [ ] VITE_BACKEND_URL

### Backend
- [ ] PORT
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] OTP_EXPIRY_MINUTES
- [ ] ZEROG_NETWORK
- [ ] ZEROG_PRIVATE_KEY (optional)
- [ ] OPENROUTER_API_KEY (optional)
- [ ] OPENROUTER_MODEL (optional)


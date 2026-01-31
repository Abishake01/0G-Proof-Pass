import { defineChain } from 'viem';

// 0G Galileo Testnet Configuration
export const ogChain = defineChain({
  id: 16600,
  name: '0G Galileo Testnet',
  network: 'og-galileo',
  nativeCurrency: {
    name: '0G',
    symbol: 'OG',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
    public: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chain Scan',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
});

// 0G Storage Configuration
export const ogStorageConfig = {
  indexerRpc: 'https://indexer-storage-testnet-standard.0g.ai',
  evmRpc: 'https://evmrpc-testnet.0g.ai',
  flowContract: '0x0000000000000000000000000000000000000000', // Update after deployment
};

// Contract addresses (to be updated after deployment)
export const contractAddresses = {
  eventRegistry: import.meta.env.VITE_EVENT_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
  nft: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  rewardToken: import.meta.env.VITE_REWARD_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
};

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';


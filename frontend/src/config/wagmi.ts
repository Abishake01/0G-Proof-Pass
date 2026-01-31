import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { ogChain } from './chain';

export const config = createConfig({
  chains: [ogChain],
  connectors: [injected()],
  transports: {
    [ogChain.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}


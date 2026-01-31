import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { ogChain } from '../../config/chain';
import { formatAddress } from '../../utils/format';

export default function ConnectWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() });
      if (chainId !== ogChain.id) {
        await switchChain({ chainId: ogChain.id });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {chainId !== ogChain.id && (
          <button
            onClick={() => switchChain({ chainId: ogChain.id })}
            className="btn-secondary text-sm"
          >
            Switch to 0G
          </button>
        )}
        <div className="flex items-center gap-2 px-3 py-2 bg-bg-card rounded-lg border border-border">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="text-sm font-mono">{formatAddress(address)}</span>
        </div>
        <button onClick={() => disconnect()} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="btn-primary">
      Connect Wallet
    </button>
  );
}


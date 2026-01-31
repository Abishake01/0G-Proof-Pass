import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Link } from 'react-router-dom';
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
        <Link
          to={`/profile/${address}`}
          className="flex items-center gap-2 px-3 py-2 bg-[#1a1d25] rounded-lg border border-[#2a2d35] hover:border-violet-500 transition-colors"
        >
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="text-sm font-mono">{formatAddress(address)}</span>
        </Link>
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


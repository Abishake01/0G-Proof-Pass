import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseAbi } from 'viem';
import { contractAddresses } from '../../config/chain';
import { ContributionAnalysis, Tier } from '../../types';
import { Trophy, Loader2 } from 'lucide-react';

interface BadgeUpgradeProps {
  tokenId: number;
  analysis: ContributionAnalysis;
  onUpgradeComplete?: () => void;
}

export default function BadgeUpgrade({ tokenId, analysis, onUpgradeComplete }: BadgeUpgradeProps) {
  const { address } = useAccount();
  const [storageHash, setStorageHash] = useState('');
  
  const nftABI = parseAbi([
    'function upgradeBadge(uint256 tokenId, uint8 tier, uint256 score, string memory storageHash)',
  ]);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const getTierEnum = (tier: string): number => {
    if (tier === 'Champion') return Tier.Champion;
    if (tier === 'Contributor') return Tier.Contributor;
    return Tier.Attendee;
  };

  const handleUpgrade = async () => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await writeContract({
        address: contractAddresses.nft as Address,
        abi: nftABI,
        functionName: 'upgradeBadge',
        args: [
          BigInt(tokenId),
          getTierEnum(analysis.tier),
          BigInt(analysis.overallScore),
          storageHash || '',
        ],
      });
    } catch (err) {
      console.error('Upgrade error:', err);
    }
  };

  useEffect(() => {
    if (isConfirmed && onUpgradeComplete) {
      onUpgradeComplete();
    }
  }, [isConfirmed, onUpgradeComplete]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Champion':
        return 'text-yellow-400';
      case 'Contributor':
        return 'text-gray-300';
      default:
        return 'text-amber-600';
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className={`w-6 h-6 ${getTierColor(analysis.tier)}`} />
        <h3 className="text-xl font-semibold">Upgrade Badge</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Current Tier</span>
            <span className={`font-bold ${getTierColor(analysis.tier)}`}>
              {analysis.tier}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Contribution Score</span>
            <span className="font-bold text-accent-primary">{analysis.overallScore}/100</span>
          </div>
        </div>

        {analysis.tier !== 'Attendee' && (
          <div className="p-4 bg-accent-primary/10 border border-accent-primary rounded-lg">
            <p className="text-sm text-text-primary">
              Your contribution qualifies for <strong>{analysis.tier}</strong> tier!
              Upgrade your badge to reflect your achievement.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
            {error.message || 'Upgrade failed'}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={isPending || isConfirming || analysis.tier === 'Attendee'}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isPending ? 'Waiting for transaction...' : 'Confirming...'}
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4" />
              Upgrade to {analysis.tier}
            </>
          )}
        </button>

        {isConfirmed && (
          <div className="p-3 bg-success/20 border border-success rounded-lg text-success text-sm">
            ✓ Badge upgraded successfully!
          </div>
        )}
      </div>
    </div>
  );
}


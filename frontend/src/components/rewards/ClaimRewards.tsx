import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address, parseAbi, formatUnits } from 'viem';
import { contractAddresses } from '../../config/chain';
import { Trophy, Coins, Loader2, CheckCircle } from 'lucide-react';
import { formatTier } from '../../utils/format';

interface ClaimRewardsProps {
  eventId: number;
  tier: number; // 0: Attendee, 1: Contributor, 2: Champion
  tokenId: number; // NFT token ID
}

export default function ClaimRewards({ eventId, tier, tokenId }: ClaimRewardsProps) {
  const { address } = useAccount();
  const [hasClaimed, setHasClaimed] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<string>('0');

  const rewardTokenABI = parseAbi([
    'function claimReward(uint256 eventId, uint8 tier)',
    'function hasClaimed(address user, uint256 eventId) view returns (bool)',
    'function getRewardAmount(uint8 tier) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
  ]);

  // Check if already claimed
  const { data: claimed } = useReadContract({
    address: contractAddresses.rewardToken as Address,
    abi: rewardTokenABI,
    functionName: 'hasClaimed',
    args: address ? [address, BigInt(eventId)] : undefined,
    query: { enabled: !!address },
  });

  // Get reward amount
  const { data: amount } = useReadContract({
    address: contractAddresses.rewardToken as Address,
    abi: rewardTokenABI,
    functionName: 'getRewardAmount',
    args: [tier as 0 | 1 | 2],
  });

  // Get current balance
  const { data: balance } = useReadContract({
    address: contractAddresses.rewardToken as Address,
    abi: rewardTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (claimed !== undefined) {
      setHasClaimed(claimed as boolean);
    }
  }, [claimed]);

  useEffect(() => {
    if (amount) {
      setRewardAmount(formatUnits(amount as bigint, 18));
    }
  }, [amount]);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaim = async () => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (hasClaimed) {
      alert('Rewards already claimed for this event');
      return;
    }

    try {
      await writeContract({
        address: contractAddresses.rewardToken as Address,
        abi: rewardTokenABI,
        functionName: 'claimReward',
        args: [BigInt(eventId), tier as 0 | 1 | 2],
      });
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setHasClaimed(true);
    }
  }, [isConfirmed]);

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 2:
        return 'text-yellow-400';
      case 1:
        return 'text-gray-300';
      default:
        return 'text-amber-600';
    }
  };

  const getTierRewards = (tier: number) => {
    switch (tier) {
      case 2:
        return '100 OG';
      case 1:
        return '50 OG';
      default:
        return '10 OG';
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Coins className="w-6 h-6 text-accent-primary" />
        <h3 className="text-xl font-semibold">Claim Rewards</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Tier</span>
            <span className={`font-bold ${getTierColor(tier)}`}>
              {formatTier(tier)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Reward Amount</span>
            <span className="font-bold text-accent-primary">
              {rewardAmount} OG
            </span>
          </div>
          {balance && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-sm text-text-secondary">Your Balance</span>
              <span className="font-medium text-text-primary">
                {formatUnits(balance as bigint, 18)} OG
              </span>
            </div>
          )}
        </div>

        {hasClaimed ? (
          <div className="p-4 bg-success/20 border border-success rounded-lg">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Rewards already claimed for this event</span>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
                {error.message || 'Claim failed'}
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={isPending || isConfirming || hasClaimed || !address}
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
                  Claim {getTierRewards(tier)}
                </>
              )}
            </button>
          </>
        )}

        {isConfirmed && !hasClaimed && (
          <div className="p-3 bg-success/20 border border-success rounded-lg text-success text-sm">
            ✓ Rewards claimed successfully!
          </div>
        )}
      </div>
    </div>
  );
}


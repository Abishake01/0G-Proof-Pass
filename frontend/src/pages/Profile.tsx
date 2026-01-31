import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { Address, parseAbi, formatUnits } from 'viem';
import { contractAddresses } from '../config/chain';
import { contractService } from '../services/contracts';
import { Badge, UserProfile } from '../types';
import { formatAddress, formatDate, formatTier } from '../utils/format';
import { Trophy, Calendar, MapPin, Award, Coins, TrendingUp } from 'lucide-react';

export default function Profile() {
  const { address: urlAddress } = useParams<{ address: string }>();
  const { address: connectedAddress } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Use URL address or connected wallet
  const profileAddress = (urlAddress || connectedAddress) as Address;

  const rewardTokenABI = parseAbi([
    'function balanceOf(address account) view returns (uint256)',
  ]);

  const { data: rewardBalance } = useReadContract({
    address: contractAddresses.rewardToken as Address,
    abi: rewardTokenABI,
    functionName: 'balanceOf',
    args: profileAddress ? [profileAddress] : undefined,
    query: { enabled: !!profileAddress },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileAddress) {
        setLoading(false);
        return;
      }

      try {
        // Fetch badges
        const userBadges = await contractService.getOwnerBadges(profileAddress);
        setBadges(userBadges);

        // Calculate stats
        const totalBadges = userBadges.length;
        const totalScore = userBadges.reduce((sum, b) => sum + b.contributionScore, 0);
        const avgScore = totalBadges > 0 ? totalScore / totalBadges : 0;

        const profileData: UserProfile = {
          walletAddress: profileAddress,
          eventsAttended: totalBadges,
          totalBadges: totalBadges,
          totalRewards: rewardBalance ? formatUnits(rewardBalance as bigint, 18) : '0',
          averageScore: Math.round(avgScore),
          badges: userBadges,
        };

        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileAddress, rewardBalance]);

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 2:
        return 'text-yellow-400 border-yellow-400';
      case 1:
        return 'text-gray-300 border-gray-300';
      default:
        return 'text-amber-600 border-amber-600';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Profile</h1>
            <p className="text-text-secondary font-mono">{formatAddress(profile.walletAddress)}</p>
          </div>
          {connectedAddress?.toLowerCase() === profile.walletAddress.toLowerCase() && (
            <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm">
              Your Profile
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Events</span>
            </div>
            <div className="text-2xl font-bold">{profile.eventsAttended}</div>
          </div>
          <div className="p-4 bg-bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Badges</span>
            </div>
            <div className="text-2xl font-bold">{profile.totalBadges}</div>
          </div>
          <div className="p-4 bg-bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Avg Score</span>
            </div>
            <div className="text-2xl font-bold">{profile.averageScore}</div>
          </div>
          <div className="p-4 bg-bg-secondary rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">Rewards</span>
            </div>
            <div className="text-2xl font-bold">{profile.totalRewards}</div>
            <div className="text-xs text-text-secondary mt-1">OG tokens</div>
          </div>
        </div>
      </div>

      {/* Badges Gallery */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Badge Collection</h2>
        {badges.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Award className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No badges yet. Check in to events to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div
                key={badge.tokenId}
                className={`glass-card p-6 border-2 ${getTierColor(badge.tier)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className={`w-6 h-6 ${getTierColor(badge.tier).split(' ')[0]}`} />
                    <span className="font-bold">{formatTier(badge.tier)}</span>
                  </div>
                  <span className="text-xs text-text-secondary">#{badge.tokenId}</span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{badge.eventName}</h3>
                
                <div className="space-y-2 text-sm text-text-secondary mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{badge.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{badge.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Contribution Score</span>
                    <span className="font-bold text-accent-primary">{badge.contributionScore}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contribution History */}
      {badges.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contribution History</h2>
          <div className="glass-card p-6">
            <div className="space-y-4">
              {badges.map((badge, index) => (
                <div
                  key={badge.tokenId}
                  className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                      <span className="text-accent-primary font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{badge.eventName}</div>
                      <div className="text-sm text-text-secondary">{badge.eventDate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-accent-primary">{badge.contributionScore}/100</div>
                    <div className="text-xs text-text-secondary">{formatTier(badge.tier)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


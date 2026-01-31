import type { Address } from 'viem';
import { createPublicClient, http, parseAbi } from 'viem';
import { ogChain, contractAddresses } from '../config/chain';
import type { Event, Badge, Tier } from '../types';

const publicClient = createPublicClient({
  chain: ogChain,
  transport: http(),
});

// EventRegistry ABI (simplified)
const eventRegistryABI = parseAbi([
  'function events(uint256) view returns (uint256 id, string name, string location, uint256 startTime, uint256 endTime, address organizer, bool active)',
  'function eventCount() view returns (uint256)',
  'function isCheckedIn(uint256 eventId, address attendee) view returns (bool)',
  'function checkIn(uint256 eventId)',
  'function getAttendeeEvents(address attendee) view returns (uint256[])',
  'event AttendeeCheckedIn(uint256 indexed eventId, address indexed attendee, uint256 timestamp)',
]);

// ProofOfAttendanceNFT ABI (simplified)
const nftABI = parseAbi([
  'function badges(uint256) view returns (uint256 eventId, string eventName, string eventDate, string location, uint8 tier, uint256 contributionScore, string storageHash)',
  'function getOwnerBadges(address owner) view returns (uint256[])',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]);

// RewardToken ABI (simplified)
const rewardTokenABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function claimReward(uint256 eventId, uint8 tier)',
  'function hasClaimed(address user, uint256 eventId) view returns (bool)',
  'function getRewardAmount(uint8 tier) view returns (uint256)',
]);

export class ContractService {
  async getEventCount(): Promise<number> {
    try {
      const count = await publicClient.readContract({
        address: contractAddresses.eventRegistry as Address,
        abi: eventRegistryABI,
        functionName: 'eventCount',
      });
      return Number(count);
    } catch (error) {
      console.error('Error fetching event count:', error);
      return 0;
    }
  }

  async getEvent(eventId: number): Promise<Event | null> {
    try {
      const event = await publicClient.readContract({
        address: contractAddresses.eventRegistry as Address,
        abi: eventRegistryABI,
        functionName: 'events',
        args: [BigInt(eventId)],
      });
      
      return {
        id: Number(event[0]),
        name: event[1],
        location: event[2],
        startTime: Number(event[3]),
        endTime: Number(event[4]),
        organizer: event[5],
        active: event[6],
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  async isCheckedIn(eventId: number, address: Address): Promise<boolean> {
    try {
      return await publicClient.readContract({
        address: contractAddresses.eventRegistry as Address,
        abi: eventRegistryABI,
        functionName: 'isCheckedIn',
        args: [BigInt(eventId), address],
      });
    } catch (error) {
      console.error('Error checking check-in status:', error);
      return false;
    }
  }

  async getOwnerBadges(owner: Address): Promise<Badge[]> {
    try {
      const tokenIds = await publicClient.readContract({
        address: contractAddresses.nft as Address,
        abi: nftABI,
        functionName: 'getOwnerBadges',
        args: [owner],
      });

      const badges: Badge[] = [];
      for (const tokenId of tokenIds) {
        const badge = await publicClient.readContract({
          address: contractAddresses.nft as Address,
          abi: nftABI,
          functionName: 'badges',
          args: [tokenId],
        });

        badges.push({
          tokenId: Number(tokenId),
          eventId: Number(badge[0]),
          eventName: badge[1],
          eventDate: badge[2],
          location: badge[3],
          tier: badge[4] as Tier,
          contributionScore: Number(badge[5]),
          storageHash: badge[6],
        });
      }

      return badges;
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  }

  async getRewardBalance(address: Address): Promise<string> {
    try {
      const balance = await publicClient.readContract({
        address: contractAddresses.rewardToken as Address,
        abi: rewardTokenABI,
        functionName: 'balanceOf',
        args: [address],
      });
      return balance.toString();
    } catch (error) {
      console.error('Error fetching reward balance:', error);
      return '0';
    }
  }
}

export const contractService = new ContractService();


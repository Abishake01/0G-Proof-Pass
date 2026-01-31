// Event types
export interface Event {
  id: number;
  name: string;
  location: string;
  startTime: number;
  endTime: number;
  organizer: string;
  active: boolean;
}

// Check-in types
export interface CheckIn {
  attendee: string;
  eventId: number;
  timestamp: number;
  verified: boolean;
}

// NFT Badge types
export enum Tier {
  Attendee = 0,
  Contributor = 1,
  Champion = 2,
}

export interface Badge {
  tokenId: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  location: string;
  tier: Tier;
  contributionScore: number;
  storageHash: string;
}

// Photo submission
export interface PhotoSubmission {
  eventId: number;
  walletAddress: string;
  timestamp: number;
  imageHash: string;
  thumbnailHash?: string;
}

// Feedback submission
export interface FeedbackSubmission {
  eventId: number;
  walletAddress: string;
  timestamp: number;
  feedbackText: string;
  rating: number;
  contentHash: string;
}

// AI Analysis
export interface ContributionAnalysis {
  photoScore: number;
  feedbackScore: number;
  overallScore: number;
  tier: 'Attendee' | 'Contributor' | 'Champion';
  reasoning: string;
  isSpam: boolean;
  isDuplicate: boolean;
}

// User profile
export interface UserProfile {
  walletAddress: string;
  eventsAttended: number;
  totalBadges: number;
  totalRewards: string;
  averageScore: number;
  badges: Badge[];
}


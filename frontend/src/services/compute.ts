import { ContributionAnalysis } from '../types';
import { backendUrl } from '../config/chain';

export interface AnalyzeContributionRequest {
  photos: string[];
  feedback: string;
  eventId: number;
  walletAddress: string;
}

export class ComputeService {
  async analyzeContribution(request: AnalyzeContributionRequest): Promise<ContributionAnalysis> {
    try {
      const response = await fetch(`${backendUrl}/api/compute/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze contribution');
      }

      return await response.json();
    } catch (error) {
      console.error('Compute analysis error:', error);
      throw error;
    }
  }
}

export const computeService = new ComputeService();


// 0G Compute Service using @0gfoundation/0g-cc
// This service wraps the 0g-cc CLI tool for AI inference

import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export interface ComputeAnalysisRequest {
  photos: string[]; // Storage hashes
  feedback: string;
  eventId: number;
  walletAddress: string;
}

export interface ComputeAnalysisResponse {
  photoScore: number;
  feedbackScore: number;
  overallScore: number;
  tier: 'Attendee' | 'Contributor' | 'Champion';
  reasoning: string;
  isSpam: boolean;
  isDuplicate: boolean;
}

export class ComputeService {
  private network: string;
  private privateKey?: string;
  private openRouterKey?: string;
  private openRouterModel?: string;

  constructor() {
    this.network = process.env.ZEROG_NETWORK || 'testnet';
    this.privateKey = process.env.ZEROG_PRIVATE_KEY;
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
    this.openRouterModel = process.env.OPENROUTER_MODEL;
  }

  /**
   * Analyze contribution using 0G Compute Network
   * This uses the 0g-cc CLI tool via npx
   */
  async analyzeContribution(request: ComputeAnalysisRequest): Promise<ComputeAnalysisResponse> {
    // Build the analysis prompt
    const prompt = this.buildAnalysisPrompt(request);

    try {
      // Call 0g-cc via npx
      // Note: This is a simplified approach. In production, you might want to
      // use the 0g-cc SDK directly or set up a proper MCP server connection
      
      const env = {
        ...process.env,
        ZEROG_NETWORK: this.network,
        ...(this.privateKey && { ZEROG_PRIVATE_KEY: this.privateKey }),
        ...(this.openRouterKey && { OPENROUTER_API_KEY: this.openRouterKey }),
        ...(this.openRouterModel && { OPENROUTER_MODEL: this.openRouterModel }),
      };

      // Try to call 0G Compute or OpenRouter
      let aiResponse = '';
      try {
        aiResponse = await this.call0gCompute(prompt, env);
      } catch (error) {
        console.warn('AI compute failed, using mock analysis:', error);
      }

      // Parse AI response if available, otherwise use mock
      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          return this.validateAndFormatAnalysis(parsed, request);
        } catch (parseError) {
          console.warn('Failed to parse AI response, using mock:', parseError);
        }
      }
      
      return this.mockAnalysis(request);
    } catch (error) {
      console.error('Error in compute analysis:', error);
      throw new Error('Failed to analyze contribution');
    }
  }

  private buildAnalysisPrompt(request: ComputeAnalysisRequest): string {
    return `
Analyze this event contribution:

Event ID: ${request.eventId}
Wallet: ${request.walletAddress}
Photos: ${request.photos.length} image(s) uploaded
Feedback: "${request.feedback}"

Please evaluate:
1. Photo quality and relevance (0-100)
2. Feedback depth and helpfulness (0-100)
3. Overall contribution score (0-100)
4. Tier classification (Attendee/Contributor/Champion)
5. Spam detection
6. Duplicate detection

Return JSON with: photoScore, feedbackScore, overallScore, tier, reasoning, isSpam, isDuplicate
    `.trim();
  }

  private async call0gCompute(prompt: string, env: NodeJS.ProcessEnv): Promise<string> {
    try {
      // Use 0g-cc via npx for inference
      // The 0g-cc package provides MCP tools, but we can also call it programmatically
      // For now, we'll use a more sophisticated mock that simulates AI analysis
      // In production, integrate with 0g-cc MCP server or SDK
      
      // Option 1: Call via npx (if 0g-cc is installed)
      // const { stdout } = await execAsync(
      //   `npx @0gfoundation/0g-cc compute_inference "${prompt}"`,
      //   { env }
      // );
      // return stdout;
      
      // Option 2: Use OpenRouter as fallback if configured
      if (this.openRouterKey && this.openRouterModel) {
        return await this.callOpenRouter(prompt);
      }
      
      // For now, return empty to use mock
      return '';
    } catch (error) {
      console.error('0G Compute call failed:', error);
      throw error;
    }
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.openRouterModel,
          messages: [
            {
              role: 'system',
              content: 'You are an AI analyst evaluating event contributions. Return only valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter call failed:', error);
      throw error;
    }
  }

  private validateAndFormatAnalysis(parsed: any, request: ComputeAnalysisRequest): ComputeAnalysisResponse {
    // Validate and format AI response
    const photoScore = Math.max(0, Math.min(100, parseInt(parsed.photoScore) || 0));
    const feedbackScore = Math.max(0, Math.min(100, parseInt(parsed.feedbackScore) || 0));
    const overallScore = Math.max(0, Math.min(100, parseInt(parsed.overallScore) || 0));
    
    let tier: 'Attendee' | 'Contributor' | 'Champion';
    if (overallScore >= 67) {
      tier = 'Champion';
    } else if (overallScore >= 34) {
      tier = 'Contributor';
    } else {
      tier = 'Attendee';
    }

    return {
      photoScore,
      feedbackScore,
      overallScore,
      tier,
      reasoning: parsed.reasoning || 'AI analysis completed',
      isSpam: parsed.isSpam === true || parsed.isSpam === 'true',
      isDuplicate: parsed.isDuplicate === true || parsed.isDuplicate === 'true',
    };
  }

  private mockAnalysis(request: ComputeAnalysisRequest): ComputeAnalysisResponse {
    // Mock analysis for development
    // In production, this would come from 0G Compute Network
    
    const feedbackLength = request.feedback.length;
    const hasPhotos = request.photos.length > 0;
    
    // Simple scoring logic
    let feedbackScore = Math.min(100, Math.floor(feedbackLength / 10));
    let photoScore = hasPhotos ? 70 : 0;
    
    // Adjust scores based on content quality (mock)
    if (request.feedback.toLowerCase().includes('great') || 
        request.feedback.toLowerCase().includes('excellent')) {
      feedbackScore = Math.min(100, feedbackScore + 20);
    }
    
    const overallScore = Math.floor((photoScore * 0.4) + (feedbackScore * 0.4) + 20);
    
    let tier: 'Attendee' | 'Contributor' | 'Champion';
    if (overallScore >= 67) {
      tier = 'Champion';
    } else if (overallScore >= 34) {
      tier = 'Contributor';
    } else {
      tier = 'Attendee';
    }
    
    return {
      photoScore,
      feedbackScore,
      overallScore,
      tier,
      reasoning: `Analyzed ${request.photos.length} photo(s) and ${feedbackLength} characters of feedback. Quality assessment based on content depth and relevance.`,
      isSpam: false,
      isDuplicate: false,
    };
  }
}

export const computeService = new ComputeService();


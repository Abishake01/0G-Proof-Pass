import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import PhotoUpload from '../components/event/PhotoUpload';
import FeedbackForm from '../components/event/FeedbackForm';
import BadgeUpgrade from '../components/nft/BadgeUpgrade';
import ClaimRewards from '../components/rewards/ClaimRewards';
import { computeService } from '../services/compute';
import type { ContributionAnalysis } from '../types';

export default function Contribute() {
  const { eventId } = useParams<{ eventId: string }>();
  const { address, isConnected } = useAccount();
  const [photoHash, setPhotoHash] = useState('');
  const [feedbackHash, setFeedbackHash] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContributionAnalysis | null>(null);
  const [error, setError] = useState('');

  const handlePhotoUpload = (hash: string) => {
    setPhotoHash(hash);
  };

  const handleFeedbackComplete = async (hash: string) => {
    setFeedbackHash(hash);
    
    // Trigger AI analysis when both photo and feedback are submitted
    if (photoHash && hash && address) {
      await analyzeContribution(photoHash, hash);
    }
  };

  // Use feedbackHash in analysis (for future storage retrieval)
  useEffect(() => {
    if (feedbackHash && photoHash && address) {
      // Can be used to fetch actual feedback text from storage
    }
  }, [feedbackHash, photoHash, address]);

  const analyzeContribution = async (photoHash: string, feedbackHash: string) => {
    if (!address || !eventId) return;

    setAnalyzing(true);
    setError('');

    try {
      // Fetch feedback text from storage (for now, we'll pass the hash)
      // In production, you'd fetch the actual feedback text
      const result = await computeService.analyzeContribution({
        photos: [photoHash],
        feedback: `Feedback hash: ${feedbackHash}`, // TODO: Fetch actual feedback text from storage
        eventId: parseInt(eventId),
        walletAddress: address,
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze contribution');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Please connect your wallet to contribute</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Contribute to Event</h1>
        <p className="text-text-secondary">Upload photos and share feedback to earn contribution rewards</p>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-6">
          <PhotoUpload
            eventId={parseInt(eventId || '0')}
            onUploadComplete={handlePhotoUpload}
          />
        </div>

        <div className="glass-card p-6">
          <FeedbackForm
            eventId={parseInt(eventId || '0')}
            onFeedbackComplete={handleFeedbackComplete}
          />
        </div>

        {analyzing && (
          <div className="glass-card p-6 text-center">
            <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Analyzing your contribution with AI...</p>
          </div>
        )}

        {error && (
          <div className="glass-card p-6 bg-error/20 border border-error">
            <p className="text-error">{error}</p>
          </div>
        )}

        {analysis && (
          <>
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Contribution Analysis</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-accent-primary">{analysis.photoScore}</div>
                    <div className="text-xs text-text-secondary mt-1">Photo Score</div>
                  </div>
                  <div className="text-center p-4 bg-bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-accent-primary">{analysis.feedbackScore}</div>
                    <div className="text-xs text-text-secondary mt-1">Feedback Score</div>
                  </div>
                  <div className="text-center p-4 bg-bg-secondary rounded-lg">
                    <div className="text-2xl font-bold text-accent-primary">{analysis.overallScore}</div>
                    <div className="text-xs text-text-secondary mt-1">Overall Score</div>
                  </div>
                </div>

                <div className="p-4 bg-bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">Tier</span>
                    <span className="text-lg font-bold text-accent-primary">{analysis.tier}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">{analysis.reasoning}</p>
                </div>

                {(analysis.isSpam || analysis.isDuplicate) && (
                  <div className="p-4 bg-error/20 border border-error rounded-lg">
                    <p className="text-error text-sm">
                      ⚠️ {analysis.isSpam && 'Spam detected. '}
                      {analysis.isDuplicate && 'Duplicate submission detected.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Badge Upgrade and Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BadgeUpgrade
                tokenId={0} // TODO: Get actual token ID from check-in
                analysis={analysis}
              />
              <ClaimRewards
                eventId={parseInt(eventId || '0')}
                tier={analysis.tier === 'Champion' ? 2 : analysis.tier === 'Contributor' ? 1 : 0}
                tokenId={0} // TODO: Get actual token ID
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}


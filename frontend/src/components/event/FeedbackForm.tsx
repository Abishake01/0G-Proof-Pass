import { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { storageService } from '../../services/storage';
import { useAccount } from 'wagmi';

interface FeedbackFormProps {
  eventId: number;
  onFeedbackComplete: (hash: string) => void;
}

export default function FeedbackForm({ eventId, onFeedbackComplete }: FeedbackFormProps) {
  const { address } = useAccount();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedHash, setUploadedHash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!feedback.trim() || !address) {
      setError('Please provide feedback and ensure wallet is connected');
      return;
    }

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const feedbackData = {
        eventId,
        walletAddress: address,
        timestamp: Date.now(),
        feedbackText: feedback,
        rating,
      };

      const result = await storageService.uploadJSON(feedbackData);
      setUploadedHash(result.hash);
      onFeedbackComplete(result.hash);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Event Feedback</label>
        <p className="text-xs text-text-secondary mb-4">
          Share your thoughts about the event. This will be analyzed by AI to determine your contribution tier.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-2 rounded-lg transition-colors ${
                  rating >= star
                    ? 'text-accent-primary bg-accent-primary/20'
                    : 'text-text-secondary bg-bg-secondary hover:bg-bg-card'
                }`}
              >
                <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience, insights, suggestions, or feedback about the event..."
          rows={6}
          className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-primary resize-none"
          disabled={uploading || !!uploadedHash}
        />

        <div className="mt-2 text-xs text-text-secondary">
          {feedback.length} characters
        </div>

        {!uploadedHash && (
          <button
            onClick={handleSubmit}
            disabled={uploading || !feedback.trim() || rating === 0}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading to 0G Storage...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        )}

        {uploadedHash && (
          <div className="mt-4 p-3 bg-success/20 border border-success rounded-lg">
            <p className="text-success text-sm font-medium">
              ✓ Feedback submitted to 0G Storage
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Storage Hash: {uploadedHash.slice(0, 20)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


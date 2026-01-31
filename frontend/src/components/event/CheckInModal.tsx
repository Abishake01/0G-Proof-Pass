import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useCheckIn, useSignMessage } from '../../hooks/useContract';
import { apiService } from '../../services/api';
import { contractService } from '../../services/contracts';

interface CheckInModalProps {
  eventId: number;
  onClose: () => void;
}

export default function CheckInModal({ eventId, onClose }: CheckInModalProps) {
  const { address } = useAccount();
  const [step, setStep] = useState<'email' | 'otp' | 'sign' | 'complete'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [eventData, setEventData] = useState<{ name: string; date: string; location: string } | null>(null);
  
  const { checkIn, isPending, isConfirming, isConfirmed, error: checkInError } = useCheckIn();
  const { signCheckInMessage } = useSignMessage();

  // Fetch event data for NFT metadata
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const event = await contractService.getEvent(eventId);
        if (event) {
          setEventData({
            name: event.name,
            date: new Date(event.startTime * 1000).toLocaleDateString(),
            location: event.location,
          });
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      }
    };
    fetchEventData();
  }, [eventId]);

  // Handle successful check-in
  useEffect(() => {
    if (isConfirmed) {
      setStep('complete');
    }
  }, [isConfirmed]);

  // Handle check-in errors
  useEffect(() => {
    if (checkInError) {
      setError(checkInError.message || 'Check-in failed');
      setLoading(false);
    }
  }, [checkInError]);

  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.sendOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.verifyOTP(email, otp);
      setStep('sign');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndCheckIn = async () => {
    if (!address || !eventData) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Sign message to prove wallet ownership
      const signature = await signCheckInMessage(eventId, email);
      console.log('Message signed:', signature);

      // Step 2: Call check-in contract function
      // Note: The contract should handle NFT minting internally
      // If not, we'll need to call mintBadge separately
      await checkIn(eventId);
      
      // The useEffect will handle moving to 'complete' step when isConfirmed is true
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass-card p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Check In to Event</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary">Enter Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary text-center text-2xl tracking-widest focus:outline-none focus:border-accent-primary"
              />
              <p className="text-xs text-text-secondary mt-2">
                Code sent to {email}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('email')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="btn-primary flex-1"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {step === 'sign' && (
          <div className="space-y-4">
            <p className="text-text-secondary">
              Email verified! Now sign a message with your wallet to complete check-in.
            </p>
            {isPending || isConfirming ? (
              <div className="flex items-center justify-center gap-2 text-accent-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isPending ? 'Waiting for transaction...' : 'Confirming transaction...'}</span>
              </div>
            ) : (
              <button
                onClick={handleSignAndCheckIn}
                disabled={loading || !address || isPending || isConfirming}
                className="btn-primary w-full"
              >
                Sign & Check In
              </button>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold">Check-in Successful!</h3>
            <p className="text-text-secondary">
              Your Proof of Attendance NFT has been minted.
            </p>
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


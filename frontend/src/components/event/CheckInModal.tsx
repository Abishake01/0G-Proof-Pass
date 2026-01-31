import { useState } from 'react';
import { X } from 'lucide-react';
import { useAccount } from 'wagmi';

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

  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }

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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid OTP');
      }

      setStep('sign');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndCheckIn = async () => {
    // TODO: Implement wallet signature and contract check-in
    setStep('complete');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Check In to Event</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
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
              <label className="block text-sm font-medium mb-2">Email Address</label>
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
              <label className="block text-sm font-medium mb-2">Enter Verification Code</label>
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
            <button
              onClick={handleSignAndCheckIn}
              disabled={loading || !address}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Sign & Check In'}
            </button>
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


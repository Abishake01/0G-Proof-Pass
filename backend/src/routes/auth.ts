import { Router } from 'express';
import { sendOTP, verifyOTP } from '../services/email.js';

const router = Router();

// Store OTPs in memory (use Redis in production)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Rate limiting (simple in-memory, use Redis in production)
const rateLimit = new Map<string, number[]>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // Max 5 requests per window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const requests = rateLimit.get(identifier) || [];
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(identifier, recentRequests);
  return true;
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Rate limiting
    if (!checkRateLimit(email)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000);
    
    otpStore.set(email, { code, expiresAt });
    
    await sendOTP(email, code);
    
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
    
    const stored = otpStore.get(email);
    
    if (!stored) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }
    
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (stored.code !== code) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // OTP verified, remove it
    otpStore.delete(email);
    
    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

export default router;


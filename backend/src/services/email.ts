import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTP(email: string, code: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: '0G ProofPass - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">0G ProofPass</h2>
        <p>Your verification code is:</p>
        <div style="background: #1a1d25; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #8b5cf6; margin: 0; font-size: 32px; letter-spacing: 4px;">${code}</h1>
        </div>
        <p style="color: #94a3b8;">This code will expire in ${process.env.OTP_EXPIRY_MINUTES || '10'} minutes.</p>
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  // This is handled in the route handler
  return false;
}


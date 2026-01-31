import { backendUrl } from '../config/chain';

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = backendUrl;
  }

  async sendOTP(email: string): Promise<SendOTPResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send OTP');
    }

    return response.json();
  }

  async verifyOTP(email: string, code: string): Promise<VerifyOTPResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify OTP');
    }

    return response.json();
  }
}

export const apiService = new ApiService();


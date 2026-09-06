// ABDM/ABHA Integration Provider

import type { ABDMSession, ScanShareSession } from '@/types';

export interface ABDMProvider {
  createSession(patientId: string, purpose: string): Promise<ABDMSession>;
  generateQRCode(sessionId: string): Promise<string>;
  linkHealthRecord(sessionId: string, recordType: string): Promise<void>;
  isAvailable(): boolean;
}

// Mock ABDM Provider (for demo/development)
export class MockABDMProvider implements ABDMProvider {
  private available = false;

  constructor() {
    this.available = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  }

  isAvailable(): boolean {
    return this.available;
  }

  async createSession(patientId: string, purpose: string): Promise<ABDMSession> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: crypto.randomUUID(),
      patient_id: patientId,
      transaction_id: `TXN${Date.now()}`,
      purpose,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };
  }

  async generateQRCode(sessionId: string): Promise<string> {
    // Return a placeholder QR code data URL
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would generate an actual QR code
    // that contains the ABDM-compliant session information
    const mockQR = `ABDM:${sessionId}:DEMO`;
    return `data:text/plain;base64,${btoa(mockQR)}`;
  }

  async linkHealthRecord(_sessionId: string, _recordType: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real implementation, this would link health records
  }
}

// Real ABDM Provider (when sandbox/production credentials are available)
export class RealABDMProvider implements ABDMProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.ABDM_CLIENT_ID || '';
    this.clientSecret = process.env.ABDM_CLIENT_SECRET || '';
    this.baseUrl = process.env.ABDM_BASE_URL || 'https://abdm.gov.in';
  }

  isAvailable(): boolean {
    return !!this.clientId && !!this.clientSecret && 
           this.clientId !== 'demo-abdm-client';
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) throw new Error('Failed to get access token');
    const data = await response.json();
    return data.access_token;
  }

  async createSession(patientId: string, purpose: string): Promise<ABDMSession> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v1/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patient_id: patientId, purpose }),
    });

    if (!response.ok) throw new Error('Failed to create ABDM session');
    return response.json();
  }

  async generateQRCode(sessionId: string): Promise<string> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v1/scan-and-share/qrcode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) throw new Error('Failed to generate QR code');
    const data = await response.json();
    return data.qr_code;
  }

  async linkHealthRecord(sessionId: string, recordType: string): Promise<void> {
    const token = await this.getAccessToken();

    await fetch(`${this.baseUrl}/v1/health-records/link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId, record_type: recordType }),
    });
  }
}

// Factory function
export function getABDMProvider(): ABDMProvider {
  const providerType = process.env.ABDM_PROVIDER || 'mock';
  
  if (providerType === 'real') {
    return new RealABDMProvider();
  }
  
  return new MockABDMProvider();
}

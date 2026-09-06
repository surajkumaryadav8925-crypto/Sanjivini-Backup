// Ambulance Provider

import type { AmbulanceRequestInput, AmbulanceResponse, AmbulanceTrackingInfo } from '@/types';

export interface AmbulanceProvider {
  requestAmbulance(request: AmbulanceRequestInput): Promise<AmbulanceResponse>;
  trackAmbulance(requestId: string): Promise<AmbulanceTrackingInfo>;
  isAvailable(): boolean;
}

// Mock Ambulance Provider
export class MockAmbulanceProvider implements AmbulanceProvider {
  private available = false;

  constructor() {
    this.available = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  }

  isAvailable(): boolean {
    return this.available;
  }

  async requestAmbulance(_request: AmbulanceRequestInput): Promise<AmbulanceResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      request_id: `AMB${Date.now()}`,
      status: 'dispatched',
      eta_minutes: Math.floor(Math.random() * 15) + 5,
      ambulance_number: 'DL-01-AB-1234',
    };
  }

  async trackAmbulance(requestId: string): Promise<AmbulanceTrackingInfo> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      request_id: requestId,
      status: 'en_route',
      current_lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      current_lng: 77.2090 + (Math.random() - 0.5) * 0.1,
      eta_minutes: Math.floor(Math.random() * 10) + 3,
      driver_name: 'Demo Driver',
      driver_phone: '+91 98765 43210',
    };
  }
}

// Real Ambulance Provider (integrate with actual ambulance service)
export class RealAmbulanceProvider implements AmbulanceProvider {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.AMBULANCE_API_URL || '';
  }

  isAvailable(): boolean {
    return !!this.apiUrl;
  }

  async requestAmbulance(request: AmbulanceRequestInput): Promise<AmbulanceResponse> {
    const response = await fetch(`${this.apiUrl}/api/ambulance/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to request ambulance');
    return response.json();
  }

  async trackAmbulance(requestId: string): Promise<AmbulanceTrackingInfo> {
    const response = await fetch(`${this.apiUrl}/api/ambulance/track/${requestId}`);
    if (!response.ok) throw new Error('Failed to track ambulance');
    return response.json();
  }
}

// Factory function
export function getAmbulanceProvider(): AmbulanceProvider {
  const providerType = process.env.AMBULANCE_PROVIDER || 'mock';
  
  if (providerType === 'real') {
    return new RealAmbulanceProvider();
  }
  
  return new MockAmbulanceProvider();
}

// Hook for ambulance services
export function useAmbulance() {
  const provider = getAmbulanceProvider();

  const requestAmbulance = async (request: AmbulanceRequestInput) => {
    return provider.requestAmbulance(request);
  };

  const trackAmbulance = async (requestId: string) => {
    return provider.trackAmbulance(requestId);
  };

  return {
    requestAmbulance,
    trackAmbulance,
    isAvailable: provider.isAvailable(),
  };
}

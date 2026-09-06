// Blood Availability Provider (e-RaktKosh Integration)

import type { BloodGroup } from '@/types';

export interface BloodAvailabilityResult {
  hospital_id: string;
  hospital_name: string;
  blood_group: BloodGroup;
  units_available: number;
  last_updated: string;
  distance_km?: number;
}

export interface BloodAvailabilityProvider {
  checkAvailability(bloodGroup: BloodGroup, district?: string): Promise<BloodAvailabilityResult[]>;
  requestBlood(hospitalId: string, bloodGroup: BloodGroup, units: number): Promise<boolean>;
  isAvailable(): boolean;
}

// Mock Blood Provider
export class MockBloodProvider implements BloodAvailabilityProvider {
  private available = false;

  constructor() {
    this.available = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  }

  isAvailable(): boolean {
    return this.available;
  }

  async checkAvailability(bloodGroup: BloodGroup, _district?: string): Promise<BloodAvailabilityResult[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data for demo
    return [
      {
        hospital_id: 'demo-hospital-1',
        hospital_name: 'District Hospital Demo',
        blood_group: bloodGroup,
        units_available: Math.floor(Math.random() * 20) + 5,
        last_updated: new Date().toISOString(),
        distance_km: 2.5,
      },
      {
        hospital_id: 'demo-hospital-2',
        hospital_name: 'Medical College Hospital Demo',
        blood_group: bloodGroup,
        units_available: Math.floor(Math.random() * 15) + 10,
        last_updated: new Date().toISOString(),
        distance_km: 5.8,
      },
      {
        hospital_id: 'demo-hospital-3',
        hospital_name: 'Community Health Center Demo',
        blood_group: bloodGroup,
        units_available: Math.floor(Math.random() * 10) + 2,
        last_updated: new Date().toISOString(),
        distance_km: 8.2,
      },
    ];
  }

  async requestBlood(_hospitalId: string, _bloodGroup: BloodGroup, _units: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
}

// Real e-RaktKosh Provider
export class ERaktKoshProvider implements BloodAvailabilityProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.ERAKTKOSH_API_URL || 'https://www.eraktkosh.in';
    this.apiKey = process.env.ERAKTKOSH_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'demo-eraktkosh-key';
  }

  async checkAvailability(bloodGroup: BloodGroup, district?: string): Promise<BloodAvailabilityResult[]> {
    const url = new URL(`${this.apiUrl}/BLDA/BloodBank/bloodBankTab/bbInvenotry.html`);
    url.searchParams.set('bloodGroup', bloodGroup);
    if (district) {
      url.searchParams.set('district', district);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch blood availability');
    
    // Parse the response based on e-RaktKosh API format
    const data = await response.json();
    return this.parseResponse(data);
  }

  private parseResponse(data: unknown): BloodAvailabilityResult[] {
    // Parse e-RaktKosh API response format
    // This is a simplified implementation
    if (!Array.isArray(data)) return [];
    
    return data.map((item: Record<string, unknown>) => ({
      hospital_id: item.hospitalId as string,
      hospital_name: item.hospitalName as string,
      blood_group: item.bloodGroup as BloodGroup,
      units_available: item.availableUnits as number,
      last_updated: item.lastUpdated as string,
    }));
  }

  async requestBlood(hospitalId: string, bloodGroup: BloodGroup, units: number): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/api/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hospitalId, bloodGroup, units }),
    });

    return response.ok;
  }
}

// Factory function
export function getBloodProvider(): BloodAvailabilityProvider {
  const providerType = process.env.BLOOD_PROVIDER || 'mock';
  
  if (providerType === 'real') {
    return new ERaktKoshProvider();
  }
  
  return new MockBloodProvider();
}

// Hook for blood availability
export function useBloodAvailability() {
  const provider = getBloodProvider();

  const checkAvailability = async (bloodGroup: BloodGroup, district?: string) => {
    return provider.checkAvailability(bloodGroup, district);
  };

  return {
    checkAvailability,
    isAvailable: provider.isAvailable(),
  };
}

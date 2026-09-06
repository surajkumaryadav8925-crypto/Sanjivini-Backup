// PM-JAY Insurance Eligibility Provider

import type { PMJAYEligibility } from '@/types';

export interface InsuranceEligibilityProvider {
  checkEligibility(patientId: string, aadhaarNumber?: string): Promise<PMJAYEligibility>;
  isAvailable(): boolean;
}

// Mock PM-JAY Provider
export class MockPMJAYProvider implements InsuranceEligibilityProvider {
  private available = false;

  constructor() {
    this.available = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  }

  isAvailable(): boolean {
    return this.available;
  }

  async checkEligibility(patientId: string, _aadhaarNumber?: string): Promise<PMJAYEligibility> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate eligibility check with random result for demo
    const isEligible = Math.random() > 0.3;

    return {
      patient_id: patientId,
      is_eligible: isEligible,
      ration_card_number: isEligible ? `RC${Date.now()}` : undefined,
      family_id: isEligible ? `FAM${Date.now()}` : undefined,
      sec_status: isEligible ? 'SEC001' : undefined,
      district: 'Demo District',
      verified_at: new Date().toISOString(),
    };
  }
}

// Real PM-JAY Provider
export class RealPMJAYProvider implements InsuranceEligibilityProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.PMJAY_API_URL || 'https://pmjay.gov.in';
    this.apiKey = process.env.PMJAY_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'demo-pmjay-key';
  }

  async checkEligibility(patientId: string, aadhaarNumber?: string): Promise<PMJAYEligibility> {
    const response = await fetch(`${this.apiUrl}/api/v1/eligibility/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId, aadhaarNumber }),
    });

    if (!response.ok) throw new Error('Failed to check eligibility');
    
    const data = await response.json();
    return {
      patient_id: patientId,
      is_eligible: data.eligible,
      ration_card_number: data.rationCardNumber,
      family_id: data.familyId,
      sec_status: data.secStatus,
      district: data.district,
      verified_at: new Date().toISOString(),
    };
  }
}

// Factory function
export function getPMJAYProvider(): InsuranceEligibilityProvider {
  const providerType = process.env.PMJAY_PROVIDER || 'mock';
  
  if (providerType === 'real') {
    return new RealPMJAYProvider();
  }
  
  return new MockPMJAYProvider();
}

// Hook for PM-JAY eligibility
export function usePMJAYEligibility() {
  const provider = getPMJAYProvider();

  const checkEligibility = async (patientId: string, aadhaarNumber?: string) => {
    return provider.checkEligibility(patientId, aadhaarNumber);
  };

  return {
    checkEligibility,
    isAvailable: provider.isAvailable(),
  };
}

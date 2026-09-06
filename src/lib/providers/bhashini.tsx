// Bhashini Voice Provider for Regional Language Support

export interface VoiceProvider {
  transcribe(audioBlob: Blob, language: string): Promise<string>;
  getSupportedLanguages(): LanguageConfig[];
  isAvailable(): boolean;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡିଆ' },
];

// Mock Bhashini Provider (used when API is unavailable)
export class MockVoiceProvider implements VoiceProvider {
  private available = false;

  constructor() {
    // In demo mode, we simulate voice availability
    this.available = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  }

  isAvailable(): boolean {
    return this.available;
  }

  getSupportedLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }

  async transcribe(_audioBlob: Blob, language: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock transcription based on language
    const mockTranscriptions: Record<string, string> = {
      en: 'I have fever and headache for two days',
      hi: 'मुझे दो दिन से बुखार और सिरदर्द है',
      bn: 'আমার দুদিন ধরে জ্বর এবং মাথা ব্যথা আছে',
      ta: 'எனக்கு இரண்டு நாட்களாக காய்ச்சல் மற்றும் தலைவலி உள்ளது',
      te: 'నాకు రెండు రోజుల నుండి జ్వరం మరియు తలనొప్పి ఉంది',
    };

    return mockTranscriptions[language] || mockTranscriptions['en'];
  }
}

// Real Bhashini Provider (when API credentials are available)
export class BhashiniVoiceProvider implements VoiceProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.BHASHINI_API_KEY || '';
    this.apiUrl = process.env.BHASHINI_API_URL || 'https://api.bhashini.gov.in';
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'demo-bhashini-key';
  }

  getSupportedLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }

  async transcribe(audioBlob: Blob, language: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Bhashini API not configured');
    }

    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);

    const response = await fetch(`${this.apiUrl}/v1/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.text;
  }
}

// Factory function to get the appropriate provider
export function getVoiceProvider(): VoiceProvider {
  const providerType = process.env.BHASHINI_PROVIDER || 'mock';
  
  if (providerType === 'real') {
    return new BhashiniVoiceProvider();
  }
  
  return new MockVoiceProvider();
}

// Hook for using voice input
export function useVoiceInput() {
  const provider = getVoiceProvider();

  const transcribe = async (audioBlob: Blob, language: string = 'en') => {
    return provider.transcribe(audioBlob, language);
  };

  return {
    transcribe,
    isAvailable: provider.isAvailable(),
    supportedLanguages: provider.getSupportedLanguages(),
  };
}

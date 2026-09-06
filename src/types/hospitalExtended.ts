// Extended Hospital Types for Demo Mode
export interface HospitalDepartment {
  id: string;
  name: string;
  available: boolean;
  waitTime?: string;
}

export interface DoctorInfo {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  department: string;
  available: boolean;
  opdDays: string[];
  opdTiming: string;
  consultationFee?: number;
}

export interface HospitalHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  type: 'government' | 'private' | 'charitable' | 'trust';
  category: string;
  address: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  emergencyPhone?: string;
  latitude: number;
  longitude: number;
  emergencyAvailable: boolean;
  departments: HospitalDepartment[];
  doctors: DoctorInfo[];
  operatingHours: HospitalHours;
  facilities: string[];
  imageUrl?: string;
  distance?: number;
}

export interface BloodBankInfo {
  id: string;
  name: string;
  hospitalId?: string;
  address: string;
  phone: string;
  availability: Record<string, number>;
  lastUpdated: string;
}

export const DEFAULT_LOCATION = {
  city: "Bhagalpur",
  district: "Bhagalpur",
  state: "Bihar",
  latitude: 25.2445,
  longitude: 86.9718,
};

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getHospitalsByDistance(lat: number, lon: number, hospitals: HospitalInfo[]): HospitalInfo[] {
  return hospitals.map(h => ({
    ...h,
    distance: calculateDistance(lat, lon, h.latitude, h.longitude),
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

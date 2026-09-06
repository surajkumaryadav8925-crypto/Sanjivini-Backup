// Hospital Matching Service

import type { Hospital, HospitalMatch, RiskLevel, BloodGroup } from '@/types';

export interface HospitalMatchRequest {
  latitude: number;
  longitude: number;
  riskLevel?: RiskLevel;
  requiredSpecialization?: string;
  requiresIcu?: boolean;
  requiredMedicine?: string;
  requiresBlood?: BloodGroup;
  radiusKm?: number;
}

interface HospitalWithResources extends Hospital {
  distance_km?: number;
  icu_available?: number;
  beds_available?: number;
  specialist_available?: string[];
  blood_available?: Record<BloodGroup, number>;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Score a hospital based on matching criteria
export function scoreHospital(
  hospital: HospitalWithResources,
  request: HospitalMatchRequest
): number {
  let score = 100;

  // Distance penalty (max 50 points)
  if (hospital.distance_km) {
    const distanceScore = Math.max(0, 50 - hospital.distance_km);
    score -= (50 - distanceScore);
  }

  // ICU requirement (max 20 points)
  if (request.requiresIcu) {
    if (hospital.icu_available && hospital.icu_available > 0) {
      score += 20;
    } else {
      score -= 30; // Heavy penalty if ICU required but not available
    }
  }

  // Specialist requirement (max 15 points)
  if (request.requiredSpecialization) {
    const hasSpecialist = hospital.specialist_available?.some(
      s => s.toLowerCase().includes(request.requiredSpecialization!.toLowerCase())
    );
    if (hasSpecialist) {
      score += 15;
    } else {
      score -= 10;
    }
  }

  // Blood requirement (max 10 points)
  if (request.requiresBlood) {
    const bloodUnits = hospital.blood_available?.[request.requiresBlood] || 0;
    if (bloodUnits > 0) {
      score += 10;
    } else {
      score -= 5;
    }
  }

  // Emergency/Red case preference for nearby hospitals
  if (request.riskLevel === 'red' && hospital.distance_km) {
    // Favor closer hospitals more for emergencies
    if (hospital.distance_km < 5) score += 10;
    else if (hospital.distance_km < 10) score += 5;
  }

  // Verification status bonus
  if (hospital.verification_status === 'verified') {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// Main matching function
export function matchHospitals(
  hospitals: HospitalWithResources[],
  request: HospitalMatchRequest
): HospitalMatch[] {
  const radius = request.radiusKm || 50;

  // Filter by radius and calculate distances
  const nearbyHospitals = hospitals
    .filter(h => {
      if (!h.latitude || !h.longitude) return false;
      const distance = calculateDistance(
        request.latitude,
        request.longitude,
        h.latitude,
        h.longitude
      );
      h.distance_km = distance;
      return distance <= radius;
    });

  // Score and sort
  const scoredHospitals = nearbyHospitals.map(hospital => ({
    hospital,
    score: scoreHospital(hospital, request),
  }));

  scoredHospitals.sort((a, b) => b.score - a.score);

  // Build results
  return scoredHospitals.map(({ hospital, score }) => ({
    hospital,
    distance_km: hospital.distance_km || 0,
    score,
    has_required_specialist: request.requiredSpecialization
      ? hospital.specialist_available?.some(
          s => s.toLowerCase().includes(request.requiredSpecialization!.toLowerCase())
        ) || false
      : true,
    specialist_name: hospital.specialist_available?.[0],
    icu_available: hospital.icu_available || 0,
    beds_available: hospital.beds_available || 0,
    medicine_available: true, // Would be checked against actual inventory
    blood_available: hospital.blood_available || {} as Record<BloodGroup, number>,
    estimated_arrival_time: hospital.distance_km
      ? Math.ceil((hospital.distance_km / 30) * 60) // Assume 30 km/h average speed
      : undefined,
  }));
}

// Filter hospitals by availability
export function filterByAvailability(
  matches: HospitalMatch[],
  filters: {
    hasIcu?: boolean;
    minBeds?: number;
    bloodGroup?: BloodGroup;
    minBloodUnits?: number;
  }
): HospitalMatch[] {
  return matches.filter(match => {
    if (filters.hasIcu && match.icu_available === 0) return false;
    if (filters.minBeds && match.beds_available < filters.minBeds) return false;
    if (filters.bloodGroup && filters.minBloodUnits) {
      const bloodUnits = match.blood_available?.[filters.bloodGroup] || 0;
      if (bloodUnits < filters.minBloodUnits) return false;
    }
    return true;
  });
}

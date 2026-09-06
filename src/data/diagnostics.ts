// Diagnostic tests demo data - DEMO ONLY
export interface DiagnosticTest {
  id: string;
  name: string;
  category: string;
  description: string;
  preparationInfo?: string;
}

export interface DiagnosticFacility {
  id: string;
  name: string;
  type: string;
  address: string;
  locality: string;
  phone: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
}

export interface DiagnosticAvailability {
  testId: string;
  facilityId: string;
  status: "available" | "limited" | "unavailable";
  approximatePrice?: number;
  lastUpdated: string;
}

export interface DiagnosticResult {
  test: DiagnosticTest;
  facility: DiagnosticFacility;
  status: "available" | "limited" | "unavailable";
  approximatePrice?: number;
  lastUpdated: string;
  distance?: number;
}

// Demo diagnostic tests
export const demoDiagnosticTests: DiagnosticTest[] = [
  { id: "dt1", name: "Complete Blood Count (CBC)", category: "Blood Tests", description: "Measures various components of blood including red and white blood cells.", preparationInfo: "No special preparation required. Fasting not necessary." },
  { id: "dt2", name: "Blood Glucose (Fasting)", category: "Blood Tests", description: "Measures blood sugar levels after fasting.", preparationInfo: "Fast for 8-12 hours before the test. Drink only water." },
  { id: "dt3", name: "HbA1c", category: "Blood Tests", description: "Measures average blood sugar over 2-3 months.", preparationInfo: "No special preparation required." },
  { id: "dt4", name: "Lipid Profile", category: "Blood Tests", description: "Measures cholesterol and triglyceride levels.", preparationInfo: "Fast for 10-12 hours before the test." },
  { id: "dt5", name: "Thyroid Profile (T3, T4, TSH)", category: "Blood Tests", description: "Evaluates thyroid gland function.", preparationInfo: "No special preparation required." },
  { id: "dt6", name: "Liver Function Test (LFT)", category: "Blood Tests", description: "Assesses liver health and function.", preparationInfo: "Fast for 10-12 hours before the test." },
  { id: "dt7", name: "Kidney Function Test (KFT)", category: "Blood Tests", description: "Evaluates kidney function and health.", preparationInfo: "No special preparation required." },
  { id: "dt8", name: "Urine Routine Examination", category: "Urine Tests", description: "Analyzes urine for various health indicators.", preparationInfo: "Collect mid-stream urine in a sterile container." },
  { id: "dt9", name: "X-Ray Chest PA", category: "Imaging", description: "Standard chest X-ray examination.", preparationInfo: "Remove jewelry and wear loose clothing. No preparation needed." },
  { id: "dt10", name: "X-Ray (Other)", category: "Imaging", description: "Various X-ray examinations.", preparationInfo: "Follow specific instructions for the type of X-ray." },
  { id: "dt11", name: "Ultrasound (Abdomen)", category: "Imaging", description: "Ultrasound imaging of abdominal organs.", preparationInfo: "Fast for 6-8 hours before the test. Full bladder may be needed." },
  { id: "dt12", name: "ECG", category: "Cardiology", description: "Electrocardiogram to check heart rhythm.", preparationInfo: "No special preparation. Avoid caffeine before test." },
  { id: "dt13", name: "MRI Scan", category: "Imaging", description: "Magnetic Resonance Imaging for detailed internal images.", preparationInfo: "Remove all metal objects. Inform about implants." },
  { id: "dt14", name: "CT Scan", category: "Imaging", description: "Computed Tomography for cross-sectional images.", preparationInfo: "May need contrast dye. Follow fasting instructions." },
  { id: "dt15", name: "Dengue NS1 Antigen", category: "Blood Tests", description: "Test for dengue fever detection.", preparationInfo: "No special preparation required." },
  { id: "dt16", name: "Malaria Test", category: "Blood Tests", description: "Tests for malaria parasite detection.", preparationInfo: "No special preparation required." },
  { id: "dt17", name: "HIV Test", category: "Blood Tests", description: "Screening test for HIV infection.", preparationInfo: "No special preparation. Counseling available." },
  { id: "dt18", name: "Hepatitis B Surface Antigen", category: "Blood Tests", description: "Test for Hepatitis B infection.", preparationInfo: "No special preparation required." },
  { id: "dt19", name: "Pregnancy Test (Beta HCG)", category: "Blood Tests", description: "Blood test to confirm pregnancy.", preparationInfo: "No special preparation required." },
  { id: "dt20", name: "Vitamin D", category: "Blood Tests", description: "Measures Vitamin D levels in blood.", preparationInfo: "No special preparation required." },
];

// Demo facilities with diagnostic services
export const demoDiagFacilities: DiagnosticFacility[] = [
  { id: "df1", name: "JNMCH Diagnostic Centre", type: "Government Hospital", address: "NH-80, Shahpur", locality: "Shahpur, Bhagalpur", phone: "0641-2400261", latitude: 25.2350, longitude: 86.9750, operatingHours: "8:00 AM - 8:00 PM" },
  { id: "df2", name: "Gyan Dutt Diagnostics", type: "Private Lab", address: "Mithanagar, Tilkamanjhi", locality: "Tilkamanjhi, Bhagalpur", phone: "0641-2401234", latitude: 25.2480, longitude: 86.9680, operatingHours: "7:00 AM - 9:00 PM" },
  { id: "df3", name: "Sanjay Gandhi Memorial Lab", type: "PHC", address: "Sabour Road, Sabour", locality: "Sabour, Bhagalpur", phone: "0641-2405678", latitude: 25.2200, longitude: 86.9600, operatingHours: "9:00 AM - 4:00 PM" },
  { id: "df4", name: "Vijay Anand Diagnostics", type: "Private Lab", address: "Gulab Bagh", locality: "Gulab Bagh, Bhagalpur", phone: "0641-2409876", latitude: 25.2520, longitude: 86.9850, operatingHours: "8:00 AM - 8:00 PM" },
  { id: "df5", name: "District Hospital Diagnostics", type: "Government Hospital", address: "Collectorate Campus", locality: "City Center, Bhagalpur", phone: "0641-2400100", latitude: 25.2450, longitude: 86.9720, operatingHours: "24x7" },
  { id: "df6", name: "Narayanpur PHC", type: "PHC", address: "Main Road, Narayanpur", locality: "Narayanpur, Bhagalpur", phone: "0641-2402000", latitude: 25.2100, longitude: 86.9500, operatingHours: "9:00 AM - 5:00 PM" },
];

// Demo availability data
export const demoDiagAvailability: DiagnosticAvailability[] = [
  { testId: "dt1", facilityId: "df1", status: "available", approximatePrice: 300, lastUpdated: "2026-08-28" },
  { testId: "dt1", facilityId: "df2", status: "available", approximatePrice: 350, lastUpdated: "2026-08-28" },
  { testId: "dt1", facilityId: "df3", status: "available", approximatePrice: 200, lastUpdated: "2026-08-28" },
  { testId: "dt1", facilityId: "df5", status: "available", approximatePrice: 250, lastUpdated: "2026-08-28" },
  { testId: "dt1", facilityId: "df6", status: "limited", approximatePrice: 150, lastUpdated: "2026-08-28" },
  { testId: "dt2", facilityId: "df1", status: "available", approximatePrice: 150, lastUpdated: "2026-08-28" },
  { testId: "dt2", facilityId: "df2", status: "available", approximatePrice: 200, lastUpdated: "2026-08-28" },
  { testId: "dt2", facilityId: "df5", status: "available", approximatePrice: 100, lastUpdated: "2026-08-28" },
  { testId: "dt3", facilityId: "df1", status: "available", approximatePrice: 400, lastUpdated: "2026-08-28" },
  { testId: "dt3", facilityId: "df2", status: "available", approximatePrice: 450, lastUpdated: "2026-08-28" },
  { testId: "dt4", facilityId: "df1", status: "available", approximatePrice: 500, lastUpdated: "2026-08-28" },
  { testId: "dt4", facilityId: "df2", status: "available", approximatePrice: 550, lastUpdated: "2026-08-28" },
  { testId: "dt4", facilityId: "df5", status: "available", approximatePrice: 350, lastUpdated: "2026-08-28" },
  { testId: "dt5", facilityId: "df1", status: "available", approximatePrice: 450, lastUpdated: "2026-08-28" },
  { testId: "dt5", facilityId: "df2", status: "available", approximatePrice: 500, lastUpdated: "2026-08-28" },
  { testId: "dt6", facilityId: "df1", status: "available", approximatePrice: 500, lastUpdated: "2026-08-28" },
  { testId: "dt6", facilityId: "df2", status: "available", approximatePrice: 600, lastUpdated: "2026-08-28" },
  { testId: "dt7", facilityId: "df1", status: "available", approximatePrice: 400, lastUpdated: "2026-08-28" },
  { testId: "dt7", facilityId: "df2", status: "available", approximatePrice: 450, lastUpdated: "2026-08-28" },
  { testId: "dt8", facilityId: "df1", status: "available", approximatePrice: 100, lastUpdated: "2026-08-28" },
  { testId: "dt8", facilityId: "df2", status: "available", approximatePrice: 150, lastUpdated: "2026-08-28" },
  { testId: "dt8", facilityId: "df3", status: "available", approximatePrice: 80, lastUpdated: "2026-08-28" },
  { testId: "dt8", facilityId: "df5", status: "available", approximatePrice: 100, lastUpdated: "2026-08-28" },
  { testId: "dt9", facilityId: "df1", status: "available", approximatePrice: 200, lastUpdated: "2026-08-28" },
  { testId: "dt9", facilityId: "df5", status: "available", approximatePrice: 150, lastUpdated: "2026-08-28" },
  { testId: "dt10", facilityId: "df1", status: "available", approximatePrice: 250, lastUpdated: "2026-08-28" },
  { testId: "dt10", facilityId: "df5", status: "available", approximatePrice: 200, lastUpdated: "2026-08-28" },
  { testId: "dt11", facilityId: "df1", status: "available", approximatePrice: 800, lastUpdated: "2026-08-28" },
  { testId: "dt11", facilityId: "df2", status: "available", approximatePrice: 900, lastUpdated: "2026-08-28" },
  { testId: "dt12", facilityId: "df1", status: "available", approximatePrice: 200, lastUpdated: "2026-08-28" },
  { testId: "dt12", facilityId: "df5", status: "available", approximatePrice: 150, lastUpdated: "2026-08-28" },
  { testId: "dt13", facilityId: "df1", status: "limited", approximatePrice: 5000, lastUpdated: "2026-08-27" },
  { testId: "dt14", facilityId: "df1", status: "available", approximatePrice: 3000, lastUpdated: "2026-08-28" },
  { testId: "dt15", facilityId: "df1", status: "available", approximatePrice: 500, lastUpdated: "2026-08-28" },
  { testId: "dt15", facilityId: "df3", status: "limited", approximatePrice: 400, lastUpdated: "2026-08-28" },
  { testId: "dt16", facilityId: "df1", status: "available", approximatePrice: 300, lastUpdated: "2026-08-28" },
  { testId: "dt16", facilityId: "df3", status: "available", approximatePrice: 250, lastUpdated: "2026-08-28" },
  { testId: "dt17", facilityId: "df1", status: "available", approximatePrice: 500, lastUpdated: "2026-08-28" },
  { testId: "dt17", facilityId: "df5", status: "available", approximatePrice: 400, lastUpdated: "2026-08-28" },
  { testId: "dt18", facilityId: "df1", status: "available", approximatePrice: 400, lastUpdated: "2026-08-28" },
  { testId: "dt19", facilityId: "df1", status: "available", approximatePrice: 600, lastUpdated: "2026-08-28" },
  { testId: "dt20", facilityId: "df1", status: "available", approximatePrice: 1200, lastUpdated: "2026-08-28" },
  { testId: "dt20", facilityId: "df2", status: "available", approximatePrice: 1500, lastUpdated: "2026-08-28" },
];

export const testCategories = [...new Set(demoDiagnosticTests.map(t => t.category))];

export function searchDiagnosticTests(query: string): DiagnosticTest[] {
  if (!query) return demoDiagnosticTests;
  const q = query.toLowerCase();
  return demoDiagnosticTests.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q)
  );
}

export function getTestAvailability(
  testId: string,
  userLat: number,
  userLng: number
): DiagnosticResult[] {
  const availability = demoDiagAvailability.filter(a => a.testId === testId);
  return availability.map(av => {
    const facility = demoDiagFacilities.find(f => f.id === av.facilityId)!;
    const test = demoDiagnosticTests.find(t => t.id === testId)!;
    const dist = calculateDistance(userLat, userLng, facility.latitude, facility.longitude);
    return { test, facility, status: av.status, approximatePrice: av.approximatePrice, lastUpdated: av.lastUpdated, distance: dist };
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const d = (lat2 - lat1) * Math.PI / 180;
  const d2 = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(d / 2) * Math.sin(d / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(d2 / 2) * Math.sin(d2 / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
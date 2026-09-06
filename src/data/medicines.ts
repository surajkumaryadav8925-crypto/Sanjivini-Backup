// Medicine demo data - DEMO ONLY
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  commonUses: string[];
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  locality: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export interface InventoryItem {
  medicineId: string;
  facilityId: string;
  quantity: number;
  status: "available" | "low_stock" | "out_of_stock";
  lastUpdated: string;
}

export interface MedicineAvailability {
  medicine: Medicine;
  facility: Facility;
  quantity: number;
  status: "available" | "low_stock" | "out_of_stock";
  lastUpdated: string;
  distance?: number;
}

// Demo medicines
export const demoMedicines: Medicine[] = [
  { id: "m1", name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Pain Relief / Fever", commonUses: ["Fever", "Headache", "Body pain"] },
  { id: "m2", name: "Amoxicillin 500mg", genericName: "Amoxicillin", category: "Antibiotic", commonUses: ["Bacterial infections", "Respiratory infections"] },
  { id: "m3", name: "Metformin 500mg", genericName: "Metformin Hydrochloride", category: "Diabetes", commonUses: ["Type 2 Diabetes", "Blood sugar control"] },
  { id: "m4", name: "Insulin (Human) 70/30", genericName: "Insulin", category: "Diabetes", commonUses: ["Type 1 Diabetes", "Type 2 Diabetes"] },
  { id: "m5", name: "Omeprazole 20mg", genericName: "Omeprazole", category: "Gastric", commonUses: ["Acidity", "Gastric ulcer", "GERD"] },
  { id: "m6", name: "Cetirizine 10mg", genericName: "Cetirizine Hydrochloride", category: "Anti-allergic", commonUses: ["Allergies", "Cold", "Itching"] },
  { id: "m7", name: "Azithromycin 500mg", genericName: "Azithromycin", category: "Antibiotic", commonUses: ["Respiratory infections", "Skin infections"] },
  { id: "m8", name: "Diclofenac 50mg", genericName: "Diclofenac Sodium", category: "Pain Relief", commonUses: ["Joint pain", "Muscle pain", "Arthritis"] },
  { id: "m9", name: "Salbutamol 100mcg", genericName: "Salbutamol", category: "Respiratory", commonUses: ["Asthma", "Breathing difficulty", "COPD"] },
  { id: "m10", name: "Ranitidine 150mg", genericName: "Ranitidine", category: "Gastric", commonUses: ["Acidity", "Heartburn", "Peptic ulcer"] },
  { id: "m11", name: "Metronidazole 400mg", genericName: "Metronidazole", category: "Antibiotic", commonUses: ["Bacterial infections", "Parasitic infections"] },
  { id: "m12", name: "Ibuprofen 400mg", genericName: "Ibuprofen", category: "Pain Relief / Anti-inflammatory", commonUses: ["Fever", "Pain", "Inflammation"] },
  { id: "m13", name: "Lisinopril 5mg", genericName: "Lisinopril", category: "Cardiovascular", commonUses: ["High blood pressure", "Heart failure"] },
  { id: "m14", name: "Vitamin B12", genericName: "Cyanocobalamin", category: "Vitamins", commonUses: ["Anemia", "Vitamin deficiency", "Nerve health"] },
  { id: "m15", name: "ORS Sachets", genericName: "Oral Rehydration Salt", category: "Electrolytes", commonUses: ["Dehydration", "Diarrhea"] },
];

// Demo facilities
export const demoFacilities: Facility[] = [
  { id: "f1", name: "JNMCH Hospital Pharmacy", type: "Government Hospital", address: "NH-80, Shahpur", locality: "Shahpur, Bhagalpur", phone: "0641-2400261", latitude: 25.2350, longitude: 86.9750 },
  { id: "f2", name: "Gyan Dutt Pharmacy", type: "Private Pharmacy", address: "Mithanagar, Tilkamanjhi", locality: "Tilkamanjhi, Bhagalpur", phone: "0641-2401234", latitude: 25.2480, longitude: 86.9680 },
  { id: "f3", name: "Sanjay Gandhi Memorial Dispensary", type: "PHC", address: "Sabour Road, Sabour", locality: "Sabour, Bhagalpur", phone: "0641-2405678", latitude: 25.2200, longitude: 86.9600 },
  { id: "f4", name: "Vijay Anand Medical Store", type: "Private Pharmacy", address: "Gulab Bagh", locality: "Gulab Bagh, Bhagalpur", phone: "0641-2409876", latitude: 25.2520, longitude: 86.9850 },
  { id: "f5", name: "District Hospital Pharmacy", type: "Government Hospital", address: "Collectorate Campus", locality: "City Center, Bhagalpur", phone: "0641-2400100", latitude: 25.2450, longitude: 86.9720 },
  { id: "f6", name: "Narayanpur PHC", type: "PHC", address: "Main Road, Narayanpur", locality: "Narayanpur, Bhagalpur", phone: "0641-2402000", latitude: 25.2100, longitude: 86.9500 },
];

// Demo inventory data
export const demoInventory: InventoryItem[] = [
  { medicineId: "m1", facilityId: "f1", quantity: 500, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m1", facilityId: "f2", quantity: 200, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m1", facilityId: "f3", quantity: 50, status: "low_stock", lastUpdated: "2026-08-28" },
  { medicineId: "m1", facilityId: "f5", quantity: 300, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m2", facilityId: "f1", quantity: 100, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m2", facilityId: "f2", quantity: 0, status: "out_of_stock", lastUpdated: "2026-08-27" },
  { medicineId: "m2", facilityId: "f5", quantity: 80, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m3", facilityId: "f1", quantity: 200, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m3", facilityId: "f3", quantity: 30, status: "low_stock", lastUpdated: "2026-08-28" },
  { medicineId: "m4", facilityId: "f1", quantity: 20, status: "low_stock", lastUpdated: "2026-08-28" },
  { medicineId: "m4", facilityId: "f5", quantity: 0, status: "out_of_stock", lastUpdated: "2026-08-26" },
  { medicineId: "m5", facilityId: "f2", quantity: 150, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m5", facilityId: "f4", quantity: 100, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m6", facilityId: "f1", quantity: 300, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m6", facilityId: "f2", quantity: 80, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m6", facilityId: "f3", quantity: 40, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m7", facilityId: "f1", quantity: 60, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m7", facilityId: "f5", quantity: 0, status: "out_of_stock", lastUpdated: "2026-08-25" },
  { medicineId: "m8", facilityId: "f2", quantity: 120, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m8", facilityId: "f4", quantity: 15, status: "low_stock", lastUpdated: "2026-08-28" },
  { medicineId: "m9", facilityId: "f1", quantity: 40, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m9", facilityId: "f5", quantity: 25, status: "low_stock", lastUpdated: "2026-08-28" },
  { medicineId: "m10", facilityId: "f3", quantity: 100, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m10", facilityId: "f6", quantity: 60, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m11", facilityId: "f1", quantity: 90, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m12", facilityId: "f2", quantity: 180, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m13", facilityId: "f1", quantity: 50, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m13", facilityId: "f5", quantity: 10, status: "low_stock", lastUpdated: "2026-08-28" },
  { medicineId: "m14", facilityId: "f1", quantity: 200, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m14", facilityId: "f3", quantity: 100, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m15", facilityId: "f1", quantity: 500, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m15", facilityId: "f3", quantity: 300, status: "available", lastUpdated: "2026-08-28" },
  { medicineId: "m15", facilityId: "f6", quantity: 200, status: "available", lastUpdated: "2026-08-28" },
];

export const allCategories = [...new Set(demoMedicines.map(m => m.category))];

export function searchMedicines(query: string): Medicine[] {
  if (!query) return demoMedicines;
  const q = query.toLowerCase();
  return demoMedicines.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.genericName.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  );
}

export function getMedicineAvailability(
  medicineId: string,
  userLat: number,
  userLng: number
): MedicineAvailability[] {
  const inventory = demoInventory.filter(i => i.medicineId === medicineId);
  return inventory.map(inv => {
    const facility = demoFacilities.find(f => f.id === inv.facilityId)!;
    const medicine = demoMedicines.find(m => m.id === medicineId)!;
    const dist = calculateDistance(userLat, userLng, facility.latitude, facility.longitude);
    return { medicine, facility, quantity: inv.quantity, status: inv.status, lastUpdated: inv.lastUpdated, distance: dist };
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
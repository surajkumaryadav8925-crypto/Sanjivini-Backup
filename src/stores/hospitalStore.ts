import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export type InventoryStatus = 'available' | 'low_stock' | 'out_of_stock';
export interface Ward { id: string; name: string; totalBeds: number; availableBeds: number; occupiedBeds: number; reservedBeds: number; outOfService: number; }
export interface InventoryItem { id: string; name: string; category: string; currentStock: number; minRequired: number; status: InventoryStatus; lastUpdated: string; }
export interface BloodGroup { group: string; available: number; reserved: number; }
export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospitalName: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  contactPhone: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  requestedAt: string;
}
export interface OPDPatient { id: string; name: string; token: number; department: string; status: 'waiting' | 'called' | 'completed' | 'skipped'; addedAt: string; }
export interface OPDDepartment { id: string; name: string; currentToken: number; patients: OPDPatient[]; }
interface HospitalState {
  wards: Ward[]; inventory: InventoryItem[]; bloodGroups: BloodGroup[]; bloodRequests: BloodRequest[]; departments: OPDDepartment[];
  updateWardBed: (wardId: string, field: keyof Ward, value: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  updateBloodGroup: (group: string, field: 'available' | 'reserved', value: number) => void;
  requestBlood: (req: Omit<BloodRequest, 'id' | 'status' | 'requestedAt'>) => string;
  updateBloodRequestStatus: (id: string, status: BloodRequest['status']) => void;
  addPatientToQueue: (departmentId: string, name: string) => void;
  callNextPatient: (departmentId: string) => void;
  markPatientComplete: (departmentId: string, patientId: string) => void;
  skipPatient: (departmentId: string, patientId: string) => void;
  removePatient: (departmentId: string, patientId: string) => void;
}

const initialWards: Ward[] = [
  { id: 'general', name: 'General Ward', totalBeds: 50, availableBeds: 20, occupiedBeds: 25, reservedBeds: 3, outOfService: 2 },
  { id: 'icu', name: 'ICU', totalBeds: 20, availableBeds: 5, occupiedBeds: 12, reservedBeds: 2, outOfService: 1 },
  { id: 'emergency', name: 'Emergency', totalBeds: 15, availableBeds: 8, occupiedBeds: 5, reservedBeds: 1, outOfService: 1 },
  { id: 'pediatric', name: 'Pediatric', totalBeds: 25, availableBeds: 12, occupiedBeds: 10, reservedBeds: 2, outOfService: 1 },
  { id: 'maternity', name: 'Maternity', totalBeds: 20, availableBeds: 10, occupiedBeds: 8, reservedBeds: 1, outOfService: 1 },
  { id: 'private', name: 'Private Ward', totalBeds: 20, availableBeds: 8, occupiedBeds: 10, reservedBeds: 2, outOfService: 0 },
];
const initialInventory: InventoryItem[] = [
  { id: 'inv1', name: 'Paracetamol 500mg', category: 'Medicines', currentStock: 500, minRequired: 100, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'inv2', name: 'Amoxicillin 250mg', category: 'Medicines', currentStock: 45, minRequired: 50, status: 'low_stock', lastUpdated: new Date().toISOString() },
  { id: 'inv3', name: 'Ibuprofen 400mg', category: 'Medicines', currentStock: 200, minRequired: 80, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'inv4', name: 'Insulin Injection', category: 'Emergency Medicines', currentStock: 15, minRequired: 20, status: 'low_stock', lastUpdated: new Date().toISOString() },
  { id: 'inv5', name: 'Morphine Sulfate', category: 'Emergency Medicines', currentStock: 8, minRequired: 10, status: 'low_stock', lastUpdated: new Date().toISOString() },
  { id: 'inv6', name: 'Surgical Gloves (Box)', category: 'Medical Supplies', currentStock: 30, minRequired: 20, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'inv7', name: 'N95 Masks (Pack)', category: 'PPE', currentStock: 5, minRequired: 25, status: 'low_stock', lastUpdated: new Date().toISOString() },
  { id: 'inv8', name: 'Syringes 5ml', category: 'Medical Supplies', currentStock: 200, minRequired: 100, status: 'available', lastUpdated: new Date().toISOString() },
  { id: 'inv9', name: 'Ventilator Circuits', category: 'Equipment', currentStock: 3, minRequired: 5, status: 'low_stock', lastUpdated: new Date().toISOString() },
  { id: 'inv10', name: 'Adrenaline 1mg', category: 'Emergency Medicines', currentStock: 0, minRequired: 15, status: 'out_of_stock', lastUpdated: new Date().toISOString() },
];
const initialBloodGroups: BloodGroup[] = [
  { group: 'A+', available: 15, reserved: 3 }, { group: 'A-', available: 5, reserved: 1 },
  { group: 'B+', available: 20, reserved: 5 }, { group: 'B-', available: 3, reserved: 0 },
  { group: 'AB+', available: 8, reserved: 2 }, { group: 'AB-', available: 2, reserved: 0 },
  { group: 'O+', available: 25, reserved: 7 }, { group: 'O-', available: 10, reserved: 2 },
];

const initialBloodRequests: BloodRequest[] = [
  { id: 'BR-8492', patientName: 'Sanjay Kumar', bloodGroup: 'B+', units: 2, hospitalName: 'JNMCH Blood Bank', urgency: 'urgent', contactPhone: '+91 98765 43210', status: 'approved', requestedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'BR-8493', patientName: 'Anita Devi', bloodGroup: 'O+', units: 1, hospitalName: 'District Hospital Blood Bank', urgency: 'routine', contactPhone: '+91 91234 56789', status: 'pending', requestedAt: new Date(Date.now() - 1800000).toISOString() },
];

const initialDepartments: OPDDepartment[] = [
  { id: 'general-med', name: 'General Medicine', currentToken: 12, patients: [
    { id: 'p1', name: 'Ramesh Kumar', token: 1, department: 'General Medicine', status: 'completed', addedAt: new Date().toISOString() },
    { id: 'p2', name: 'Sita Devi', token: 2, department: 'General Medicine', status: 'completed', addedAt: new Date().toISOString() },
    { id: 'p3', name: 'Ajay Singh', token: 3, department: 'General Medicine', status: 'waiting', addedAt: new Date().toISOString() },
    { id: 'p4', name: 'Priya Sharma', token: 4, department: 'General Medicine', status: 'waiting', addedAt: new Date().toISOString() },
    { id: 'p5', name: 'Vikram Patel', token: 5, department: 'General Medicine', status: 'waiting', addedAt: new Date().toISOString() },
  ]},
  { id: 'pediatrics', name: 'Pediatrics', currentToken: 8, patients: [
    { id: 'p6', name: 'Little Star (Parent: Anil)', token: 1, department: 'Pediatrics', status: 'called', addedAt: new Date().toISOString() },
    { id: 'p7', name: 'Baby Mehta (Parent: Sunita)', token: 2, department: 'Pediatrics', status: 'waiting', addedAt: new Date().toISOString() },
  ]},
  { id: 'orthopedics', name: 'Orthopedics', currentToken: 5, patients: [
    { id: 'p8', name: 'Rajesh Verma', token: 1, department: 'Orthopedics', status: 'waiting', addedAt: new Date().toISOString() },
    { id: 'p9', name: 'Geeta Reddy', token: 2, department: 'Orthopedics', status: 'waiting', addedAt: new Date().toISOString() },
  ]},
  { id: 'gynecology', name: 'Gynecology', currentToken: 10, patients: [
    { id: 'p10', name: 'Lakshmi Narayan', token: 1, department: 'Gynecology', status: 'completed', addedAt: new Date().toISOString() },
    { id: 'p11', name: 'Meera Joshi', token: 2, department: 'Gynecology', status: 'waiting', addedAt: new Date().toISOString() },
    { id: 'p12', name: 'Kavita Desai', token: 3, department: 'Gynecology', status: 'waiting', addedAt: new Date().toISOString() },
  ]},
  { id: 'cardiology', name: 'Cardiology', currentToken: 3, patients: [
    { id: 'p13', name: 'Madhav Iyer', token: 1, department: 'Cardiology', status: 'waiting', addedAt: new Date().toISOString() },
  ]},
  { id: 'general-surgery', name: 'General Surgery', currentToken: 0, patients: [] },
  { id: 'dermatology', name: 'Dermatology', currentToken: 0, patients: [] },
  { id: 'eye-ent', name: 'Eye & ENT', currentToken: 0, patients: [] },
];

export const useHospitalStore = create<HospitalState>()(
  persist((set) => ({
    wards: initialWards, inventory: initialInventory, bloodGroups: initialBloodGroups, bloodRequests: initialBloodRequests, departments: initialDepartments,
    updateWardBed: (wardId, field, value) => set((state) => ({ wards: state.wards.map(w => w.id === wardId ? { ...w, [field]: Math.max(0, value) } : w) })),
    addInventoryItem: (item) => set((state) => ({ inventory: [...state.inventory, { ...item, id: 'inv' + Date.now() }] })),
    updateInventoryItem: (id, updates) => set((state) => ({ inventory: state.inventory.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates, lastUpdated: new Date().toISOString() };
      if (updated.currentStock <= 0) updated.status = 'out_of_stock';
      else if (updated.currentStock < updated.minRequired) updated.status = 'low_stock';
      else updated.status = 'available';
      return updated;
    }) })),
    removeInventoryItem: (id) => set((state) => ({ inventory: state.inventory.filter(item => item.id !== id) })),
    updateBloodGroup: (group, field, value) => set((state) => ({ bloodGroups: state.bloodGroups.map(bg => bg.group === group ? { ...bg, [field]: Math.max(0, value) } : bg) })),
    requestBlood: (req) => {
      const newId = `BR-${Math.floor(1000 + Math.random() * 9000)}`;
      set((state) => ({
        bloodRequests: [
          { ...req, id: newId, status: 'pending', requestedAt: new Date().toISOString() },
          ...state.bloodRequests
        ]
      }));
      return newId;
    },
    updateBloodRequestStatus: (id, status) => set((state) => {
      const targetReq = state.bloodRequests.find(r => r.id === id);
      if (!targetReq) return state;

      // If approving, transfer available units to reserved
      let updatedBloodGroups = state.bloodGroups;
      if (status === 'approved' && targetReq.status !== 'approved') {
        updatedBloodGroups = state.bloodGroups.map(bg => {
          if (bg.group === targetReq.bloodGroup) {
            const transfer = Math.min(bg.available, targetReq.units);
            return { ...bg, available: Math.max(0, bg.available - transfer), reserved: bg.reserved + transfer };
          }
          return bg;
        });
      } else if (status === 'fulfilled' && targetReq.status === 'approved') {
        // Deduct from reserved
        updatedBloodGroups = state.bloodGroups.map(bg => {
          if (bg.group === targetReq.bloodGroup) {
            return { ...bg, reserved: Math.max(0, bg.reserved - targetReq.units) };
          }
          return bg;
        });
      }

      return {
        bloodGroups: updatedBloodGroups,
        bloodRequests: state.bloodRequests.map(r => r.id === id ? { ...r, status } : r)
      };
    }),
    addPatientToQueue: (departmentId, name) => set((state) => ({ departments: state.departments.map(dept => {
      if (dept.id !== departmentId) return dept;
      const newToken = dept.currentToken + 1;
      return { ...dept, currentToken: newToken, patients: [...dept.patients, { id: 'p' + Date.now(), name, token: newToken, department: dept.name, status: 'waiting', addedAt: new Date().toISOString() }] };
    }) })),
    callNextPatient: (departmentId) => set((state) => ({ departments: state.departments.map(dept => dept.id === departmentId ? { ...dept, patients: dept.patients.map(p => p.status === 'waiting' ? { ...p, status: 'called' } : p) } : dept) })),
    markPatientComplete: (departmentId, patientId) => set((state) => ({ departments: state.departments.map(dept => dept.id === departmentId ? { ...dept, patients: dept.patients.map(p => p.id === patientId ? { ...p, status: 'completed' } : p) } : dept) })),
    skipPatient: (departmentId, patientId) => set((state) => ({ departments: state.departments.map(dept => dept.id === departmentId ? { ...dept, patients: dept.patients.map(p => p.id === patientId ? { ...p, status: 'skipped' } : p) } : dept) })),
    removePatient: (departmentId, patientId) => set((state) => ({ departments: state.departments.map(dept => dept.id === departmentId ? { ...dept, patients: dept.patients.filter(p => p.id !== patientId) } : dept) })),
  }), { name: 'hospital-storage', version: 1, migrate: (persisted, version) => {
    // v1: added General Surgery / Dermatology / Eye & ENT departments after a
    // duplicate-id fix — re-seed departments so demo bookings for them work
    // even with a stale persisted store.
    if (version < 1) {
      const p = (persisted ?? {}) as Partial<HospitalState>;
      return { ...p, departments: initialDepartments } as HospitalState;
    }
    return persisted as HospitalState;
  } })
);

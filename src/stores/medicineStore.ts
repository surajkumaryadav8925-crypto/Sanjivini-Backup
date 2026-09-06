import { create } from 'zustand';

export interface MyMedicine {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  duration: string;
  remainingDays: number;
  instructions: string;
  category: string;
  purpose: string;
}

export interface MedicineDose {
  id: string;
  medicineId: string;
  time: string;
  date: string;
  status: 'pending' | 'taken' | 'skipped';
}

export interface MedicineReminder {
  id: string;
  medicineId: string;
  medicineName: string;
  time: string;
  enabled: boolean;
}

const demoMyMedicines: MyMedicine[] = [
  {
    id: 'my-med-1',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    dosage: '500mg',
    frequency: 'Twice daily',
    times: ['08:00', '20:00'],
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '30 days',
    remainingDays: 23,
    instructions: 'Take with food to reduce stomach upset',
    category: 'Anti-diabetic',
    purpose: 'Type 2 Diabetes management',
  },
  {
    id: 'my-med-2',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    dosage: '5mg',
    frequency: 'Once daily',
    times: ['09:00'],
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '90 days',
    remainingDays: 76,
    instructions: 'Take at the same time each day',
    category: 'Anti-hypertensive',
    purpose: 'Blood pressure control',
  },
  {
    id: 'my-med-3',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    dosage: '60,000 IU',
    frequency: 'Once weekly',
    times: ['10:00'],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '90 days',
    remainingDays: 60,
    instructions: 'Take with a fatty meal for better absorption',
    category: 'Vitamin supplement',
    purpose: 'Bone health and immunity',
  },
];

interface MedicineStore {
  myMedicines: MyMedicine[];
  doses: MedicineDose[];
  reminders: MedicineReminder[];
  addMedicine: (medicine: MyMedicine) => void;
  removeMedicine: (id: string) => void;
  markDose: (doseId: string, status: 'taken' | 'skipped') => void;
  toggleReminder: (reminderId: string) => void;
  addReminder: (reminder: Omit<MedicineReminder, 'id'>) => void;
  removeReminder: (reminderId: string) => void;
  getTodayDoses: () => MedicineDose[];
  getDoseProgress: () => { taken: number; total: number };
}

export const useMedicineStore = create<MedicineStore>()((set, get) => ({
  myMedicines: demoMyMedicines,
  doses: [],
  reminders: demoMyMedicines.flatMap((med) =>
    med.times.map((time, idx) => ({
      id: `rem-${med.id}-${idx}`,
      medicineId: med.id,
      medicineName: med.name,
      time,
      enabled: true,
    }))
  ),
  addMedicine: (medicine) => set((state) => ({
    myMedicines: [...state.myMedicines, medicine],
  })),
  removeMedicine: (id) => set((state) => ({
    myMedicines: state.myMedicines.filter((m) => m.id !== id),
    reminders: state.reminders.filter((r) => r.medicineId !== id),
  })),
  markDose: (doseId, status) => set((state) => ({
    doses: state.doses.some((d) => d.id === doseId)
      ? state.doses.map((d) => (d.id === doseId ? { ...d, status } : d))
      : [...state.doses, {
          id: doseId,
          medicineId: doseId.split('-')[0],
          time: new Date().toISOString(),
          date: new Date().toISOString(),
          status,
        }],
  })),
  toggleReminder: (reminderId) => set((state) => ({
    reminders: state.reminders.map((r) =>
      r.id === reminderId ? { ...r, enabled: !r.enabled } : r
    ),
  })),
  addReminder: (reminder) => set((state) => ({
    reminders: [
      ...state.reminders,
      { ...reminder, id: `rem-${Date.now()}` },
    ],
  })),
  removeReminder: (reminderId) => set((state) => ({
    reminders: state.reminders.filter((r) => r.id !== reminderId),
  })),
  getTodayDoses: () => {
    const state = get();
    const today = new Date().toDateString();
    const todayDoses: MedicineDose[] = [];
    state.myMedicines.forEach((med) => {
      med.times.forEach((time) => {
        const doseId = `${med.id}-${time}`;
        const existingDose = state.doses.find(
          (d) => d.id === doseId && new Date(d.date).toDateString() === today
        );
        todayDoses.push({
          id: doseId,
          medicineId: med.id,
          time,
          date: new Date().toISOString(),
          status: existingDose?.status || 'pending',
        });
      });
    });
    return todayDoses.sort((a, b) => a.time.localeCompare(b.time));
  },
  getDoseProgress: () => {
    const state = get();
    const todayDoses = state.getTodayDoses();
    const taken = todayDoses.filter((d) => d.status === 'taken').length;
    return { taken, total: todayDoses.length };
  },
}));
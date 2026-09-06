// Medical Records Demo Data - DEMO ONLY
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  doctor: string;
  department: string;
  date: string;
  visitType: "consultation" | "followup" | "emergency";
  symptoms: string;
  diagnosis: string;
  prescription: Prescription[];
  tests: TestOrdered[];
  followUpDate?: string;
  notes?: string;
}

export interface Prescription {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface TestOrdered {
  testName: string;
  status: "pending" | "completed";
  result?: string;
}

export interface DiagnosticReport {
  id: string;
  patientId: string;
  recordId: string;
  testName: string;
  facilityName: string;
  date: string;
  status: "pending" | "completed" | "available";
  reportUrl?: string;
  result?: string;
}

export interface RecordAccess {
  patientId: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  accessGranted: boolean;
  grantedDate?: string;
}

// Demo Patient
export const demoPatient: Patient = {
  id: "P001",
  name: "Rajesh Kumar",
  age: 45,
  gender: "Male",
  bloodGroup: "B+",
  allergies: ["Penicillin", "Dust"],
  chronicConditions: ["Type 2 Diabetes", "Hypertension"],
  emergencyContact: "9876543210"
};

// Demo Healthcare Facilities
export const facilities = [
  { id: "F001", name: "Badh Bazar PHC", type: "PHC", address: "Badh Bazar, NH-80" },
  { id: "F002", name: "Demo Rural Hospital", type: "Rural Hospital", address: "Rural Block, NH-80" },
  { id: "F003", name: "District Hospital Bhagalpur", type: "District Hospital", address: "Main Road, Bhagalpur" },
];

// Demo Medical Records - Healthcare Journey
export const medicalRecords: MedicalRecord[] = [
  {
    id: "R001",
    patientId: "P001",
    facilityId: "F001",
    facilityName: "Badh Bazar PHC",
    facilityType: "PHC",
    doctor: "Dr. Anita Singh",
    department: "General Medicine",
    date: "2024-01-15",
    visitType: "consultation",
    symptoms: "Fever, headache, body pain for 3 days",
    diagnosis: "Viral Fever",
    prescription: [
      { medicine: "Paracetamol 500mg", dosage: "500mg", frequency: "3 times daily", duration: "3 days" },
      { medicine: "ORS Sachets", dosage: "1 sachet", frequency: "After loose motion", duration: "2 days" }
    ],
    tests: [],
    followUpDate: "2024-01-20",
    notes: "Rest advised. Continue fluids."
  },
  {
    id: "R002",
    patientId: "P001",
    facilityId: "F001",
    facilityName: "Badh Bazar PHC",
    facilityType: "PHC",
    doctor: "Dr. Anita Singh",
    department: "General Medicine",
    date: "2024-01-20",
    visitType: "followup",
    symptoms: "Persistent fever",
    diagnosis: "Suspected Typhoid Fever",
    prescription: [
      { medicine: "Azithromycin 500mg", dosage: "500mg", frequency: "Once daily", duration: "5 days" }
    ],
    tests: [
      { testName: "Widal Test", status: "pending" },
      { testName: "CBC", status: "pending" }
    ],
    followUpDate: "2024-01-25",
    notes: "Referred to Rural Hospital for tests."
  },
  {
    id: "R003",
    patientId: "P001",
    facilityId: "F002",
    facilityName: "Demo Rural Hospital",
    facilityType: "Rural Hospital",
    doctor: "Dr. Ramesh Yadav",
    department: "General Medicine",
    date: "2024-01-22",
    visitType: "consultation",
    symptoms: "Referred from PHC - fever, weakness",
    diagnosis: "Typhoid Fever (Confirmed)",
    prescription: [
      { medicine: "Cefixime 200mg", dosage: "200mg", frequency: "Twice daily", duration: "7 days" },
      { medicine: "Paracetamol 650mg", dosage: "650mg", frequency: "When fever > 101", duration: "As needed" },
      { medicine: "Vitamin B Complex", dosage: "1 tablet", frequency: "Once daily", duration: "14 days" }
    ],
    tests: [
      { testName: "Widal Test", status: "completed", result: "Positive (1:160)" },
      { testName: "CBC", status: "completed", result: "Low WBC count" }
    ],
    followUpDate: "2024-02-05",
    notes: "Bed rest important. Light diet advised."
  },
  {
    id: "R004",
    patientId: "P001",
    facilityId: "F003",
    facilityName: "District Hospital Bhagalpur",
    facilityType: "District Hospital",
    doctor: "Dr. Priya Sharma",
    department: "General Medicine",
    date: "2024-02-10",
    visitType: "consultation",
    symptoms: "Follow-up - recovering from typhoid, also reported increased thirst and urination",
    diagnosis: "Typhoid Convalescence + Rule out Diabetes",
    prescription: [
      { medicine: "Metformin 500mg", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "With meals" },
      { medicine: "Multivitamin", dosage: "1 tablet", frequency: "Once daily", duration: "30 days" }
    ],
    tests: [
      { testName: "Fasting Blood Sugar", status: "completed", result: "126 mg/dL (Pre-diabetic)" },
      { testName: "HbA1c", status: "pending" }
    ],
    followUpDate: "2024-03-10",
    notes: "Dietary advice given. Sugar monitoring important."
  },
  {
    id: "R005",
    patientId: "P001",
    facilityId: "F003",
    facilityName: "District Hospital Bhagalpur",
    facilityType: "District Hospital",
    doctor: "Dr. Sanjay Verma",
    department: "Cardiology",
    date: "2024-03-10",
    visitType: "consultation",
    symptoms: "Chest discomfort, occasional palpitations",
    diagnosis: "Normal Sinus Rhythm - No Cardiac Abnormality",
    prescription: [
      { medicine: "Ecospirin 75mg", dosage: "75mg", frequency: "Once daily", duration: "90 days", instructions: "After dinner" }
    ],
    tests: [
      { testName: "ECG", status: "completed", result: "Normal" },
      { testName: "2D Echo", status: "completed", result: "Normal LV function" }
    ],
    followUpDate: "2024-06-10",
    notes: "Annual cardiac checkup recommended."
  }
];

// Demo Diagnostic Reports
export const diagnosticReports: DiagnosticReport[] = [
  { id: "DR001", patientId: "P001", recordId: "R003", testName: "Widal Test", facilityName: "Demo Rural Hospital", date: "2024-01-22", status: "completed", result: "Positive (1:160)" },
  { id: "DR002", patientId: "P001", recordId: "R003", testName: "CBC", facilityName: "Demo Rural Hospital", date: "2024-01-22", status: "completed", result: "WBC: 3,500/cumm, RBC: 4.2 million/cumm" },
  { id: "DR003", patientId: "P001", recordId: "R004", testName: "Fasting Blood Sugar", facilityName: "District Hospital Bhagalpur", date: "2024-02-10", status: "completed", result: "126 mg/dL" },
  { id: "DR004", patientId: "P001", recordId: "R005", testName: "ECG", facilityName: "District Hospital Bhagalpur", date: "2024-03-10", status: "available", result: "Normal Sinus Rhythm" },
  { id: "DR005", patientId: "P001", recordId: "R005", testName: "2D Echocardiography", facilityName: "District Hospital Bhagalpur", date: "2024-03-10", status: "available", result: "Normal LV function, EF 60%" },
  { id: "DR006", patientId: "P001", recordId: "R004", testName: "HbA1c", facilityName: "District Hospital Bhagalpur", date: "2024-02-15", status: "pending" },
];

// Demo Record Access
export const recordAccess: RecordAccess[] = [
  { patientId: "P001", facilityId: "F001", facilityName: "Badh Bazar PHC", facilityType: "PHC", accessGranted: true, grantedDate: "2024-01-15" },
  { patientId: "P001", facilityId: "F002", facilityName: "Demo Rural Hospital", facilityType: "Rural Hospital", accessGranted: true, grantedDate: "2024-01-22" },
  { patientId: "P001", facilityId: "F003", facilityName: "District Hospital Bhagalpur", facilityType: "District Hospital", accessGranted: true, grantedDate: "2024-02-10" },
];

// Helper functions
export function getPatientRecords(patientId: string): MedicalRecord[] {
  return medicalRecords.filter(r => r.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPatientReports(patientId: string): DiagnosticReport[] {
  return diagnosticReports.filter(r => r.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPatientAccess(patientId: string): RecordAccess[] {
  return recordAccess.filter(a => a.patientId === patientId);
}

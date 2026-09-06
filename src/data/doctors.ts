// Doctor and Teleconsultation Types
export type Specialization = 
  | 'general'
  | 'cardiology'
  | 'pediatrics'
  | 'gynecology'
  | 'dermatology'
  | 'orthopedics'
  | 'neurology'
  | 'ophthalmology';

export interface Doctor {
  id: string;
  name: string;
  specialization: Specialization;
  qualification: string;
  experience: number; // years
  languages: string[];
  consultationFee: number;
  availability: 'available' | 'busy' | 'offline';
  facility: string;
  location: string;
  bio: string;
  rating: number;
  totalConsultations: number;
  imageInitials: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Consultation {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: Specialization;
  date: string;
  time: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  concern: string;
  fee: number;
  notes?: string;
}

// Demo doctors data
export const demoDoctors: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Priya Sharma',
    specialization: 'general',
    qualification: 'MBBS, MD (General Medicine)',
    experience: 12,
    languages: ['Hindi', 'English'],
    consultationFee: 300,
    availability: 'available',
    facility: 'District Hospital Bhagalpur',
    location: 'Bhagalpur, Bihar',
    bio: 'Experienced general physician with expertise in diabetes and hypertension management.',
    rating: 4.8,
    totalConsultations: 2450,
    imageInitials: 'PS',
  },
  {
    id: 'doc-002',
    name: 'Dr. Rajesh Kumar',
    specialization: 'cardiology',
    qualification: 'MBBS, DM (Cardiology)',
    experience: 15,
    languages: ['Hindi', 'English', 'Bhojpuri'],
    consultationFee: 500,
    availability: 'available',
    facility: 'JNMCH, Bhagalpur',
    location: 'Bhagalpur, Bihar',
    bio: 'Specialist in interventional cardiology and heart disease prevention.',
    rating: 4.9,
    totalConsultations: 3200,
    imageInitials: 'RK',
  },
  {
    id: 'doc-003',
    name: 'Dr. Meera Gupta',
    specialization: 'pediatrics',
    qualification: 'MBBS, DCH, DNB',
    experience: 10,
    languages: ['Hindi', 'English'],
    consultationFee: 350,
    availability: 'available',
    facility: 'PHC Nathnagar',
    location: 'Bhagalpur, Bihar',
    bio: 'Dedicated pediatrician focused on child nutrition and immunization.',
    rating: 4.7,
    totalConsultations: 1800,
    imageInitials: 'MG',
  },
  {
    id: 'doc-004',
    name: 'Dr. Sunita Devi',
    specialization: 'gynecology',
    qualification: 'MBBS, MS (Obs & Gyn)',
    experience: 14,
    languages: ['Hindi', 'Maithili'],
    consultationFee: 400,
    availability: 'available',
    facility: 'District Hospital Bhagalpur',
    location: 'Bhagalpur, Bihar',
    bio: 'Expert in maternal health and reproductive medicine.',
    rating: 4.9,
    totalConsultations: 4100,
    imageInitials: 'SD',
  },
  {
    id: 'doc-005',
    name: 'Dr. Amit Singh',
    specialization: 'dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    experience: 8,
    languages: ['Hindi', 'English'],
    consultationFee: 450,
    availability: 'busy',
    facility: 'Private Clinic',
    location: 'Bhagalpur, Bihar',
    bio: 'Specialist in skin disorders, cosmetic dermatology, and STD treatment.',
    rating: 4.6,
    totalConsultations: 1200,
    imageInitials: 'AS',
  },
  {
    id: 'doc-006',
    name: 'Dr. Vikash Yadav',
    specialization: 'orthopedics',
    qualification: 'MBBS, MS (Ortho), DNB',
    experience: 11,
    languages: ['Hindi', 'Bhojpuri'],
    consultationFee: 400,
    availability: 'available',
    facility: 'District Hospital Bhagalpur',
    location: 'Bhagalpur, Bihar',
    bio: 'Expert in joint replacement and sports medicine.',
    rating: 4.7,
    totalConsultations: 2100,
    imageInitials: 'VY',
  },
  {
    id: 'doc-007',
    name: 'Dr. Neha Kumari',
    specialization: 'neurology',
    qualification: 'MBBS, DM (Neurology)',
    experience: 9,
    languages: ['Hindi', 'English', 'Maithili'],
    consultationFee: 550,
    availability: 'available',
    facility: 'JNMCH, Bhagalpur',
    location: 'Bhagalpur, Bihar',
    bio: 'Neurologist specializing in headache disorders and epilepsy.',
    rating: 4.8,
    totalConsultations: 980,
    imageInitials: 'NK',
  },
  {
    id: 'doc-008',
    name: 'Dr. Ramesh Prasad',
    specialization: 'ophthalmology',
    qualification: 'MBBS, MS (Ophthalmology)',
    experience: 16,
    languages: ['Hindi', 'English'],
    consultationFee: 350,
    availability: 'offline',
    facility: 'Eye Care Center',
    location: 'Bhagalpur, Bihar',
    bio: 'Experienced ophthalmologist in cataract surgery and eye disease treatment.',
    rating: 4.9,
    totalConsultations: 5600,
    imageInitials: 'RP',
  },
];

// Available time slots for teleconsultation
export const availableTimeSlots: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: false },
  { time: '11:00 AM', available: true },
  { time: '11:30 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '02:00 PM', available: true },
  { time: '02:30 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '03:30 PM', available: true },
  { time: '04:00 PM', available: false },
  { time: '04:30 PM', available: true },
  { time: '05:00 PM', available: true },
  { time: '05:30 PM', available: true },
];

// Helper to get specialization label
export const specializationLabels: Record<Specialization, string> = {
  general: 'General Physician',
  cardiology: 'Cardiologist',
  pediatrics: 'Pediatrician',
  gynecology: 'Gynecologist',
  dermatology: 'Dermatologist',
  orthopedics: 'Orthopedic',
  neurology: 'Neurologist',
  ophthalmology: 'Ophthalmologist',
};
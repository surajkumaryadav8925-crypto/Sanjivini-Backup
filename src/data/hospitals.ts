// Multi-district Hospital Registry - Bihar Public & Rural Healthcare System
export type HospitalTier = 'PHC' | 'CHC' | 'SDH' | 'District Hospital' | 'Medical College';

export interface HospitalDoctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  available: boolean;
  schedule: string;
}

export interface HospitalDepartment {
  id: string;
  name: string;
  available: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Trust';
  tier: HospitalTier;
  district: string;
  address: string;
  locality: string;
  phone: string;
  latitude: number;
  longitude: number;
  emergencyAvailable: boolean;
  departments: HospitalDepartment[];
  doctors: HospitalDoctor[];
  openingHours: string;
  distance?: number;
  availableBeds: number;
  totalBeds: number;
  bloodBankAvailable: boolean;
  icuAvailable: boolean;
}

export interface DistrictLocation {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const DISTRICTS: DistrictLocation[] = [
  { name: 'Bhagalpur', state: 'Bihar', latitude: 25.2445, longitude: 86.9718, description: 'Eastern Bihar Headquarters & Silk City' },
  { name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, description: 'State Capital & Apex Tertiary Care Hub' },
  { name: 'Gaya', state: 'Bihar', latitude: 24.7914, longitude: 85.0002, description: 'Magadh Division & Pilgrimage Health Hub' },
  { name: 'Muzaffarpur', state: 'Bihar', latitude: 26.1209, longitude: 85.3647, description: 'Tirhut Division & North Bihar Referral Center' },
  { name: 'Darbhanga', state: 'Bihar', latitude: 26.1542, longitude: 85.8918, description: 'Mithila Region Medical & Academic Hub' },
  { name: 'Purnia', state: 'Bihar', latitude: 25.7771, longitude: 87.4753, description: 'Seemanchal Regional Healthcare Center' },
  { name: 'Nalanda', state: 'Bihar', latitude: 25.1357, longitude: 85.4578, description: 'Central Bihar Heritage & Medical District' },
];

export const BHAGALPUR_LOCATION = DISTRICTS[0];

export const demoHospitals: Hospital[] = [
  // --- BHAGALPUR DISTRICT ---
  {
    id: 'h1',
    name: 'Jawaharlal Nehru Medical College & Hospital (JLNMCH)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Bhagalpur',
    address: 'NH-80, Mayaganj',
    locality: 'Mayaganj, Bhagalpur',
    phone: '0641-2400261',
    latitude: 25.2350,
    longitude: 86.9750,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 124,
    totalBeds: 500,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'General Surgery', available: true },
      { id: 'd3', name: 'Pediatrics', available: true },
      { id: 'd4', name: 'Orthopedics', available: true },
      { id: 'd5', name: 'Gynecology & Obstetrics', available: true },
      { id: 'd6', name: 'Emergency & Trauma', available: true },
      { id: 'd7', name: 'ICU & Critical Care', available: true },
      { id: 'd8', name: 'Cardiology', available: true },
    ],
    doctors: [
      { id: 'doc1', name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', qualification: 'MD, FICP', available: true, schedule: '9 AM - 4 PM' },
      { id: 'doc2', name: 'Dr. Priya Singh', specialty: 'Pediatrics', qualification: 'MD (Pediatrics)', available: true, schedule: '10 AM - 2 PM' },
      { id: 'doc3', name: 'Dr. A. K. Choudhary', specialty: 'General Surgery', qualification: 'MS (Surgery)', available: true, schedule: '9 AM - 3 PM' },
    ],
  },
  {
    id: 'h5',
    name: 'District Sadar Hospital Bhagalpur',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Bhagalpur',
    address: 'Collectorate Campus, Kutchery Road',
    locality: 'City Center, Bhagalpur',
    phone: '0641-2400100',
    latitude: 25.2450,
    longitude: 86.9720,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 45,
    totalBeds: 120,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Pediatrics', available: true },
      { id: 'd3', name: 'Emergency', available: true },
      { id: 'd4', name: 'Gynecology', available: true },
      { id: 'd5', name: 'Eye & ENT', available: true },
    ],
    doctors: [
      { id: 'doc10', name: 'Dr. Ashok Prasad', specialty: 'General Medicine', qualification: 'MD', available: true, schedule: '9 AM - 3 PM' },
      { id: 'doc11', name: 'Dr. Sunita Mandal', specialty: 'Gynecology', qualification: 'DGO, MS', available: true, schedule: '10 AM - 4 PM' },
    ],
  },
  {
    id: 'h-bgp-sdh',
    name: 'Sub-Divisional Hospital Kahalgaon',
    type: 'Government',
    tier: 'SDH',
    district: 'Bhagalpur',
    address: 'Station Road, Kahalgaon',
    locality: 'Kahalgaon, Bhagalpur',
    phone: '06429-222345',
    latitude: 25.2630,
    longitude: 87.2340,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 22,
    totalBeds: 50,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Emergency', available: true },
      { id: 'd3', name: 'Maternal & Child Health', available: true },
    ],
    doctors: [
      { id: 'doc-bgp-sdh1', name: 'Dr. Vivek Bharti', specialty: 'General Medicine', qualification: 'MBBS', available: true, schedule: '8 AM - 2 PM' },
    ],
  },
  {
    id: 'h-bgp-phc',
    name: 'Primary Health Center (PHC) Sabour',
    type: 'Government',
    tier: 'PHC',
    district: 'Bhagalpur',
    address: 'Sabour Block Campus',
    locality: 'Sabour, Bhagalpur',
    phone: '0641-2451102',
    latitude: 25.2280,
    longitude: 87.0350,
    emergencyAvailable: false,
    openingHours: '8 AM - 4 PM',
    availableBeds: 6,
    totalBeds: 12,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General OPD', available: true },
      { id: 'd2', name: 'Immunization / ANC', available: true },
      { id: 'd3', name: 'Pharmacy', available: true },
    ],
    doctors: [
      { id: 'doc-bgp-phc1', name: 'Dr. Shweta Kumari', specialty: 'Medical Officer', qualification: 'MBBS', available: true, schedule: '8 AM - 4 PM' },
    ],
  },
  {
    id: 'h2',
    name: 'Gyan Dutt Hospital',
    type: 'Private',
    tier: 'District Hospital',
    district: 'Bhagalpur',
    address: 'Mithanagar, Tilkamanjhi',
    locality: 'Tilkamanjhi, Bhagalpur',
    phone: '0641-2401234',
    latitude: 25.2480,
    longitude: 86.9680,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 18,
    totalBeds: 40,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Cardiology', available: true },
      { id: 'd3', name: 'Emergency', available: true },
      { id: 'd4', name: 'ICU', available: true },
    ],
    doctors: [
      { id: 'doc4', name: 'Dr. Sanjay Mishra', specialty: 'Cardiology', qualification: 'DM (Cardio)', available: true, schedule: '10 AM - 6 PM' },
    ],
  },
  {
    id: 'h3',
    name: 'Sanjay Gandhi Memorial Hospital',
    type: 'Trust',
    tier: 'CHC',
    district: 'Bhagalpur',
    address: 'Sabour Road, Sabour',
    locality: 'Sabour, Bhagalpur',
    phone: '0641-2405678',
    latitude: 25.2200,
    longitude: 86.9600,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 14,
    totalBeds: 35,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Surgery', available: true },
      { id: 'd3', name: 'Gynecology', available: true },
    ],
    doctors: [
      { id: 'doc6', name: 'Dr. Meena Kumari', specialty: 'Gynecology', qualification: 'MS', available: true, schedule: '9 AM - 3 PM' },
    ],
  },
  {
    id: 'h4',
    name: 'Vijay Anand Hospital',
    type: 'Private',
    tier: 'SDH',
    district: 'Bhagalpur',
    address: 'Gulab Bagh',
    locality: 'Gulab Bagh, Bhagalpur',
    phone: '0641-2409876',
    latitude: 25.2520,
    longitude: 86.9850,
    emergencyAvailable: false,
    openingHours: '8 AM - 8 PM',
    availableBeds: 8,
    totalBeds: 20,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Orthopedics', available: true },
    ],
    doctors: [
      { id: 'doc8', name: 'Dr. Ankit Agarwal', specialty: 'Orthopedics', qualification: 'MS', available: true, schedule: '10 AM - 5 PM' },
    ],
  },

  // --- PATNA DISTRICT ---
  {
    id: 'h-pat-pmch',
    name: 'Patna Medical College & Hospital (PMCH)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Patna',
    address: 'Ashok Rajpath, Muradpur',
    locality: 'Muradpur, Patna',
    phone: '0612-2300080',
    latitude: 25.6207,
    longitude: 85.1588,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 340,
    totalBeds: 1750,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Emergency & Trauma', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
      { id: 'd3', name: 'General Surgery', available: true },
      { id: 'd4', name: 'Pediatrics', available: true },
      { id: 'd5', name: 'Cardiology', available: true },
      { id: 'd6', name: 'Neurology', available: true },
      { id: 'd7', name: 'ICU', available: true },
    ],
    doctors: [
      { id: 'doc-pmch1', name: 'Dr. I. S. Thakur', specialty: 'Superintendent / Surgery', qualification: 'MS, MCh', available: true, schedule: '9 AM - 4 PM' },
      { id: 'doc-pmch2', name: 'Dr. Rashmi Sinha', specialty: 'Gynecology', qualification: 'MD, FICOG', available: true, schedule: '9 AM - 2 PM' },
    ],
  },
  {
    id: 'h-pat-aiims',
    name: 'All India Institute of Medical Sciences (AIIMS) Patna',
    type: 'Government',
    tier: 'Medical College',
    district: 'Patna',
    address: 'Phulwari Sharif, Aurandabad Road',
    locality: 'Phulwari Sharif, Patna',
    phone: '0612-2451006',
    latitude: 25.5615,
    longitude: 85.0446,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 180,
    totalBeds: 960,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Trauma & Emergency', available: true },
      { id: 'd2', name: 'Cardiothoracic Surgery', available: true },
      { id: 'd3', name: 'Nephrology & Dialysis', available: true },
      { id: 'd4', name: 'Oncology', available: true },
      { id: 'd5', name: 'Pediatrics', available: true },
    ],
    doctors: [
      { id: 'doc-aiims1', name: 'Dr. Sanjeev Kumar', specialty: 'Cardiology', qualification: 'MD, DM', available: true, schedule: '9 AM - 5 PM' },
    ],
  },
  {
    id: 'h-pat-sadar',
    name: 'Gardanibagh Sadar Hospital Patna',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Patna',
    address: 'Road No. 1, Gardanibagh',
    locality: 'Gardanibagh, Patna',
    phone: '0612-2250101',
    latitude: 25.5978,
    longitude: 85.1221,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 58,
    totalBeds: 150,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Emergency', available: true },
      { id: 'd3', name: 'Maternal Care', available: true },
      { id: 'd4', name: 'Pediatrics', available: true },
    ],
    doctors: [
      { id: 'doc-sadar-pat1', name: 'Dr. Arvind Verma', specialty: 'General Medicine', qualification: 'MD', available: true, schedule: '9 AM - 3 PM' },
    ],
  },
  {
    id: 'h-pat-phc',
    name: 'Primary Health Center (PHC) Danapur',
    type: 'Government',
    tier: 'PHC',
    district: 'Patna',
    address: 'Danapur Cantt Area',
    locality: 'Danapur, Patna',
    phone: '0612-2511202',
    latitude: 25.6322,
    longitude: 85.0421,
    emergencyAvailable: false,
    openingHours: '8 AM - 4 PM',
    availableBeds: 10,
    totalBeds: 15,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General OPD', available: true },
      { id: 'd2', name: 'Immunization', available: true },
      { id: 'd3', name: 'Maternal Welfare', available: true },
    ],
    doctors: [
      { id: 'doc-danapur1', name: 'Dr. Sneha Roy', specialty: 'Medical Officer', qualification: 'MBBS', available: true, schedule: '8 AM - 4 PM' },
    ],
  },

  // --- GAYA DISTRICT ---
  {
    id: 'h-gay-anmmch',
    name: 'Anugrah Narayan Magadh Medical College & Hospital (ANMMCH)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Gaya',
    address: 'Cherki Road, Gaya',
    locality: 'Medical College Campus, Gaya',
    phone: '0631-2410339',
    latitude: 24.8167,
    longitude: 84.9752,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 165,
    totalBeds: 650,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Emergency & Casualty', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
      { id: 'd3', name: 'Surgery', available: true },
      { id: 'd4', name: 'Orthopedics', available: true },
      { id: 'd5', name: 'Pediatrics', available: true },
    ],
    doctors: [
      { id: 'doc-gay1', name: 'Dr. B. P. Jaiswal', specialty: 'General Medicine', qualification: 'MD', available: true, schedule: '9 AM - 4 PM' },
    ],
  },
  {
    id: 'h-gay-sadar',
    name: 'Jay Prakash Narayan District Hospital Gaya',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Gaya',
    address: 'Near Gandhi Maidan, Gaya',
    locality: 'City Center, Gaya',
    phone: '0631-2220456',
    latitude: 24.7960,
    longitude: 85.0080,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 48,
    totalBeds: 120,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Pediatrics', available: true },
      { id: 'd3', name: 'Emergency', available: true },
      { id: 'd4', name: 'Eye Clinic', available: true },
    ],
    doctors: [
      { id: 'doc-gay2', name: 'Dr. Manorama Sinha', specialty: 'Pediatrics', qualification: 'DCH, MD', available: true, schedule: '9 AM - 3 PM' },
    ],
  },
  {
    id: 'h-gay-phc',
    name: 'Community Health Center (CHC) Bodhgaya',
    type: 'Government',
    tier: 'CHC',
    district: 'Gaya',
    address: 'Near Maya Sarovar, Bodhgaya',
    locality: 'Bodhgaya, Gaya',
    phone: '0631-2200234',
    latitude: 24.6961,
    longitude: 84.9870,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 18,
    totalBeds: 30,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Emergency OPD', available: true },
      { id: 'd3', name: 'Maternal Care', available: true },
    ],
    doctors: [
      { id: 'doc-gay3', name: 'Dr. Alok Nath', specialty: 'General Practitioner', qualification: 'MBBS', available: true, schedule: '9 AM - 5 PM' },
    ],
  },

  // --- MUZAFFARPUR DISTRICT ---
  {
    id: 'h-muz-skmch',
    name: 'Sri Krishna Medical College & Hospital (SKMCH)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Muzaffarpur',
    address: 'Umanagar, SKMCH Campus',
    locality: 'Umanagar, Muzaffarpur',
    phone: '0621-2260177',
    latitude: 26.1601,
    longitude: 85.3995,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 210,
    totalBeds: 800,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'PICU & Encephalitis Ward', available: true },
      { id: 'd2', name: 'Emergency', available: true },
      { id: 'd3', name: 'Surgery', available: true },
      { id: 'd4', name: 'General Medicine', available: true },
      { id: 'd5', name: 'Pediatrics', available: true },
    ],
    doctors: [
      { id: 'doc-muz1', name: 'Dr. Gopal Shankar', specialty: 'Pediatrics & PICU', qualification: 'MD', available: true, schedule: '9 AM - 4 PM' },
    ],
  },
  {
    id: 'h-muz-sadar',
    name: 'Sadar Hospital Muzaffarpur',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Muzaffarpur',
    address: 'Company Bagh, Civil Lines',
    locality: 'Company Bagh, Muzaffarpur',
    phone: '0621-2244101',
    latitude: 26.1215,
    longitude: 85.3720,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 62,
    totalBeds: 150,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General OPD', available: true },
      { id: 'd2', name: 'Emergency', available: true },
      { id: 'd3', name: 'Orthopedics', available: true },
      { id: 'd4', name: 'Dialysis Unit', available: true },
    ],
    doctors: [
      { id: 'doc-muz2', name: 'Dr. Anita Rani', specialty: 'Gynecology', qualification: 'MS', available: true, schedule: '9 AM - 3 PM' },
    ],
  },
  {
    id: 'h-muz-phc',
    name: 'Primary Health Center (PHC) Kanti',
    type: 'Government',
    tier: 'PHC',
    district: 'Muzaffarpur',
    address: 'Kanti Block Headquarters',
    locality: 'Kanti, Muzaffarpur',
    phone: '0621-2812001',
    latitude: 26.1950,
    longitude: 85.2910,
    emergencyAvailable: false,
    openingHours: '8 AM - 4 PM',
    availableBeds: 8,
    totalBeds: 12,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General OPD', available: true },
      { id: 'd2', name: 'Immunization', available: true },
    ],
    doctors: [
      { id: 'doc-muz3', name: 'Dr. R. K. Shahi', specialty: 'Medical Officer', qualification: 'MBBS', available: true, schedule: '8 AM - 4 PM' },
    ],
  },

  // --- DARBHANGA DISTRICT ---
  {
    id: 'h-dar-dmch',
    name: 'Darbhanga Medical College & Hospital (DMCH)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Darbhanga',
    address: 'Laheriasarai, DMCH Road',
    locality: 'Laheriasarai, Darbhanga',
    phone: '06272-233228',
    latitude: 26.1264,
    longitude: 85.9015,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 240,
    totalBeds: 1050,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Emergency & Trauma', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
      { id: 'd3', name: 'Cardiology', available: true },
      { id: 'd4', name: 'Pediatrics', available: true },
      { id: 'd5', name: 'Nephrology', available: true },
    ],
    doctors: [
      { id: 'doc-dar1', name: 'Dr. K. N. Mishra', specialty: 'General Medicine', qualification: 'MD, FRCP', available: true, schedule: '9 AM - 4 PM' },
    ],
  },
  {
    id: 'h-dar-sadar',
    name: 'District Sadar Hospital Darbhanga',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Darbhanga',
    address: 'Hospital Road, Darbhanga',
    locality: 'City Center, Darbhanga',
    phone: '06272-221200',
    latitude: 26.1550,
    longitude: 85.8950,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 42,
    totalBeds: 100,
    bloodBankAvailable: true,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Emergency', available: true },
      { id: 'd3', name: 'MCH Wing', available: true },
    ],
    doctors: [
      { id: 'doc-dar2', name: 'Dr. Poonam Jha', specialty: 'Gynecology', qualification: 'MS', available: true, schedule: '10 AM - 3 PM' },
    ],
  },
  {
    id: 'h-dar-sdh',
    name: 'Sub-Divisional Hospital Benipur',
    type: 'Government',
    tier: 'SDH',
    district: 'Darbhanga',
    address: 'Benipur Market Road',
    locality: 'Benipur, Darbhanga',
    phone: '06272-277102',
    latitude: 26.0420,
    longitude: 86.1320,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 16,
    totalBeds: 35,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'Emergency OPD', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
    ],
    doctors: [
      { id: 'doc-dar3', name: 'Dr. Sunil Thakur', specialty: 'Medical Officer', qualification: 'MBBS', available: true, schedule: '8 AM - 2 PM' },
    ],
  },

  // --- PURNIA DISTRICT ---
  {
    id: 'h-pur-gmch',
    name: 'Government Medical College & Hospital Purnia (GMCH)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Purnia',
    address: 'Line Bazar, Purnia',
    locality: 'Line Bazar, Purnia',
    phone: '06454-242001',
    latitude: 25.7790,
    longitude: 87.4810,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 155,
    totalBeds: 500,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Emergency & Critical Care', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
      { id: 'd3', name: 'Surgery', available: true },
      { id: 'd4', name: 'Pediatrics', available: true },
    ],
    doctors: [
      { id: 'doc-pur1', name: 'Dr. Sanjay Bhattacharya', specialty: 'General Surgery', qualification: 'MS', available: true, schedule: '9 AM - 4 PM' },
    ],
  },
  {
    id: 'h-pur-sadar',
    name: 'Sadar Hospital Purnia',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Purnia',
    address: 'Near Bus Stand, Line Bazar',
    locality: 'Line Bazar, Purnia',
    phone: '06454-241100',
    latitude: 25.7745,
    longitude: 87.4720,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 52,
    totalBeds: 120,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Emergency', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
      { id: 'd3', name: 'Maternal & Newborn Care', available: true },
    ],
    doctors: [
      { id: 'doc-pur2', name: 'Dr. Meenu Soren', specialty: 'Gynecology', qualification: 'DGO', available: true, schedule: '9 AM - 3 PM' },
    ],
  },

  // --- NALANDA DISTRICT ---
  {
    id: 'h-nal-vims',
    name: 'Vardhman Institute of Medical Sciences (VIMS Pawapuri)',
    type: 'Government',
    tier: 'Medical College',
    district: 'Nalanda',
    address: 'Pawapuri, Nalanda',
    locality: 'Pawapuri, Nalanda',
    phone: '06112-262100',
    latitude: 25.0925,
    longitude: 85.5312,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 195,
    totalBeds: 650,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'Emergency & Trauma', available: true },
      { id: 'd2', name: 'General Medicine', available: true },
      { id: 'd3', name: 'Surgery', available: true },
      { id: 'd4', name: 'Orthopedics', available: true },
      { id: 'd5', name: 'Cardiology', available: true },
    ],
    doctors: [
      { id: 'doc-nal1', name: 'Dr. P. K. Choudhary', specialty: 'General Medicine', qualification: 'MD', available: true, schedule: '9 AM - 4 PM' },
    ],
  },
  {
    id: 'h-nal-sadar',
    name: 'District Sadar Hospital Bihar Sharif',
    type: 'Government',
    tier: 'District Hospital',
    district: 'Nalanda',
    address: 'Ranchi Road, Bihar Sharif',
    locality: 'Bihar Sharif, Nalanda',
    phone: '06112-234200',
    latitude: 25.1950,
    longitude: 85.5180,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 45,
    totalBeds: 110,
    bloodBankAvailable: true,
    icuAvailable: true,
    departments: [
      { id: 'd1', name: 'General Medicine', available: true },
      { id: 'd2', name: 'Emergency', available: true },
      { id: 'd3', name: 'Pediatrics', available: true },
    ],
    doctors: [
      { id: 'doc-nal2', name: 'Dr. Ramesh Prasad', specialty: 'Pediatrics', qualification: 'MD', available: true, schedule: '9 AM - 3 PM' },
    ],
  },
  {
    id: 'h-nal-phc',
    name: 'Primary Health Center (PHC) Rajgir',
    type: 'Government',
    tier: 'PHC',
    district: 'Nalanda',
    address: 'Kund Area Road, Rajgir',
    locality: 'Rajgir, Nalanda',
    phone: '06112-255102',
    latitude: 25.0285,
    longitude: 85.4190,
    emergencyAvailable: true,
    openingHours: '24x7',
    availableBeds: 12,
    totalBeds: 20,
    bloodBankAvailable: false,
    icuAvailable: false,
    departments: [
      { id: 'd1', name: 'General OPD', available: true },
      { id: 'd2', name: 'Emergency First Aid', available: true },
      { id: 'd3', name: 'Maternal Welfare', available: true },
    ],
    doctors: [
      { id: 'doc-nal3', name: 'Dr. Kavita Kumari', specialty: 'Medical Officer', qualification: 'MBBS', available: true, schedule: '8 AM - 4 PM' },
    ],
  },
];

export const allDepartments = [
  'General Medicine',
  'General Surgery',
  'Surgery',
  'Pediatrics',
  'Orthopedics',
  'Gynecology & Obstetrics',
  'Gynecology',
  'Emergency & Trauma',
  'Emergency',
  'ICU & Critical Care',
  'ICU',
  'Cardiology',
  'Neurology',
  'Nephrology',
  'Maternal & Child Health',
  'Immunization',
  'Eye & ENT',
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
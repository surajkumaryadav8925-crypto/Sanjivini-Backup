-- Seed Data for ArogyaSetu Healthcare Platform
-- DEMO DATA ONLY - All information is fictional

-- Create demo users
INSERT INTO profiles (id, email, full_name, phone, role, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'patient@demo.com', 'Demo Patient', '+919876543210', 'patient', true),
  ('22222222-2222-2222-2222-222222222222', 'hospital@demo.com', 'Hospital Admin', '+919876543211', 'hospital_staff', true),
  ('33333333-3333-3333-3333-333333333333', 'admin@demo.com', 'Government Admin', '+919876543212', 'government_admin', true);

-- Create demo patient
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, city, district, state) VALUES
  ('aaaa0000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '1990-05-15', 'male', 'B+', 'Delhi', 'Central Delhi', 'Delhi');

-- Create demo hospitals
INSERT INTO hospitals (id, name, type, category, address, city, district, state, pincode, phone, latitude, longitude, verification_status, bed_capacity, icu_capacity) VALUES
  ('bbbb0000-0000-0000-0000-000000000001', 'Demo District Hospital', 'government', 'district_hospital', '123 Main Road', 'Delhi', 'Central Delhi', 'Delhi', '110001', '+911123456789', 28.6139, 77.2090, 'verified', 200, 30),
  ('bbbb0000-0000-0000-0000-000000000002', 'Demo Medical College', 'government', 'medical_college', '456 University Road', 'Delhi', 'South Delhi', 'Delhi', '110002', '+911123456790', 28.5355, 77.2100, 'verified', 500, 80),
  ('bbbb0000-0000-0000-0000-000000000003', 'Demo Private Hospital', 'private', 'nursing_home', '789 Park Street', 'Delhi', 'North Delhi', 'Delhi', '110003', '+911123456791', 28.7180, 77.2080, 'verified', 100, 15);

-- Create hospital staff
INSERT INTO hospital_staff (id, user_id, hospital_id, department, designation) VALUES
  ('cccc0000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'bbbb0000-0000-0000-0000-000000000001', 'Administration', 'Hospital Administrator');

-- Create beds
INSERT INTO beds (hospital_id, bed_type, bed_number, ward, status, is_icu, has_oxygen) VALUES
  ('bbbb0000-0000-0000-0000-000000000001', 'icu', 'ICU-1', 'ICU Ward', 'available', true, true),
  ('bbbb0000-0000-0000-0000-000000000001', 'icu', 'ICU-2', 'ICU Ward', 'occupied', true, true),
  ('bbbb0000-0000-0000-0000-000000000001', 'general', 'G-101', 'Ward A', 'available', false, true),
  ('bbbb0000-0000-0000-0000-000000000001', 'general', 'G-102', 'Ward A', 'occupied', false, true),
  ('bbbb0000-0000-0000-0000-000000000001', 'private', 'P-1', 'Private Wing', 'available', false, true);

-- Create medicines
INSERT INTO medicines (id, name, generic_name, category, unit, dosage_form) VALUES
  ('dddd0000-0000-0000-0000-000000000001', 'Paracetamol 500mg', 'Acetaminophen', 'Analgesics', 'tablet', 'tablet'),
  ('dddd0000-0000-0000-0000-000000000002', 'Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'capsule', 'capsule'),
  ('dddd0000-0000-0000-0000-000000000003', 'Ibuprofen 400mg', 'Ibuprofen', 'NSAIDs', 'tablet', 'tablet'),
  ('dddd0000-0000-0000-0000-000000000004', 'Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', 'capsule', 'capsule'),
  ('dddd0000-0000-0000-0000-000000000005', 'Metformin 500mg', 'Metformin', 'Antidiabetic', 'tablet', 'tablet');

-- Create medicine inventory
INSERT INTO medicine_inventory (hospital_id, medicine_id, quantity, min_quantity) VALUES
  ('bbbb0000-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000001', 500, 100),
  ('bbbb0000-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000002', 200, 50),
  ('bbbb0000-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000003', 300, 75),
  ('bbbb0000-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000004', 150, 40),
  ('bbbb0000-0000-0000-0000-000000000001', 'dddd0000-0000-0000-0000-000000000005', 180, 50);

-- Create blood inventory
INSERT INTO blood_inventory (hospital_id, blood_group, units_available, units_minimum) VALUES
  ('bbbb0000-0000-0000-0000-000000000001', 'A+', 15, 10),
  ('bbbb0000-0000-0000-0000-000000000001', 'A-', 5, 5),
  ('bbbb0000-0000-0000-0000-000000000001', 'B+', 20, 10),
  ('bbbb0000-0000-0000-0000-000000000001', 'B-', 8, 5),
  ('bbbb0000-0000-0000-0000-000000000001', 'AB+', 10, 5),
  ('bbbb0000-0000-0000-0000-000000000001', 'AB-', 3, 3),
  ('bbbb0000-0000-0000-0000-000000000001', 'O+', 18, 10),
  ('bbbb0000-0000-0000-0000-000000000001', 'O-', 6, 5);

-- Create doctors
INSERT INTO doctors (id, hospital_id, name, specialization, qualification, experience_years, is_active) VALUES
  ('eeee0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'Dr. Rajesh Kumar', 'General Medicine', 'MBBS, MD', 15, true),
  ('eeee0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000001', 'Dr. Priya Sharma', 'Pediatrics', 'MBBS, MD', 10, true),
  ('eeee0000-0000-0000-0000-000000000003', 'bbbb0000-0000-0000-0000-000000000001', 'Dr. Amit Singh', 'Cardiology', 'MBBS, DM', 12, true),
  ('eeee0000-0000-0000-0000-000000000004', 'bbbb0000-0000-0000-0000-000000000001', 'Dr. Neha Gupta', 'Orthopedics', 'MBBS, MS', 8, true);

-- Create OPD queues
INSERT INTO opd_queues (id, hospital_id, department, date, total_tokens, current_token, is_active) VALUES
  ('ffff0000-0000-0000-0000-000000000001', 'bbbb0000-0000-0000-0000-000000000001', 'General Medicine', CURRENT_DATE, 45, 12, true),
  ('ffff0000-0000-0000-0000-000000000002', 'bbbb0000-0000-0000-0000-000000000001', 'Pediatrics', CURRENT_DATE, 20, 8, true),
  ('ffff0000-0000-0000-0000-000000000003', 'bbbb0000-0000-0000-0000-000000000001', 'Orthopedics', CURRENT_DATE, 15, 3, true);

-- NOTE: This is DEMO data. Do not use in production.
-- All information is fictional and for demonstration purposes only.

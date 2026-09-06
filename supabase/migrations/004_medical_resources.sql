-- Beds Table
CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    bed_type bed_type NOT NULL,
    bed_number TEXT NOT NULL,
    ward TEXT,
    floor TEXT,
    status bed_status DEFAULT 'available',
    is_icu BOOLEAN DEFAULT false,
    has_oxygen BOOLEAN DEFAULT false,
    has_ventilator BOOLEAN DEFAULT false,
    price_per_day NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, bed_number)
);

-- Medicines Table
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    dosage_form TEXT,
    strength TEXT,
    manufacturer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicine Inventory Table
CREATE TABLE medicine_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number TEXT,
    expiry_date DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER DEFAULT 10,
    location TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, medicine_id)
);

-- Blood Inventory Table
CREATE TABLE blood_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group blood_group NOT NULL,
    units_available INTEGER NOT NULL DEFAULT 0,
    units_minimum INTEGER DEFAULT 10,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, blood_group)
);

-- Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    qualification TEXT NOT NULL,
    registration_number TEXT,
    experience_years INTEGER,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    consultation_fee NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor Availability Table
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    max_appointments INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week)
);

-- Indexes
CREATE INDEX idx_beds_hospital_id ON beds(hospital_id);
CREATE INDEX idx_medicine_inventory_hospital_id ON medicine_inventory(hospital_id);
CREATE INDEX idx_blood_inventory_hospital_id ON blood_inventory(hospital_id);
CREATE INDEX idx_doctors_hospital_id ON doctors(hospital_id);

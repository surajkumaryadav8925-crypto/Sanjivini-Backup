-- Hospitals Table
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_name TEXT,
    type hospital_type NOT NULL,
    category hospital_category NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    verification_status hospital_verification_status DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    license_number TEXT,
    bed_capacity INTEGER,
    icu_capacity INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital Staff Table
CREATE TABLE hospital_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    department TEXT,
    designation TEXT NOT NULL,
    employee_id TEXT,
    is_active BOOLEAN DEFAULT true,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_hospital_staff_user_id ON hospital_staff(user_id);
CREATE INDEX idx_hospital_staff_hospital_id ON hospital_staff(hospital_id);

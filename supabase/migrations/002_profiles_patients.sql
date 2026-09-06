-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    abha_id TEXT,
    abha_profile_id TEXT,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    blood_group blood_group,
    address TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Family Members Table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    relation TEXT NOT NULL,
    blood_group blood_group,
    phone TEXT,
    email TEXT,
    abha_id TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_family_members_patient_id ON family_members(patient_id);

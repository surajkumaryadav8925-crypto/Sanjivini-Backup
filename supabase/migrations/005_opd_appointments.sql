-- Triage Sessions Table
CREATE TABLE triage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    symptoms JSONB NOT NULL,
    age INTEGER NOT NULL,
    gender gender NOT NULL,
    medical_history TEXT[],
    medications TEXT[],
    result JSONB,
    status triage_status DEFAULT 'in_progress',
    preferred_language TEXT DEFAULT 'en',
    voice_input_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- OPD Queues Table
CREATE TABLE opd_queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    date DATE NOT NULL,
    total_tokens INTEGER DEFAULT 0,
    current_token INTEGER DEFAULT 0,
    average_wait_time INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, department, date)
);

-- OPD Tokens Table
CREATE TABLE opd_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_id UUID REFERENCES opd_queues(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    token_number INTEGER NOT NULL,
    status opd_queue_status DEFAULT 'waiting',
    estimated_time TIME,
    called_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(queue_id, token_number)
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    department TEXT NOT NULL,
    reason TEXT,
    status appointment_status DEFAULT 'scheduled',
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Alerts Table
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    location_address TEXT,
    emergency_type TEXT NOT NULL,
    description TEXT,
    status emergency_status DEFAULT 'reported',
    assigned_hospital_id UUID REFERENCES hospitals(id),
    ambulance_requested BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Hospital Reviews Table
CREATE TABLE hospital_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    facilities_rating INTEGER CHECK (facilities_rating >= 1 AND facilities_rating <= 5),
    status review_status DEFAULT 'pending',
    hospital_response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, patient_id)
);

-- Indexes
CREATE INDEX idx_triage_sessions_patient_id ON triage_sessions(patient_id);
CREATE INDEX idx_opd_queues_hospital_id ON opd_queues(hospital_id);
CREATE INDEX idx_opd_tokens_queue_id ON opd_tokens(queue_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_emergency_alerts_patient_id ON emergency_alerts(patient_id);
CREATE INDEX idx_reviews_hospital_id ON hospital_reviews(hospital_id);

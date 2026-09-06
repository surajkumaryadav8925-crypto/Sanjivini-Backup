-- Symptom Events Table (for analytics)
CREATE TABLE symptom_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district TEXT NOT NULL,
    symptom TEXT NOT NULL,
    age_group TEXT NOT NULL,
    gender gender NOT NULL,
    count INTEGER DEFAULT 1,
    date DATE NOT NULL,
    is_aggregated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outbreak Clusters Table
CREATE TABLE outbreak_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    disease TEXT NOT NULL,
    severity outbreak_severity NOT NULL,
    reported_cases INTEGER DEFAULT 0,
    suspected_cases INTEGER,
    deaths INTEGER,
    status outbreak_status DEFAULT 'investigating',
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PM-JAY Checks Table
CREATE TABLE pmjay_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    is_eligible BOOLEAN NOT NULL,
    ration_card_number TEXT,
    family_id TEXT,
    sec_status TEXT,
    district TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offline Sync Operations Table
CREATE TABLE offline_sync_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    operation offline_operation_type NOT NULL,
    payload JSONB NOT NULL,
    status sync_status DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics tables
CREATE INDEX idx_symptom_events_district ON symptom_events(district);
CREATE INDEX idx_symptom_events_date ON symptom_events(date);
CREATE INDEX idx_outbreak_clusters_district ON outbreak_clusters(district);
CREATE INDEX idx_offline_sync_user_id ON offline_sync_operations(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

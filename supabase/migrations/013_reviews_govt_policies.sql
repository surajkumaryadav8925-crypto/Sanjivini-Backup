-- Hospital Reviews Policies
CREATE POLICY "Patients can create reviews for visited hospitals"
    ON hospital_reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can view their own reviews"
    ON hospital_reviews FOR SELECT
    USING (
        patient_id = auth.uid() OR
        status = 'approved'
    );

CREATE POLICY "Hospital staff can manage reviews for their hospital"
    ON hospital_reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = hospital_id AND hs.user_id = auth.uid()
        )
    );

-- Notifications Policies
CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Government Admin Policies (Read-only access to aggregated data)
CREATE POLICY "Government admins can view symptom events"
    ON symptom_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('government_admin', 'super_admin')
        )
    );

CREATE POLICY "Government admins can view outbreak clusters"
    ON outbreak_clusters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('government_admin', 'super_admin')
        )
    );

CREATE POLICY "Government admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'super_admin'
        )
    );

-- PM-JAY Checks Policies
CREATE POLICY "Patients can manage their PM-JAY checks"
    ON pmjay_checks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

-- Offline Sync Operations Policies
CREATE POLICY "Users can manage their offline operations"
    ON offline_sync_operations FOR ALL
    USING (user_id = auth.uid());

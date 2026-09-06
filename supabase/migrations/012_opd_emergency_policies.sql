-- OPD Policies
CREATE POLICY "Patients can manage their OPD tokens"
    ON opd_tokens FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Hospital staff can manage OPD in their hospital"
    ON opd_tokens FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM opd_queues oq
            JOIN hospital_staff hs ON hs.hospital_id = oq.hospital_id
            WHERE oq.id = queue_id AND hs.user_id = auth.uid()
        )
    );

CREATE POLICY "Hospital staff can manage OPD queues"
    ON opd_queues FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = hospital_id AND hs.user_id = auth.uid()
        )
    );

-- Triage Sessions Policies
CREATE POLICY "Patients can manage their triage sessions"
    ON triage_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

-- Appointments Policies
CREATE POLICY "Patients can manage their appointments"
    ON appointments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

-- Emergency Alerts Policies
CREATE POLICY "Patients can create emergency alerts"
    ON emergency_alerts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can view their emergency alerts"
    ON emergency_alerts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Assigned hospitals can view emergency alerts"
    ON emergency_alerts FOR SELECT
    USING (
        assigned_hospital_id IS NULL OR
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = assigned_hospital_id AND hs.user_id = auth.uid()
        )
    );

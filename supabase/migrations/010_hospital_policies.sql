-- Hospitals Policies (Public read for verified hospitals)
CREATE POLICY "Anyone can view verified hospitals"
    ON hospitals FOR SELECT
    USING (verification_status = 'verified');

CREATE POLICY "Hospital staff can view their hospital"
    ON hospitals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = id AND hs.user_id = auth.uid()
        )
    );

CREATE POLICY "Government admins can view all hospitals"
    ON hospitals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('government_admin', 'super_admin')
        )
    );

-- Hospital Staff Policies
CREATE POLICY "Staff can view their own records"
    ON hospital_staff FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Hospital staff can view their hospital staff"
    ON hospital_staff FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs2
            WHERE hs2.hospital_id = hospital_id AND hs2.user_id = auth.uid()
        )
    );

-- Beds Policies
CREATE POLICY "Anyone can view bed availability"
    ON beds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hospitals h
            WHERE h.id = hospital_id AND h.verification_status = 'verified'
        )
    );

CREATE POLICY "Hospital staff can manage beds in their hospital"
    ON beds FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = hospital_id AND hs.user_id = auth.uid()
        )
    );

CREATE POLICY "Government admins can view all beds"
    ON beds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('government_admin', 'super_admin')
        )
    );

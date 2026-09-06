-- Medicines Policies (Public read)
CREATE POLICY "Anyone can view medicines"
    ON medicines FOR SELECT
    USING (true);

-- Medicine Inventory Policies
CREATE POLICY "Hospital staff can manage inventory in their hospital"
    ON medicine_inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = hospital_id AND hs.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view medicine availability"
    ON medicine_inventory FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hospitals h
            WHERE h.id = hospital_id AND h.verification_status = 'verified'
        )
    );

-- Blood Inventory Policies
CREATE POLICY "Anyone can view blood inventory"
    ON blood_inventory FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hospitals h
            WHERE h.id = hospital_id AND h.verification_status = 'verified'
        )
    );

CREATE POLICY "Hospital staff can manage blood inventory"
    ON blood_inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = hospital_id AND hs.user_id = auth.uid()
        )
    );

-- Doctors Policies
CREATE POLICY "Anyone can view active doctors"
    ON doctors FOR SELECT
    USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM hospitals h
            WHERE h.id = hospital_id AND h.verification_status = 'verified'
        )
    );

CREATE POLICY "Hospital staff can manage doctors in their hospital"
    ON doctors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM hospital_staff hs
            WHERE hs.hospital_id = hospital_id AND hs.user_id = auth.uid()
        )
    );

-- Doctor Availability Policies
CREATE POLICY "Anyone can view doctor availability"
    ON doctor_availability FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctors d
            JOIN hospitals h ON h.id = d.hospital_id
            WHERE d.doctor_id = doctor_id AND h.verification_status = 'verified'
        )
    );

CREATE POLICY "Hospital staff can manage doctor availability"
    ON doctor_availability FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM doctors d
            JOIN hospital_staff hs ON hs.hospital_id = d.hospital_id
            WHERE d.doctor_id = doctor_id AND hs.user_id = auth.uid()
        )
    );

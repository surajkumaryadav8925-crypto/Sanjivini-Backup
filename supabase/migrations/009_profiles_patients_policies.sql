-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Government admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p2 
            WHERE p2.id = auth.uid() 
            AND p2.role IN ('government_admin', 'super_admin')
        )
    );

-- Patients Policies
CREATE POLICY "Users can view their own patient record"
    ON patients FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own patient record"
    ON patients FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patient record"
    ON patients FOR UPDATE
    USING (user_id = auth.uid());

-- Family Members Policies
CREATE POLICY "Patients can manage their family members"
    ON family_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p 
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

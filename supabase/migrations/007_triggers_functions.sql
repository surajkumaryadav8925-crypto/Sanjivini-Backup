-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hospitals_updated_at 
    BEFORE UPDATE ON hospitals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hospital_staff_updated_at 
    BEFORE UPDATE ON hospital_staff 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_beds_updated_at 
    BEFORE UPDATE ON beds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_medicine_inventory_updated_at 
    BEFORE UPDATE ON medicine_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blood_inventory_updated_at 
    BEFORE UPDATE ON blood_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_doctors_updated_at 
    BEFORE UPDATE ON doctors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_doctor_availability_updated_at 
    BEFORE UPDATE ON doctor_availability 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_opd_queues_updated_at 
    BEFORE UPDATE ON opd_queues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_opd_tokens_updated_at 
    BEFORE UPDATE ON opd_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hospital_reviews_updated_at 
    BEFORE UPDATE ON hospital_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

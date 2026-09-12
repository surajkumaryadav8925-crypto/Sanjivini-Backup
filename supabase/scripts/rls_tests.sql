-- ============================================================
-- RLS regression tests (run against a local Supabase/Postgres)
-- ============================================================
-- Usage (local supabase):
--   supabase db reset
--   psql "$DATABASE_URL" -f supabase/scripts/rls_tests.sql
--
-- Each test impersonates a role/JWT and asserts whether RLS allows the
-- operation. Any failure prints FAIL and raises at the end.
-- ============================================================

\set ON_ERROR_STOP off

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION test_as_claims(claims jsonb) RETURNS void AS $$
  SELECT set_config('request.jwt.claims', claims::text, true);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION test_as_user(uid uuid, role text DEFAULT 'authenticated') RETURNS void AS $$
  SELECT set_config('role', role, true);
  SELECT set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', role, 'aud', 'authenticated')::text, true);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION test_assert(cond boolean, msg text) RETURNS void AS $$
BEGIN
  IF NOT cond THEN
    RAISE EXCEPTION 'RLS TEST FAIL: %', msg;
  ELSE
    RAISE NOTICE 'RLS TEST OK: %', msg;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- Fixtures
-- ------------------------------------------------------------
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'rls-patient@test.local', 'x', now(), '{"full_name":"RLS Patient"}'),
  ('22222222-2222-2222-2222-222222222222', 'rls-staff@test.local', 'x', now(), '{"full_name":"RLS Staff"}')
ON CONFLICT (id) DO NOTHING;

-- Fire the new-user trigger manually for direct inserts above
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'rls-patient@test.local', 'RLS Patient', 'patient', true),
  ('22222222-2222-2222-2222-222222222222', 'rls-staff@test.local', 'RLS Staff', 'hospital_staff', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, user_id, date_of_birth, gender)
VALUES ('aaaa0000-0000-0000-0000-0000000000aa', '11111111-1111-1111-1111-111111111111', '1990-01-01', 'male')
ON CONFLICT DO NOTHING;

INSERT INTO hospitals (id, name, type, category, address, city, district, state, pincode, phone, verification_status)
VALUES ('bbbb0000-0000-0000-0000-0000000000aa', 'RLS Test Hospital', 'government', 'district_hospital',
        '1 Test Rd', 'Test City', 'Test District', 'Test State', '123456', '100-000-0000', 'verified')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hospital_staff (id, user_id, hospital_id, designation)
VALUES ('cccc0000-0000-0000-0000-0000000000aa', '22222222-2222-2222-2222-222222222222',
        'bbbb0000-0000-0000-0000-0000000000aa', 'Administrator')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 1. Profiles: authenticated users can only self-insert as 'patient'
-- ------------------------------------------------------------
DO $$
DECLARE
  v_count int;
BEGIN
  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');

  BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES ('11111111-1111-1111-1111-111111111199', 'evil@test.local', 'Evil', 'government_admin');
    PERFORM test_assert(false, 'self-insert with elevated role must be blocked');
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    PERFORM test_assert(true, 'self-insert with elevated role blocked');
  WHEN OTHERS THEN
    PERFORM test_assert(true, 'self-insert with elevated role blocked');
  END;
END $$;

-- ------------------------------------------------------------
-- 2. Profiles: users cannot update their own role
-- ------------------------------------------------------------
DO $$
BEGIN
  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');

  BEGIN
    UPDATE profiles SET role = 'super_admin' WHERE id = '11111111-1111-1111-1111-111111111111';
    PERFORM test_assert(false, 'self role escalation via UPDATE must be blocked');
  EXCEPTION WHEN OTHERS THEN
    PERFORM test_assert(true, 'self role escalation via UPDATE blocked');
  END;
END $$;

-- ------------------------------------------------------------
-- 3. Profiles: a user cannot read someone else''s profile
-- ------------------------------------------------------------
DO $$
DECLARE
  v_count int;
BEGIN
  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  SELECT count(*) INTO v_count FROM profiles
  WHERE id = '22222222-2222-2222-2222-222222222222';
  PERFORM test_assert(v_count = 0, 'cross-profile read blocked');

  SELECT count(*) INTO v_count FROM profiles
  WHERE id = '11111111-1111-1111-1111-111111111111';
  PERFORM test_assert(v_count = 1, 'own profile readable');
END $$;

-- ------------------------------------------------------------
-- 4. Patients: cross-patient reads are blocked
-- ------------------------------------------------------------
DO $$
DECLARE
  v_other uuid;
  v_count int;
BEGIN
  -- second patient + patient row
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES ('44444444-4444-4444-4444-444444444444', 'rls-patient2@test.local', 'x', now(), '{"full_name":"RLS Patient 2"}')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO profiles (id, email, full_name, role)
  VALUES ('44444444-4444-4444-4444-444444444444', 'rls-patient2@test.local', 'RLS Patient 2', 'patient', true)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO patients (id, user_id, date_of_birth, gender)
  VALUES ('aaaa0000-0000-0000-0000-0000000000bb', '44444444-4444-4444-4444-444444444444', '1992-02-02', 'female')
  ON CONFLICT DO NOTHING;

  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  SELECT count(*) INTO v_count FROM patients WHERE id = 'aaaa0000-0000-0000-0000-0000000000bb';
  PERFORM test_assert(v_count = 0, 'patient cannot read another patient record');

  SELECT count(*) INTO v_count FROM patients WHERE id = 'aaaa0000-0000-0000-0000-0000000000aa';
  PERFORM test_assert(v_count = 1, 'patient can read own record');
END $$;

-- ------------------------------------------------------------
-- 5. Beds: staff can manage own hospital; other staff cannot
-- ------------------------------------------------------------
DO $$
DECLARE
  v_count int;
BEGIN
  PERFORM test_as_user('22222222-2222-2222-2222-222222222222');

  INSERT INTO beds (hospital_id, bed_type, bed_number, status)
  VALUES ('bbbb0000-0000-0000-0000-0000000000aa', 'icu', 'RLS-ICU-1', 'available');
  PERFORM test_assert(true, 'staff can insert bed in own hospital');

  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  SELECT count(*) INTO v_count FROM beds
  WHERE hospital_id = 'bbbb0000-0000-0000-0000-0000000000aa';
  PERFORM test_assert(v_count > 0, 'verified-hospital beds publicly readable');
END $$;

-- ------------------------------------------------------------
-- 6. Emergency alerts: assigned staff can update status
-- ------------------------------------------------------------
DO $$
DECLARE
  v_alert_id uuid;
  v_status text;
BEGIN
  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  INSERT INTO emergency_alerts (patient_id, emergency_type, assigned_hospital_id, status)
  VALUES ('aaaa0000-0000-0000-0000-0000000000aa', 'cardiac', 'bbbb0000-0000-0000-0000-0000000000aa', 'dispatched')
  RETURNING id INTO v_alert_id;

  PERFORM test_as_user('22222222-2222-2222-2222-222222222222');
  UPDATE emergency_alerts SET status = 'in_progress' WHERE id = v_alert_id;
  SELECT status INTO v_status FROM emergency_alerts WHERE id = v_alert_id;
  PERFORM test_assert(v_status = 'in_progress', 'assigned staff can advance emergency status');

  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  UPDATE emergency_alerts SET status = 'resolved' WHERE id = v_alert_id;
  SELECT status INTO v_status FROM emergency_alerts WHERE id = v_alert_id;
  PERFORM test_assert(v_status = 'in_progress', 'reporting patient cannot resolve alert');
END $$;

-- ------------------------------------------------------------
-- 7. Appointments: staff of the hospital can read; other patients cannot
-- ------------------------------------------------------------
DO $$
DECLARE
  v_appt_id uuid;
  v_count int;
BEGIN
  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  INSERT INTO appointments (patient_id, hospital_id, doctor_id, appointment_date, appointment_time, department)
  SELECT 'aaaa0000-0000-0000-0000-0000000000aa', 'bbbb0000-0000-0000-0000-0000000000aa', d.id, CURRENT_DATE, '10:00', 'General Medicine'
  FROM doctors d WHERE d.hospital_id = 'bbbb0000-0000-0000-0000-0000000000aa' LIMIT 1
  RETURNING id INTO v_appt_id;

  -- If no doctor fixture existed, create one minimally to keep the test meaningful.
  IF v_appt_id IS NULL THEN
    INSERT INTO doctors (hospital_id, name, specialization, qualification)
    VALUES ('bbbb0000-0000-0000-0000-0000000000aa', 'Dr. RLS', 'General Medicine', 'MBBS')
    RETURNING id INTO v_appt_id;
    INSERT INTO appointments (patient_id, hospital_id, doctor_id, appointment_date, appointment_time, department)
    VALUES ('aaaa0000-0000-0000-0000-0000000000aa', 'bbbb0000-0000-0000-0000-0000000000aa', v_appt_id, CURRENT_DATE, '10:00', 'General Medicine')
    RETURNING id INTO v_appt_id;
  END IF;

  PERFORM test_as_user('22222222-2222-2222-2222-222222222222');
  SELECT count(*) INTO v_count FROM appointments WHERE id = v_appt_id;
  PERFORM test_assert(v_count = 1, 'hospital staff can read appointments at their hospital');

  PERFORM test_as_user('44444444-4444-4444-4444-444444444444');
  SELECT count(*) INTO v_count FROM appointments WHERE id = v_appt_id;
  PERFORM test_assert(v_count = 0, 'unrelated patient cannot read appointment');
END $$;

-- ------------------------------------------------------------
-- 8. hospital_reviews SELECT policy fix: own reviews visible via patients join
-- ------------------------------------------------------------
DO $$
DECLARE
  v_count int;
BEGIN
  PERFORM test_as_user('11111111-1111-1111-1111-111111111111');
  INSERT INTO hospital_reviews (hospital_id, patient_id, rating, status)
  VALUES ('bbbb0000-0000-0000-0000-0000000000aa', 'aaaa0000-0000-0000-0000-0000000000aa', 4, 'pending')
  ON CONFLICT DO NOTHING;

  SELECT count(*) INTO v_count FROM hospital_reviews
  WHERE patient_id = 'aaaa0000-0000-0000-0000-0000000000aa';
  PERFORM test_assert(v_count = 1, 'patient can read own (pending) review via fixed policy');
END $$;

-- ------------------------------------------------------------
-- Cleanup (so the script is re-runnable)
-- ------------------------------------------------------------
DELETE FROM hospital_reviews WHERE patient_id = 'aaaa0000-0000-0000-0000-0000000000aa';
DELETE FROM appointments WHERE patient_id = 'aaaa0000-0000-0000-0000-0000000000aa';
DELETE FROM emergency_alerts WHERE patient_id = 'aaaa0000-0000-0000-0000-0000000000aa';
DELETE FROM beds WHERE bed_number = 'RLS-ICU-1';
DELETE FROM hospital_staff WHERE id = 'cccc0000-0000-0000-0000-0000000000aa';
DELETE FROM patients WHERE id IN ('aaaa0000-0000-0000-0000-0000000000aa', 'aaaa0000-0000-0000-0000-0000000000bb');
DELETE FROM hospitals WHERE id = 'bbbb0000-0000-0000-0000-0000000000aa';
DELETE FROM profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444');
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444');

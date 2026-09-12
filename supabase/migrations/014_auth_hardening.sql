-- ============================================================
-- Migration 014: Auth Hardening (Phase 1 - Production Readiness)
-- ============================================================
-- Goals:
--   1. Allow new users to create their own profile row (was impossible:
--      profiles had no INSERT policy, so registration could never work).
--   2. Prevent authenticated users from granting themselves elevated roles
--      (the UPDATE policy "Users can update their own profile" previously
--      allowed a user to set role = 'government_admin' on their own row).
--   3. Auto-create a profiles row (role = 'patient') when a user signs up,
--      so role assignment never depends on client input.
--   4. Fix RLS gaps blocking core flows:
--      - hospital_reviews SELECT policy compared patient_id (a patients.id)
--        to auth.uid() (a profiles.id) - never matched.
--      - emergency_alerts had no UPDATE policy (status transitions from
--        dispatched -> in_progress -> resolved were impossible under RLS).
--      - appointments had no hospital-staff policies at all.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profiles INSERT policy (self-signup only, patient role only)
-- ------------------------------------------------------------
-- The trigger in section 2 blocks self-insertion with an elevated role,
-- so this policy can safely allow authenticated self-insertion.
DROP POLICY IF EXISTS "Users can insert own patient profile" ON public.profiles;
CREATE POLICY "Users can insert own patient profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id AND role = 'patient');

-- ------------------------------------------------------------
-- 2. Role-escalation guard (defense in depth on top of RLS)
-- ------------------------------------------------------------
-- Even though RLS restricts profile UPDATE to rows the user owns, the
-- existing UPDATE policy has no WITH CHECK clause, so a user could set
-- their own role to anything. This trigger closes that hole:
--   - INSERT: an authenticated user may only insert their OWN profile,
--     and only with role = 'patient'.
--   - UPDATE: an authenticated user may never change their own role.
-- Service-role / admin operations (auth.uid() IS NULL, or acting on
-- someone else's row) pass through unchanged.
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.id = auth.uid() THEN
        IF TG_OP = 'INSERT' AND NEW.role <> 'patient' THEN
            RAISE EXCEPTION
                'Cannot create a profile with an elevated role for your own account'
                USING HINT = 'Role assignment for elevated users must be done by an administrator (service role).';
        END IF;

        IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
            RAISE EXCEPTION
                'Changing your own profile role is not permitted'
                USING HINT = 'Role changes must be performed by an administrator (service role).';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ------------------------------------------------------------
-- 3. Auto-create profile on user signup
-- ------------------------------------------------------------
-- SECURITY DEFINER so it can insert into profiles without any RLS policy
-- for auth.users. search_path is pinned to prevent search_path hijacking.
-- Role is hard-coded to 'patient'; elevation is always an admin action.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'name', ''),
            'New User'
        ),
        NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        'patient'::user_role,
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 4. Fix hospital_reviews SELECT policy (patient_id vs auth.uid() bug)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Patients can view their own reviews" ON public.hospital_reviews;
CREATE POLICY "Patients can view their own reviews"
    ON public.hospital_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = hospital_reviews.patient_id AND p.user_id = auth.uid()
        )
        OR status = 'approved'
    );

-- ------------------------------------------------------------
-- 5. Emergency alerts: allow status transitions by assigned staff / admins
-- ------------------------------------------------------------
CREATE POLICY "Assigned hospital staff can update emergency alerts"
    ON public.emergency_alerts FOR UPDATE
    USING (
        assigned_hospital_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.hospital_staff hs
            WHERE hs.hospital_id = emergency_alerts.assigned_hospital_id
              AND hs.user_id = auth.uid()
        )
    );

CREATE POLICY "Government admins can update emergency alerts"
    ON public.emergency_alerts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('government_admin', 'super_admin')
        )
    );

-- ------------------------------------------------------------
-- 6. Appointments: hospital staff visibility + status management
-- ------------------------------------------------------------
CREATE POLICY "Hospital staff can view appointments at their hospital"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hospital_staff hs
            WHERE hs.hospital_id = appointments.hospital_id
              AND hs.user_id = auth.uid()
        )
    );

CREATE POLICY "Hospital staff can update appointments at their hospital"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.hospital_staff hs
            WHERE hs.hospital_id = appointments.hospital_id
              AND hs.user_id = auth.uid()
        )
    );

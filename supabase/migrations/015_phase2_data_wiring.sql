-- ============================================================
-- Migration 015: Phase 2 - Real data wiring
-- ============================================================
-- Additive changes only; no existing policy is weakened.
--   1. hospitals: UI-facing display columns (locality, opening_hours,
--      emergency_available, has_blood_bank) that demo data previously
--      hard-coded.
--   2. blood_inventory: units_reserved column (reserve flow).
--   3. blood_requests table + RLS (patient requisition flow).
--   4. opd_queues: authenticated read policy (queue status visibility).
--   5. opd_tokens.patient_id becomes nullable (hospital walk-ins have
--      no patient record; name is kept in notes).
--   6. v_hospital_directory view (security_invoker: RLS still applies).
--   7. SECURITY DEFINER RPCs for race-safe writes:
--      book_opd_token, call_next_patient, set_blood_request_status.
--      Each verifies auth.uid() explicitly and is revoked from anon/public.
-- ============================================================

-- ------------------------------------------------------------
-- 1. hospitals display columns
-- ------------------------------------------------------------
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS locality TEXT;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS opening_hours TEXT NOT NULL DEFAULT '24x7';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS emergency_available BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS has_blood_bank BOOLEAN NOT NULL DEFAULT false;

-- ------------------------------------------------------------
-- 2. blood_inventory reserved units
-- ------------------------------------------------------------
ALTER TABLE public.blood_inventory ADD COLUMN IF NOT EXISTS units_reserved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.blood_inventory DROP CONSTRAINT IF EXISTS blood_inventory_reserved_nonneg;
ALTER TABLE public.blood_inventory ADD CONSTRAINT blood_inventory_reserved_nonneg CHECK (units_reserved >= 0);

-- ------------------------------------------------------------
-- 3. blood_requests
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.blood_request_status AS ENUM ('pending', 'approved', 'fulfilled', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    blood_group public.blood_group NOT NULL,
    units INTEGER NOT NULL CHECK (units >= 1 AND units <= 10),
    urgency TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
    contact_phone TEXT NOT NULL,
    status public.blood_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blood_requests_patient_id ON public.blood_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_id ON public.blood_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);

DROP TRIGGER IF EXISTS update_blood_requests_updated_at ON public.blood_requests;
CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own blood requests" ON public.blood_requests;
CREATE POLICY "Patients can view own blood requests"
    ON public.blood_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = blood_requests.patient_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Patients can create own blood requests" ON public.blood_requests;
CREATE POLICY "Patients can create own blood requests"
    ON public.blood_requests FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = blood_requests.patient_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Hospital staff can view blood requests for their hospital" ON public.blood_requests;
CREATE POLICY "Hospital staff can view blood requests for their hospital"
    ON public.blood_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hospital_staff hs
            WHERE hs.hospital_id = blood_requests.hospital_id AND hs.user_id = auth.uid()
        )
    );

-- Status transitions must go through set_blood_request_status(); this policy
-- permits the UPDATE only for staff of the owning hospital and the RPC
-- re-verifies + enforces valid transitions.
DROP POLICY IF EXISTS "Hospital staff can update blood requests for their hospital" ON public.blood_requests;
CREATE POLICY "Hospital staff can update blood requests for their hospital"
    ON public.blood_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.hospital_staff hs
            WHERE hs.hospital_id = blood_requests.hospital_id AND hs.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Government admins can view blood requests" ON public.blood_requests;
CREATE POLICY "Government admins can view blood requests"
    ON public.blood_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('government_admin', 'super_admin')
        )
    );

-- ------------------------------------------------------------
-- 4. opd_queues: authenticated users may view queue counters
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view active OPD queues" ON public.opd_queues;
CREATE POLICY "Authenticated users can view active OPD queues"
    ON public.opd_queues FOR SELECT
    USING (auth.uid() IS NOT NULL AND is_active = true);

-- ------------------------------------------------------------
-- 5. opd_tokens.patient_id nullable (walk-ins)
-- ------------------------------------------------------------
ALTER TABLE public.opd_tokens ALTER COLUMN patient_id DROP NOT NULL;

-- ------------------------------------------------------------
-- 6. Hospital directory view (security_invoker => caller RLS applies)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_hospital_directory
WITH (security_invoker = true) AS
SELECT
    h.id,
    h.name,
    h.type::text AS ownership,
    h.category::text AS category,
    h.address,
    h.city,
    h.district,
    h.state,
    h.pincode,
    h.phone,
    h.latitude,
    h.longitude,
    h.locality,
    h.opening_hours,
    h.emergency_available,
    h.has_blood_bank,
    h.icu_capacity,
    h.bed_capacity,
    COALESCE(b.total_beds, 0) AS total_beds,
    COALESCE(b.available_beds, 0) AS available_beds,
    COALESCE(b.icu_beds_available, 0) AS icu_beds_available,
    COALESCE(d.departments, '[]'::json) AS departments
FROM public.hospitals h
LEFT JOIN (
    SELECT hospital_id,
           COUNT(*) AS total_beds,
           COUNT(*) FILTER (WHERE status = 'available') AS available_beds,
           COUNT(*) FILTER (WHERE status = 'available' AND is_icu) AS icu_beds_available
    FROM public.beds
    GROUP BY hospital_id
) b ON b.hospital_id = h.id
LEFT JOIN LATERAL (
    SELECT json_agg(q.department ORDER BY q.department) AS departments
    FROM (
        SELECT DISTINCT department
        FROM public.opd_queues
        WHERE hospital_id = h.id AND is_active = true
    ) q
) d ON true
WHERE h.verification_status = 'verified';

-- ------------------------------------------------------------
-- 7. RPC: book_opd_token (patient)
-- ------------------------------------------------------------
-- Race-safe token assignment: locks the queue row, assigns next number.
CREATE OR REPLACE FUNCTION public.book_opd_token(
    p_hospital_id UUID,
    p_department TEXT,
    p_slot TEXT DEFAULT NULL,
    p_patient_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_patient_id UUID;
    v_queue_id UUID;
    v_token_number INTEGER;
    v_estimated_time TIME;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_hospital_id IS NULL OR p_department IS NULL OR length(trim(p_department)) = 0 THEN
        RAISE EXCEPTION 'Hospital and department are required';
    END IF;

    SELECT id INTO v_patient_id FROM public.patients WHERE user_id = v_user_id LIMIT 1;
    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'No patient profile found for this account';
    END IF;

    -- Hospital must be verified to accept bookings.
    IF NOT EXISTS (
        SELECT 1 FROM public.hospitals
        WHERE id = p_hospital_id AND verification_status = 'verified'
    ) THEN
        RAISE EXCEPTION 'Hospital is not available for bookings';
    END IF;

    -- Find or create today's queue for this hospital + department.
    SELECT id INTO v_queue_id
    FROM public.opd_queues
    WHERE hospital_id = p_hospital_id
      AND department = trim(p_department)
      AND date = CURRENT_DATE
    LIMIT 1;

    IF v_queue_id IS NULL THEN
        INSERT INTO public.opd_queues (hospital_id, department, date, total_tokens, current_token, is_active)
        VALUES (p_hospital_id, trim(p_department), CURRENT_DATE, 0, 0, true)
        RETURNING id INTO v_queue_id;
    END IF;

    -- Serialize concurrent bookings per queue.
    PERFORM 1 FROM public.opd_queues WHERE id = v_queue_id FOR UPDATE;

    SELECT COALESCE(MAX(token_number), 0) + 1 INTO v_token_number
    FROM public.opd_tokens WHERE queue_id = v_queue_id;

    UPDATE public.opd_queues
    SET total_tokens = GREATEST(total_tokens, v_token_number)
    WHERE id = v_queue_id;

    -- Best-effort slot parsing ("9:00 AM"); falls back to NULL.
    BEGIN
        v_estimated_time := to_timestamp(p_slot, 'HH12:MI AM')::TIME;
    EXCEPTION WHEN OTHERS THEN
        v_estimated_time := NULL;
    END;

    INSERT INTO public.opd_tokens (queue_id, patient_id, token_number, status, estimated_time, notes)
    VALUES (
        v_queue_id,
        v_patient_id,
        v_token_number,
        'waiting',
        v_estimated_time,
        NULLIF(trim(COALESCE(p_patient_name, '')) || ' | ' || COALESCE(trim(p_phone), '') , ' |')
    )
    RETURNING token_number INTO v_token_number;

    RETURN json_build_object(
        'token_number', v_token_number,
        'queue_id', v_queue_id,
        'hospital_id', p_hospital_id,
        'department', trim(p_department),
        'slot', p_slot
    );
END;
$$;

-- ------------------------------------------------------------
-- 8. RPC: call_next_patient (hospital staff)
-- ------------------------------------------------------------
-- Fixes the legacy client bug that marked ALL waiting tokens as called.
CREATE OR REPLACE FUNCTION public.call_next_patient(p_queue_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_hospital_id UUID;
    v_prev_token INTEGER;
    v_next_token RECORD;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT hospital_id INTO v_hospital_id
    FROM public.opd_queues WHERE id = p_queue_id;
    IF v_hospital_id IS NULL THEN
        RAISE EXCEPTION 'Queue not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.hospital_staff
        WHERE hospital_id = v_hospital_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Not authorized for this hospital';
    END IF;

    PERFORM 1 FROM public.opd_queues WHERE id = p_queue_id FOR UPDATE;

    -- Finish any currently-called token.
    UPDATE public.opd_tokens
    SET status = 'completed', completed_at = NOW()
    WHERE queue_id = p_queue_id AND status = 'called'
    RETURNING token_number INTO v_prev_token;

    -- Call the lowest-numbered waiting token.
    SELECT * INTO v_next_token FROM public.opd_tokens
    WHERE queue_id = p_queue_id AND status = 'waiting'
    ORDER BY token_number ASC
    LIMIT 1;

    IF v_next_token IS NULL THEN
        RETURN json_build_object('called', NULL, 'completed_previous', v_prev_token);
    END IF;

    UPDATE public.opd_tokens
    SET status = 'called', called_at = NOW()
    WHERE id = v_next_token.id;

    UPDATE public.opd_queues
    SET current_token = v_next_token.token_number
    WHERE id = p_queue_id;

    RETURN json_build_object(
        'called', v_next_token.token_number,
        'called_token_id', v_next_token.id,
        'completed_previous', v_prev_token
    );
END;
$$;

-- ------------------------------------------------------------
-- 9. RPC: set_blood_request_status (hospital staff)
-- ------------------------------------------------------------
-- Atomic status transitions with inventory adjustments:
--   approve : pending -> approved  (transfer available -> reserved)
--   reject  : pending -> rejected
--   fulfill : approved -> fulfilled (consume reserved units)
CREATE OR REPLACE FUNCTION public.set_blood_request_status(
    p_request_id UUID,
    p_action TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_req public.blood_requests%ROWTYPE;
    v_transferred INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF p_action NOT IN ('approve', 'reject', 'fulfill') THEN
        RAISE EXCEPTION 'Invalid action';
    END IF;

    SELECT * INTO v_req FROM public.blood_requests WHERE id = p_request_id;
    IF v_req.id IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.hospital_staff
        WHERE hospital_id = v_req.hospital_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Not authorized for this hospital';
    END IF;

    IF p_action = 'approve' THEN
        IF v_req.status <> 'pending' THEN
            RAISE EXCEPTION 'Only pending requests can be approved';
        END IF;

        LOCK TABLE public.blood_inventory IN ROW EXCLUSIVE MODE;

        SELECT units_available INTO v_transferred
        FROM public.blood_inventory
        WHERE hospital_id = v_req.hospital_id AND blood_group = v_req.blood_group
        FOR UPDATE;

        IF v_transferred IS NULL OR v_transferred < v_req.units THEN
            RAISE EXCEPTION 'Insufficient blood units available for this request';
        END IF;

        UPDATE public.blood_inventory
        SET units_available = units_available - v_req.units,
            units_reserved = units_reserved + v_req.units,
            last_updated = NOW()
        WHERE hospital_id = v_req.hospital_id AND blood_group = v_req.blood_group;

        UPDATE public.blood_requests SET status = 'approved' WHERE id = p_request_id;

    ELSIF p_action = 'reject' THEN
        IF v_req.status <> 'pending' THEN
            RAISE EXCEPTION 'Only pending requests can be rejected';
        END IF;
        UPDATE public.blood_requests SET status = 'rejected' WHERE id = p_request_id;

    ELSIF p_action = 'fulfill' THEN
        IF v_req.status <> 'approved' THEN
            RAISE EXCEPTION 'Only approved requests can be fulfilled';
        END IF;

        UPDATE public.blood_inventory
        SET units_reserved = GREATEST(0, units_reserved - v_req.units),
            last_updated = NOW()
        WHERE hospital_id = v_req.hospital_id AND blood_group = v_req.blood_group;

        UPDATE public.blood_requests SET status = 'fulfilled' WHERE id = p_request_id;
    END IF;

    RETURN json_build_object('request_id', p_request_id, 'status', p_action);
END;
$$;

-- ------------------------------------------------------------
-- 10. Lock down RPC execution (explicit grants only)
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.book_opd_token(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.call_next_patient(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_blood_request_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.book_opd_token(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.call_next_patient(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_blood_request_status(UUID, TEXT) TO authenticated;

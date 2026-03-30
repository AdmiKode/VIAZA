-- ============================================================
-- VIAZA — Fix: get_emergency_public_view RPC
-- Migración: 20260329_fix_emergency_public_rpc.sql
-- 
-- Propósito: Garantizar que la función RPC exista en producción
-- y que los accesos anon funcionen correctamente para el QR.
-- ============================================================

-- Función RPC pública para QR de emergencia
-- Devuelve SOLO campos consentidos y solo si QR está activo
CREATE OR REPLACE FUNCTION public.get_emergency_public_view(token text)
RETURNS TABLE (
  full_name                  text,
  photo_url                  text,
  nationality                text,
  primary_language           text,
  secondary_language         text,
  blood_type                 text,
  allergies                  text,
  current_conditions         text,
  medications                text,
  medical_notes              text,
  insurance_provider         text,
  insurance_policy_number    text,
  emergency_contact_1_name   text,
  emergency_contact_1_relation text,
  emergency_contact_1_phone  text,
  emergency_contact_2_name   text,
  emergency_contact_2_relation text,
  emergency_contact_2_phone  text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ep.full_name,
    ep.photo_url,
    ep.nationality,
    ep.primary_language,
    ep.secondary_language,
    CASE WHEN ep.show_blood_type   THEN ep.blood_type              ELSE NULL END,
    CASE WHEN ep.show_allergies    THEN ep.allergies               ELSE NULL END,
    CASE WHEN ep.show_conditions   THEN ep.current_conditions      ELSE NULL END,
    CASE WHEN ep.show_medications  THEN ep.medications             ELSE NULL END,
    CASE WHEN ep.show_notes        THEN ep.medical_notes           ELSE NULL END,
    CASE WHEN ep.show_insurance    THEN ep.insurance_provider      ELSE NULL END,
    CASE WHEN ep.show_insurance    THEN ep.insurance_policy_number ELSE NULL END,
    CASE WHEN ep.show_contacts     THEN ep.emergency_contact_1_name     ELSE NULL END,
    CASE WHEN ep.show_contacts     THEN ep.emergency_contact_1_relation ELSE NULL END,
    CASE WHEN ep.show_contacts     THEN ep.emergency_contact_1_phone    ELSE NULL END,
    CASE WHEN ep.show_contacts     THEN ep.emergency_contact_2_name     ELSE NULL END,
    CASE WHEN ep.show_contacts     THEN ep.emergency_contact_2_relation ELSE NULL END,
    CASE WHEN ep.show_contacts     THEN ep.emergency_contact_2_phone    ELSE NULL END
  FROM public.emergency_profiles ep
  WHERE
    ep.public_token = token
    AND ep.qr_enabled = TRUE
    AND ep.consent_public_display = TRUE
  LIMIT 1;
$$;

-- Asegurar permisos: anon y authenticated pueden llamar la función (sin auth)
REVOKE ALL ON FUNCTION public.get_emergency_public_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_emergency_public_view(text) TO anon, authenticated;

-- Asegurar que log_emergency_qr_access también tenga permisos correctos
-- (esta función puede haberse ejecutado antes pero igual la redefinimos para garantizarla)
CREATE OR REPLACE FUNCTION public.log_emergency_qr_access(
  token       text,
  source      text DEFAULT NULL,
  client_info text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id
  FROM public.emergency_profiles ep
  WHERE ep.public_token = token
    AND ep.qr_enabled = TRUE
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.emergency_qr_access_logs (
    emergency_profile_id,
    access_type,
    source,
    client_info
  ) VALUES (
    v_profile_id,
    'qr_scan',
    source,
    client_info
  );

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.log_emergency_qr_access(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_emergency_qr_access(text, text, text) TO anon, authenticated;

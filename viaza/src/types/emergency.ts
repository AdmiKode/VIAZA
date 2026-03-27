// ─── Emergency Travel Card ──────────────────────────────────────────────────

export interface EmergencyProfile {
  id: string;
  user_id: string;

  // Datos personales
  full_name: string;
  date_of_birth: string | null;
  nationality: string | null;
  primary_language: string | null;
  secondary_language: string | null;
  photo_url: string | null;

  // Datos médicos
  blood_type: string | null;
  allergies: string | null;
  medications: string | null;
  current_treatments: string | null;
  current_conditions: string | null;
  medical_notes: string | null;

  // Seguro y médico
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;

  // Contacto de emergencia 1
  emergency_contact_1_name: string | null;
  emergency_contact_1_relation: string | null;
  emergency_contact_1_phone: string | null;

  // Contacto de emergencia 2
  emergency_contact_2_name: string | null;
  emergency_contact_2_relation: string | null;
  emergency_contact_2_phone: string | null;

  // Visibilidad pública por bloque
  show_blood_type: boolean;
  show_allergies: boolean;
  show_conditions: boolean;
  show_medications: boolean;
  show_contacts: boolean;
  show_insurance: boolean;
  show_notes: boolean;

  // Control QR
  public_token: string;
  qr_enabled: boolean;
  consent_public_display: boolean;

  created_at: string;
  updated_at: string;
}

/** Forma del formulario de edición (campos opcionales como el usuario los ve) */
export type EmergencyProfileForm = Omit<
  EmergencyProfile,
  'id' | 'user_id' | 'public_token' | 'created_at' | 'updated_at'
>;

/** Vista pública que ve quien escanea el QR (solo campos permitidos) */
export interface EmergencyPublicView {
  full_name: string;
  photo_url: string | null;
  nationality: string | null;
  primary_language: string | null;
  secondary_language: string | null;
  blood_type: string | null;
  allergies: string | null;
  current_conditions: string | null;
  medications: string | null;
  medical_notes: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  emergency_contact_1_name: string | null;
  emergency_contact_1_relation: string | null;
  emergency_contact_1_phone: string | null;
  emergency_contact_2_name: string | null;
  emergency_contact_2_relation: string | null;
  emergency_contact_2_phone: string | null;
}

export interface EmergencyQrAccessLog {
  id: number;
  access_type: 'public_view';
  source: string | null;
  client_info: string | null;
  accessed_at: string;
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodType = typeof BLOOD_TYPES[number];

export const EMPTY_EMERGENCY_FORM: EmergencyProfileForm = {
  full_name: '',
  date_of_birth: null,
  nationality: null,
  primary_language: null,
  secondary_language: null,
  photo_url: null,
  blood_type: null,
  allergies: null,
  medications: null,
  current_treatments: null,
  current_conditions: null,
  medical_notes: null,
  insurance_provider: null,
  insurance_policy_number: null,
  doctor_name: null,
  doctor_phone: null,
  emergency_contact_1_name: null,
  emergency_contact_1_relation: null,
  emergency_contact_1_phone: null,
  emergency_contact_2_name: null,
  emergency_contact_2_relation: null,
  emergency_contact_2_phone: null,
  show_blood_type: true,
  show_allergies: true,
  show_conditions: true,
  show_medications: true,
  show_contacts: true,
  show_insurance: false,
  show_notes: false,
  qr_enabled: false,
  consent_public_display: false,
};

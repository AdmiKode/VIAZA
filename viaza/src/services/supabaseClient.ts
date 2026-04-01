import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas en .env');
}

// En plataformas nativas (Android/iOS) usamos @capacitor/preferences como storage
// para que la sesión de Supabase sobreviva reinicios de la app.
// En web se usa localStorage por defecto (comportamiento estándar).
const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!Capacitor.isNativePlatform()) return localStorage.getItem(key);
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) { localStorage.setItem(key, value); return; }
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) { localStorage.removeItem(key); return; }
    await Preferences.remove({ key });
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: capacitorStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // en Capacitor no hay URL redirect de OAuth
  },
});
export const SUPABASE_URL = supabaseUrl;

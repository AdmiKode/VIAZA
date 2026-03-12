/**
 * authService.ts
 * Capa de autenticación sobre Supabase Auth.
 * Reemplaza el auth local de Zustand (registeredUsers[]).
 */

import { supabase } from './supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Registrar nuevo usuario con email + password */
export async function signUp(params: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim().toLowerCase(),
    password: params.password,
    options: {
      data: { full_name: params.name.trim() },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('No se pudo crear el usuario');

  return {
    id: data.user.id,
    email: data.user.email ?? params.email,
    name: (data.user.user_metadata?.full_name as string) ?? params.name,
  };
}

/** Iniciar sesión con email + password */
export async function signIn(params: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email.trim().toLowerCase(),
    password: params.password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Credenciales inválidas');

  return {
    id: data.user.id,
    email: data.user.email ?? params.email,
    name:
      (data.user.user_metadata?.full_name as string) ??
      data.user.email?.split('@')[0] ??
      'Usuario',
  };
}

/** Cerrar sesión */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Obtener sesión activa (para restaurar estado en recarga) */
export async function getSession(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? '',
    name:
      (user.user_metadata?.full_name as string) ??
      user.email?.split('@')[0] ??
      'Usuario',
  };
}

/** Escuchar cambios de sesión (útil en AppProviders) */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    if (!user) return callback(null);
    callback({
      id: user.id,
      email: user.email ?? '',
      name:
        (user.user_metadata?.full_name as string) ??
        user.email?.split('@')[0] ??
        'Usuario',
    });
  });
}

import { supabase } from './supabase';
import type { User, UserRole } from './types';

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  role: UserRole = 'client'
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
      },
    },
  });

  if (error) return { user: null, error: error.message };

  if (data.user) {
    // Insert into users table
    const { error: profileError } = await supabase.from('users').upsert({
      id: data.user.id,
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      role,
    });

    if (profileError) return { user: null, error: profileError.message };

    return {
      user: {
        id: data.user.id,
        email,
        phone,
        first_name: firstName,
        last_name: lastName,
        role,
        created_at: data.user.created_at,
      },
      error: null,
    };
  }

  return { user: null, error: 'Une erreur est survenue' };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: 'Email ou mot de passe incorrect' };

  if (data.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      return { user: profile as User, error: null };
    }
  }

  return { user: null, error: 'Utilisateur introuvable' };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return data as User | null;
}

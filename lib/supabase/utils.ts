import { createServerClient } from './server';
import type { UserProfile, UserRole } from '@/types';

export async function getCurrentUserRole(supabaseClient?: SupabaseClient): Promise<UserRole | null> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: UserRole }>();

  if (error || !profile) {
    console.error('Error fetching user role:', error?.message);
    // Default to 'customer' or handle as appropriate if profile/role not found
    // For this boilerplate, returning null signifies an issue or non-existent profile entry
    return null; 
  }

  return profile.role;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {  
  const supabase = createServerClient(); // Updated to use the new server client
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single<UserProfile>();

  if (error || !profile) {
    console.error('Error fetching user profile:', error?.message);
    return null;
  }
  return profile;
}

export async function getAuthenticatedUser() { 
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log("user", user)
  return user;
}
// =============================================
// Repository: Profiles
// =============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { DatabaseError, NotFoundError } from '@/domain/errors';

export interface ProfileCreationRights {
  subscriptionPlan: 'free' | 'premium';
  freePlanUsed: boolean;
}

export async function getProfileById(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw error ? new DatabaseError('getProfileById', error) : new NotFoundError('Profilo', userId);
  }
  return data as Profile;
}

export async function getProfileCreationRights(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileCreationRights> {
  const { data, error } = await supabase
    .from('profiles')
    .select('free_plan_used, subscription_plan')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw error ? new DatabaseError('getProfileCreationRights', error) : new NotFoundError('Profilo', userId);
  }
  return {
    subscriptionPlan: data.subscription_plan,
    freePlanUsed: data.free_plan_used,
  };
}

export async function markFreePlanUsed(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ free_plan_used: true })
    .eq('id', userId);

  if (error) throw new DatabaseError('markFreePlanUsed', error);
}

export async function updateSubscription(
  supabase: SupabaseClient,
  userId: string,
  plan: 'free' | 'premium',
  expiresAt: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_plan: plan,
      subscription_expires_at: expiresAt,
    })
    .eq('id', userId);

  if (error) throw new DatabaseError('updateSubscription', error);
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: { full_name: string | null; company_name: string | null; phone: string | null },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new DatabaseError('updateProfile', error);
}

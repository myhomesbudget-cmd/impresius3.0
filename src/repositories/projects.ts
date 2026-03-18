// =============================================
// Repository: Projects
// =============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from '@/types/database';
import { DatabaseError, NotFoundError } from '@/domain/errors';

export interface CreateProjectInput {
  userId: string;
  name: string;
  locationCity: string | null;
  locationProvince: string | null;
  propertyType: Project['property_type'];
  strategy: Project['strategy'];
  isFreePlan: boolean;
}

export async function createProject(
  supabase: SupabaseClient,
  input: CreateProjectInput,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: input.userId,
      name: input.name,
      location_city: input.locationCity,
      location_province: input.locationProvince,
      property_type: input.propertyType,
      strategy: input.strategy,
      status: 'draft',
      is_free_plan: input.isFreePlan,
    })
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError('createProject', error);
  }
  return data as Project;
}

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !data) {
    throw error ? new DatabaseError('getProjectById', error) : new NotFoundError('Operazione', projectId);
  }
  return data as Project;
}

export async function getProjectsByUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw new DatabaseError('getProjectsByUser', error);
  return (data || []) as Project[];
}

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string,
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw new DatabaseError('deleteProject', error);
}

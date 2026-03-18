// =============================================
// Use Case: Dashboard Summary
// =============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from '@/types/database';
import { getProfileById } from '@/repositories/profiles';
import { getProjectsByUser } from '@/repositories/projects';

export interface DashboardSummary {
  greeting: string;
  isPremium: boolean;
  projects: Project[];
  totalProjects: number;
  draftProjects: number;
  activeProjects: number;
}

export async function getDashboardSummaryUseCase(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardSummary> {
  const [profile, projects] = await Promise.all([
    getProfileById(supabase, userId),
    getProjectsByUser(supabase, userId),
  ]);

  const greeting = profile.full_name
    ? `Bentornato, ${profile.full_name}`
    : 'Benvenuto';

  return {
    greeting,
    isPremium: profile.subscription_plan === 'premium',
    projects,
    totalProjects: projects.length,
    draftProjects: projects.filter(p => p.status === 'draft').length,
    activeProjects: projects.filter(p => p.status === 'active').length,
  };
}

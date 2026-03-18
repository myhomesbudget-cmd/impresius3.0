// =============================================
// Use Case: Check Creation Rights (read-only)
// =============================================
//
// Espone al client lo stato dei diritti di creazione
// senza contenere logica di business critica.
//

import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileCreationRights } from '@/repositories/profiles';
import { countAvailableCredits } from '@/repositories/payments';

export interface CreationRights {
  canCreate: boolean;
  freePlanAvailable: boolean;
  availableCredits: number;
  isPremium: boolean;
}

export async function checkCreationRightsUseCase(
  supabase: SupabaseClient,
  userId: string,
): Promise<CreationRights> {
  const [profile, credits] = await Promise.all([
    getProfileCreationRights(supabase, userId),
    countAvailableCredits(supabase, userId),
  ]);

  const isPremium = profile.subscriptionPlan === 'premium';
  const freePlanAvailable = !isPremium && !profile.freePlanUsed;
  const canCreate = isPremium || freePlanAvailable || credits > 0;

  return {
    canCreate,
    freePlanAvailable,
    availableCredits: credits,
    isPremium,
  };
}

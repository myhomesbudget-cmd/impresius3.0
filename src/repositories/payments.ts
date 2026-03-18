// =============================================
// Repository: Payments
// =============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Payment } from '@/types/database';
import { DatabaseError, CreditConsumedError } from '@/domain/errors';

export async function countAvailableCredits(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'single_plan')
    .eq('status', 'completed')
    .is('plan_id', null);

  if (error) throw new DatabaseError('countAvailableCredits', error);
  return count ?? 0;
}

/**
 * Consume the oldest available credit by linking it to a project.
 * Uses `.is('plan_id', null)` as a guard to prevent double consumption
 * even under concurrent requests.
 *
 * @returns The consumed credit, or throws CreditConsumedError if race condition.
 */
export async function consumeOldestCredit(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
): Promise<Payment> {
  // Step 1: Find the oldest unused credit
  const { data: credit, error: findError } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'single_plan')
    .eq('status', 'completed')
    .is('plan_id', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (findError || !credit) {
    throw new CreditConsumedError({ userId, projectId });
  }

  // Step 2: Atomically claim it (plan_id = null guard prevents double-consume)
  const { data: updated, error: updateError } = await supabase
    .from('payments')
    .update({ plan_id: projectId })
    .eq('id', credit.id)
    .is('plan_id', null)
    .select()
    .single();

  if (updateError || !updated) {
    throw new CreditConsumedError({ userId, projectId, creditId: credit.id });
  }

  return updated as Payment;
}

export async function createPendingPayment(
  supabase: SupabaseClient,
  userId: string,
  type: 'single_plan' | 'subscription',
  amount: number,
): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount,
      currency: 'EUR',
      status: 'pending',
      type,
      provider: 'stripe',
    })
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError('createPendingPayment', error);
  }
  return data as Payment;
}

export async function markPaymentCompleted(
  supabase: SupabaseClient,
  paymentId: string,
  providerPaymentId: string,
  amount?: number,
): Promise<void> {
  const update: Record<string, unknown> = {
    status: 'completed',
    provider_payment_id: providerPaymentId,
  };
  if (amount !== undefined) update.amount = amount;

  const { error } = await supabase
    .from('payments')
    .update(update)
    .eq('id', paymentId)
    .eq('status', 'pending'); // Guard: only pending -> completed

  if (error) throw new DatabaseError('markPaymentCompleted', error);
}

export async function markPaymentFailed(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('id', paymentId)
    .eq('status', 'pending'); // Guard: only pending -> failed

  if (error) throw new DatabaseError('markPaymentFailed', error);
}

export async function getPaymentById(
  supabase: SupabaseClient,
  paymentId: string,
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error) return null;
  return data as Payment;
}

export async function getPaymentsByUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new DatabaseError('getPaymentsByUser', error);
  return (data || []) as Payment[];
}

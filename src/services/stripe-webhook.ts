// =============================================
// Use Case: Handle Stripe Webhook Events
// =============================================
//
// Ogni handler e idempotente:
// - checkout.session.completed: solo pending -> completed
// - checkout.session.expired: solo pending -> failed
// - subscription.updated/deleted: update profilo
//
// I guard nelle query (.eq('status', 'pending')) prevengono
// l'applicazione multipla dello stesso evento.
//

import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
  markPaymentCompleted,
  markPaymentFailed,
  getPaymentById,
} from '@/repositories/payments';
import { updateSubscription } from '@/repositories/profiles';
import { logger } from '@/domain/errors';

// -------------------------------------------------------------------
// checkout.session.completed (idempotente)
// -------------------------------------------------------------------
export async function handleCheckoutCompleted(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.user_id;
  const paymentId = session.metadata?.payment_id;
  const type = session.metadata?.type;
  const correlationId = session.id;

  if (!userId || !paymentId) {
    logger.warn('Webhook checkout.completed: missing metadata', {
      correlationId,
      operation: 'webhook.checkout.completed',
      sessionId: session.id,
    });
    return;
  }

  // Idempotency check: if payment is already completed, skip
  const existing = await getPaymentById(supabase, paymentId);
  if (existing && existing.status === 'completed') {
    logger.info('Webhook checkout.completed: already processed (idempotent skip)', {
      correlationId,
      userId,
      operation: 'webhook.checkout.completed',
      paymentId,
    });
    return;
  }

  // Mark payment completed (guard: only pending -> completed)
  const providerPaymentId = (session.payment_intent as string) || (session.subscription as string) || '';
  const amount = type === 'subscription' && session.amount_total ? session.amount_total : undefined;

  await markPaymentCompleted(supabase, paymentId, providerPaymentId, amount);

  logger.info('Webhook checkout.completed: payment marked completed', {
    correlationId,
    userId,
    operation: 'webhook.checkout.completed',
    paymentId,
    type,
  });

  if (type === 'single_plan') {
    // Credit stays as plan_id = NULL, consumed when project is created
    return;
  }

  if (type === 'subscription' && session.subscription) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const firstItem = subscription.items.data[0];
    const expiresAt = firstItem
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null;

    await updateSubscription(supabase, userId, 'premium', expiresAt);

    logger.info('Webhook checkout.completed: subscription activated', {
      correlationId,
      userId,
      operation: 'webhook.checkout.completed',
      expiresAt,
    });
  }
}

// -------------------------------------------------------------------
// checkout.session.expired (idempotente)
// -------------------------------------------------------------------
export async function handleCheckoutExpired(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const paymentId = session.metadata?.payment_id;
  if (!paymentId) return;

  // Idempotency check
  const existing = await getPaymentById(supabase, paymentId);
  if (existing && existing.status !== 'pending') {
    logger.info('Webhook checkout.expired: already processed (idempotent skip)', {
      operation: 'webhook.checkout.expired',
      paymentId,
      currentStatus: existing.status,
    });
    return;
  }

  await markPaymentFailed(supabase, paymentId);

  logger.info('Webhook checkout.expired: payment marked failed', {
    operation: 'webhook.checkout.expired',
    paymentId,
  });
}

// -------------------------------------------------------------------
// customer.subscription.updated (idempotente)
// -------------------------------------------------------------------
export async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    logger.warn('Webhook subscription.updated: missing user_id in metadata', {
      operation: 'webhook.subscription.updated',
      subscriptionId: subscription.id,
    });
    return;
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  if (isActive) {
    const firstItem = subscription.items?.data[0];
    const expiresAt = firstItem
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null;

    await updateSubscription(supabase, userId, 'premium', expiresAt);

    logger.info('Webhook subscription.updated: premium active', {
      operation: 'webhook.subscription.updated',
      userId,
      expiresAt,
      stripeStatus: subscription.status,
    });
  } else {
    // past_due, unpaid, canceled, etc. — downgrade
    await updateSubscription(supabase, userId, 'free', null);

    logger.info('Webhook subscription.updated: downgraded to free', {
      operation: 'webhook.subscription.updated',
      userId,
      stripeStatus: subscription.status,
    });
  }
}

// -------------------------------------------------------------------
// customer.subscription.deleted (idempotente)
// -------------------------------------------------------------------
export async function handleSubscriptionDeleted(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    logger.warn('Webhook subscription.deleted: missing user_id in metadata', {
      operation: 'webhook.subscription.deleted',
      subscriptionId: subscription.id,
    });
    return;
  }

  await updateSubscription(supabase, userId, 'free', null);

  logger.info('Webhook subscription.deleted: downgraded to free', {
    operation: 'webhook.subscription.deleted',
    userId,
  });
}

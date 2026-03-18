// =============================================
// Use Case: Create Stripe Checkout Session
// =============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { getStripe, PLAN_PRICE } from '@/lib/stripe';
import { createPendingPayment } from '@/repositories/payments';
import {
  ValidationError,
  ExternalServiceError,
  logger,
} from '@/domain/errors';

export interface CheckoutRequest {
  type: 'single_plan' | 'subscription';
  userId: string;
  userEmail: string;
}

export interface CheckoutResult {
  sessionUrl: string;
}

export async function createStripeCheckoutUseCase(
  supabase: SupabaseClient,
  request: CheckoutRequest,
): Promise<CheckoutResult> {
  const { type, userId, userEmail } = request;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const correlationId = crypto.randomUUID();

  if (!['single_plan', 'subscription'].includes(type)) {
    throw new ValidationError('Invalid payment type', 'Tipo di pagamento non valido');
  }

  logger.info('Stripe checkout: creating session', {
    correlationId,
    userId,
    operation: 'createStripeCheckout',
    type,
  });

  // 1. Create pending payment record
  const payment = await createPendingPayment(
    supabase,
    userId,
    type,
    type === 'single_plan' ? PLAN_PRICE : 0,
  );

  // 2. Create Stripe session
  const stripe = getStripe();

  try {
    if (type === 'single_plan') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              unit_amount: PLAN_PRICE,
              product_data: {
                name: 'Impresius — Singola Operazione',
                description: 'Sblocca una nuova operazione immobiliare con report professionale',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: userId,
          payment_id: payment.id,
          type: 'single_plan',
        },
        success_url: `${APP_URL}/payments?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${APP_URL}/plans/new?cancelled=true`,
      });

      if (!session.url) throw new Error('Stripe returned no session URL');
      return { sessionUrl: session.url };
    }

    // subscription
    const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;
    if (!PREMIUM_PRICE_ID) {
      throw new ValidationError(
        'STRIPE_PREMIUM_PRICE_ID not configured',
        'Abbonamento premium non configurato',
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
      metadata: {
        user_id: userId,
        payment_id: payment.id,
        type: 'subscription',
      },
      subscription_data: {
        metadata: { user_id: userId },
      },
      success_url: `${APP_URL}/payments?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${APP_URL}/payments?cancelled=true`,
    });

    if (!session.url) throw new Error('Stripe returned no session URL');
    return { sessionUrl: session.url };
  } catch (err) {
    logger.error('Stripe checkout: session creation failed', {
      correlationId,
      userId,
      operation: 'createStripeCheckout',
      error: err,
    });
    if (err instanceof ValidationError) throw err;
    throw new ExternalServiceError('Stripe', err);
  }
}

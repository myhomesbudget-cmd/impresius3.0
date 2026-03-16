import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Lazy-initialized service role client to bypass RLS — webhooks have no user session
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "checkout.session.expired": {
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------------
// checkout.session.completed
// -------------------------------------------------------------------
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const paymentId = session.metadata?.payment_id;
  const type = session.metadata?.type;

  if (!userId || !paymentId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  // Update payment record → completed
  const paymentUpdate: Record<string, unknown> = {
    status: "completed",
    provider_payment_id: session.payment_intent as string || session.subscription as string,
  };

  // For subscriptions, store the actual amount from Stripe
  if (type === "subscription" && session.amount_total) {
    paymentUpdate.amount = session.amount_total;
  }

  await getSupabaseAdmin()
    .from("payments")
    .update(paymentUpdate)
    .eq("id", paymentId);

  if (type === "single_plan") {
    // Single plan purchase: user remains on "free" plan,
    // but now has pay_per_plan access (can create additional projects).
    // We set subscription_plan to "pay_per_plan" to reflect purchased access.
    await getSupabaseAdmin()
      .from("profiles")
      .update({ subscription_plan: "pay_per_plan" })
      .eq("id", userId);
  } else if (type === "subscription") {
    // Premium subscription: derive expiration from Stripe subscription data
    let expiresAt: string | null = null;

    if (session.subscription) {
      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );
      const firstItem = subscription.items.data[0];
      if (firstItem) {
        expiresAt = new Date(
          firstItem.current_period_end * 1000
        ).toISOString();
      }
    }

    await getSupabaseAdmin()
      .from("profiles")
      .update({
        subscription_plan: "premium",
        subscription_expires_at: expiresAt,
      })
      .eq("id", userId);
  }
}

// -------------------------------------------------------------------
// checkout.session.expired
// -------------------------------------------------------------------
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const paymentId = session.metadata?.payment_id;
  if (!paymentId) return;

  await getSupabaseAdmin()
    .from("payments")
    .update({ status: "failed" })
    .eq("id", paymentId);
}

// -------------------------------------------------------------------
// customer.subscription.updated
// Fires on renewal, plan change, or trial end — keeps expiration in sync
// -------------------------------------------------------------------
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  if (isActive) {
    const firstItem = subscription.items?.data[0];
    const expiresAt = firstItem
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null;

    await getSupabaseAdmin()
      .from("profiles")
      .update({
        subscription_plan: "premium",
        subscription_expires_at: expiresAt,
      })
      .eq("id", userId);
  } else {
    // past_due, unpaid, etc. — downgrade
    await getSupabaseAdmin()
      .from("profiles")
      .update({
        subscription_plan: "free",
        subscription_expires_at: null,
      })
      .eq("id", userId);
  }
}

// -------------------------------------------------------------------
// customer.subscription.deleted
// Subscription cancelled or expired — downgrade to free
// -------------------------------------------------------------------
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await getSupabaseAdmin()
    .from("profiles")
    .update({
      subscription_plan: "free",
      subscription_expires_at: null,
    })
    .eq("id", userId);
}

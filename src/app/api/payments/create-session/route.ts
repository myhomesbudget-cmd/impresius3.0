import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PLAN_PRICE } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const stripe = getStripe();
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Verify authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body as { type: "single_plan" | "subscription" };

    if (!type || !["single_plan", "subscription"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo di pagamento non valido" },
        { status: 400 }
      );
    }

    // Create pending payment record (plan_id stays null until a project consumes this credit)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: type === "single_plan" ? PLAN_PRICE : 0,
        currency: "EUR",
        status: "pending",
        type,
        provider: "stripe",
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error("Error creating payment record:", paymentError);
      return NextResponse.json(
        { error: "Errore nella creazione del pagamento" },
        { status: 500 }
      );
    }

    // Build Stripe Checkout Session
    if (type === "single_plan") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: PLAN_PRICE,
              product_data: {
                name: "Impresius — Singola Operazione",
                description:
                  "Sblocca una nuova operazione immobiliare con report professionale",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: user.id,
          payment_id: payment.id,
          type: "single_plan",
        },
        success_url: `${APP_URL}/payments?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${APP_URL}/plans/new?cancelled=true`,
      });

      return NextResponse.json({ sessionUrl: session.url });
    }

    // type === "subscription"
    const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;
    if (!PREMIUM_PRICE_ID) {
      console.error("STRIPE_PREMIUM_PRICE_ID not configured");
      return NextResponse.json(
        { error: "Abbonamento premium non configurato" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        payment_id: payment.id,
        type: "subscription",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      success_url: `${APP_URL}/payments?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${APP_URL}/payments?cancelled=true`,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Stripe create-session error:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

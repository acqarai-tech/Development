import Stripe from "https://esm.sh/stripe@13.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const { user_id, valuation_id } = pi.metadata;

    // 1. Update payment status to succeeded
    await supabase
      .from("payments")
      .update({ status: "succeeded", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", pi.id);

    // 2. Grant access to this valuation
    await supabase
      .from("valuation_access")
      .upsert({ user_id, valuation_id: Number(valuation_id) });

    console.log(`Access granted: user ${user_id} → valuation ${valuation_id}`);
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;

    await supabase
      .from("payments")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", pi.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

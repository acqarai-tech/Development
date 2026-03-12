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
    console.error("Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log("Webhook event received:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const { user_id, valuation_id } = pi.metadata;

    console.log("Payment succeeded for user:", user_id, "valuation:", valuation_id);

    // 1. Update payment status to succeeded
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status: "succeeded", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", pi.id);

    if (paymentError) console.error("Payment update error:", paymentError);

    // 2. Grant access to this valuation
    const { error: accessError } = await supabase
      .from("valuation_access")
      .upsert({ 
        user_id, 
        valuation_id: Number(valuation_id) 
      });

    if (accessError) console.error("Valuation access error:", accessError);

    // 3. Update payment column in valuations table
    const { error: valuationError } = await supabase
      .from("valuations")
      .update({ payment: "paid" })
      .eq("id", Number(valuation_id));

    if (valuationError) console.error("Valuation update error:", valuationError);

    // 4. Update free_reports_used for the user
    const { data: userData, error: userFetchError } = await supabase
      .from("users")
      .select("free_reports_used")
      .eq("id", user_id)
      .single();

    if (userFetchError) console.error("User fetch error:", userFetchError);

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ free_reports_used: (userData?.free_reports_used ?? 0) + 1 })
      .eq("id", user_id);

    if (userUpdateError) console.error("User update error:", userUpdateError);

    console.log("All updates completed successfully");
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;

    const { error } = await supabase
      .from("payments")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", pi.id);

    if (error) console.error("Payment failed update error:", error);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

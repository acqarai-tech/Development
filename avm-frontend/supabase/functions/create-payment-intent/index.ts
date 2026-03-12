import Stripe from "https://esm.sh/stripe@13.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { valuationId, userId, userEmail } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // Create Payment Intent for 99 AED
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9900,
      currency: "aed",
      customer: customerId,
      metadata: {
        user_id: userId,
        valuation_id: String(valuationId),
      },
    });

    // Save pending payment to Supabase
    await supabase.from("payments").insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: customerId,
      amount: 9900,
      currency: "aed",
      status: "pending",
      valuation_id: valuationId,
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

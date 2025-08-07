import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new NextResponse(JSON.stringify({ error: "Missing token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const email = userData?.user?.email;

  if (userError || !email) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { sessionId } = await req.json();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscriptionId = session.subscription;

    if (!subscriptionId) throw new Error("Subscription ID not found in session");

    const { error } = await supabase
      .from("profiles")
      .update({ subscription_id: subscriptionId })
      .eq("email", email);

    if (error) throw error;

    return new NextResponse(JSON.stringify({ success: true, subscriptionId }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("❌ Error storing subscription ID:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to store subscription ID" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

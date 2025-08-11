import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return new NextResponse(JSON.stringify({ error: "Missing token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { data: userData } = await supabase.auth.getUser(token);
  const email = userData?.user?.email;

  if (!email) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_id')
    .eq('email', email)
    .single();

  if (error || !data?.subscription_id) {
    return new NextResponse(JSON.stringify({ status: 'none' }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const sub = await stripe.subscriptions.retrieve(data.subscription_id);

    const plan = sub.items.data[0].price.id;
    const status = sub.status;
    const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null;

    return new NextResponse(
      JSON.stringify({ plan, status, cancelAt, subscriptionId: sub.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("❌ Stripe error:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch subscription" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

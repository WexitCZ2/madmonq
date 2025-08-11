// src/app/api/payment/store-subscription-id/route.ts
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StoreSubscriptionBody = {
  sessionId: string;
};

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '*';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '*';

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY');
    if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
    if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

    // Vytvářej klienty až uvnitř handleru
    const stripe = new Stripe(stripeSecret); // ❗️bez apiVersion → vezme výchozí
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

    // Auth z Bearer tokenu
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders(origin),
      });
    }
    const token = authHeader.split(' ')[1];

    const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders(origin),
      });
    }

    const body = (await req.json()) as StoreSubscriptionBody;
    if (!body?.sessionId) {
      return new Response(JSON.stringify({ error: 'Missing sessionId' }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    // Ze Stripe session vytáhneme subscriptionId
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: 'No subscription in session' }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    // Ulož do profiles podle auth user.id (ne podle emailu)
    const { error: upErr } = await supabaseServer
      .from('profiles')
      .update({ subscription_id: subscriptionId })
      .eq('id', userData.user.id);

    if (upErr) {
      console.error('❌ Supabase update error:', upErr);
      return new Response(JSON.stringify({ error: 'DB update failed' }), {
        status: 500,
        headers: corsHeaders(origin),
      });
    }

    return new Response(JSON.stringify({ success: true, subscriptionId }), {
      status: 200,
      headers: corsHeaders(origin),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ store-subscription-id error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: corsHeaders(origin),
    });
  }
}

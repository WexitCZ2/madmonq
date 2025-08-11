import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ⬅️ žádná apiVersion
const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⬅️ přidej do Vercel env
);

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
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders(origin),
      });
    }

    const token = authHeader.split(' ')[1];

    // Ověříme uživatele z JWT (OK i se service role klientem)
    const { data: userData, error: userErr } = await supabaseServer.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders(origin),
      });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing sessionId' }), {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // session.subscription může být string nebo objekt
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

    // Uložení k profilu podle auth user.id
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
  } catch (err) {
    console.error('❌ store-subscription-id error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders(origin),
    });
  }
}

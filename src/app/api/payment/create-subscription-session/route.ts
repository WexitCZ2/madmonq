import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

// ✅ CORS hlavičky
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ✅ CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ✅ POST request - vytvoření subscription session
export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const basicPriceId = process.env.STRIPE_PRICE_ID_BASIC;
  const premiumPriceId = process.env.STRIPE_PRICE_ID_PREMIUM;

  if (!stripeSecretKey || !basicPriceId || !premiumPriceId) {
    console.error("❌ Chybí Stripe klíče nebo Price ID");
    return new NextResponse(JSON.stringify({ error: 'Stripe configuration missing' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const body = (await req.json()) as { plan: 'basic' | 'premium' };

    const selectedPriceId =
      body.plan === 'premium' ? premiumPriceId : basicPriceId;

    // ✅ Vytvoření session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://highs-wondrous-site-2bcc15.webflow.io/success',
      cancel_url: 'https://highs-wondrous-site-2bcc15.webflow.io/cancel',
    });

    // ✅ Získání subscription ID
    const sessionWithSubs = await stripe.checkout.sessions.retrieve(session.id);
    const subscriptionId = sessionWithSubs.subscription;

    return new NextResponse(
      JSON.stringify({
        url: session.url,
        subscriptionId, // 🔑 vracíme pro správu (cancel, upgrade, downgrade)
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("❌ Stripe error:", error);
    return new NextResponse(JSON.stringify({ error: 'Subscription failed' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

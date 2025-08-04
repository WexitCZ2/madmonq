import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

// POST request (vytvoření subscription)
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
    const body = await req.json();
    const { plan } = body as { plan: 'basic' | 'premium' };

    const selectedPriceId = plan === 'premium' ? premiumPriceId : basicPriceId;

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

    return new NextResponse(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ Stripe error:", error);
    return new NextResponse(JSON.stringify({ error: 'Subscription failed' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

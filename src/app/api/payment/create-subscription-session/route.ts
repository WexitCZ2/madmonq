import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const basicPriceId = process.env.STRIPE_PRICE_ID_BASIC;
  const premiumPriceId = process.env.STRIPE_PRICE_ID_PREMIUM;

  if (!stripeSecretKey || !basicPriceId || !premiumPriceId) {
    return new NextResponse(JSON.stringify({ error: 'Stripe key or price IDs missing' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const { plan } = (await req.json()) as { plan: 'basic' | 'premium' };
    const priceId = plan === 'premium' ? premiumPriceId : basicPriceId;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://highs-wondrous-site-2bcc15.webflow.io/success',
      cancel_url: 'https://highs-wondrous-site-2bcc15.webflow.io/cancel',
    });

    const retrieved = await stripe.checkout.sessions.retrieve(session.id);
    const subscriptionId = retrieved.subscription;

    return new NextResponse(JSON.stringify({ url: session.url, subscriptionId }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ Subscription error:", error);
    return new NextResponse(JSON.stringify({ error: 'Subscription failed' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

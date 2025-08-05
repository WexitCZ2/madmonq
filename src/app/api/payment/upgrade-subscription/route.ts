import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceIdPremium = process.env.STRIPE_PRICE_ID_PREMIUM;

  if (!stripeSecretKey || !priceIdPremium) {
    return new NextResponse(JSON.stringify({ error: 'Missing Stripe keys' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeSecretKey);
  const { subscriptionId } = await req.json();

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceIdPremium,
        },
      ],
    });

    return new NextResponse(JSON.stringify({ success: true, updated }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Upgrade Error:", error.message);
    } else {
      console.error("❌ Unknown Upgrade Error:", error);
    }

    return new NextResponse(JSON.stringify({ error: 'Failed to upgrade subscription' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

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

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
  const premiumPriceId = process.env.STRIPE_PRICE_ID_PREMIUM;

  if (!stripeSecretKey || !premiumPriceId) {
    return new NextResponse(JSON.stringify({ error: 'Missing Stripe keys' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const { subscriptionId } = (await req.json()) as { subscriptionId: string };
  const stripe = new Stripe(stripeSecretKey);

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [
        {
          id: subscription.items.data[0].id,
          price: premiumPriceId,
        },
      ],
    });

    return new NextResponse(JSON.stringify({ success: true, updated }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ Upgrade error:", error);
    return new NextResponse(JSON.stringify({ error: 'Failed to upgrade subscription' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

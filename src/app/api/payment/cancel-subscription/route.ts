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
  if (!stripeSecretKey) {
    return new NextResponse(JSON.stringify({ error: 'Stripe key missing' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const { subscriptionId } = (await req.json()) as { subscriptionId: string };
  const stripe = new Stripe(stripeSecretKey);

  try {
    const canceled = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return new NextResponse(JSON.stringify({ success: true, canceled }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("❌ Cancel Error:", error);
    return new NextResponse(JSON.stringify({ error: 'Failed to cancel subscription' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return new NextResponse(JSON.stringify({ error: 'Stripe key missing' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(stripeSecretKey);

  const { subscriptionId } = await req.json();

  try {
    const deleted = await stripe.subscriptions.cancel(subscriptionId);

    return new NextResponse(JSON.stringify({ success: true, deleted }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Cancel Error:", error.message);
    } else {
      console.error("❌ Unknown Cancel Error:", error);
    }

    return new NextResponse(JSON.stringify({ error: 'Failed to cancel subscription' }), {
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

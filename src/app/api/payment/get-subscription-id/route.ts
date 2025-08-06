import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return new NextResponse(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return new NextResponse(
      JSON.stringify({ subscriptionId: session.subscription }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Failed to retrieve session' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey);

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    await stripe.subscriptions.cancel(subscriptionId);

    return NextResponse.json({ message: 'Předplatné zrušeno' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  } catch (err: any) {
    console.error('❌ Chyba při rušení:', err.message);
    return NextResponse.json({ error: 'Nepodařilo se zrušit předplatné' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

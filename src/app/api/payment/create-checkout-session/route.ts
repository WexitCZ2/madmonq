import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('❌ STRIPE_SECRET_KEY není definován v prostředí!');
}

const stripe = new Stripe(stripeSecretKey);

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Madmonq produkt',
            },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://highs-wondrous-site-2bcc15.webflow.io/success',
      cancel_url: 'https://highs-wondrous-site-2bcc15.webflow.io/cancel',
    });

    return new NextResponse(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
} catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Stripe error:', error.message);
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
    return new NextResponse(JSON.stringify({ error: 'Neznámá chyba' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}

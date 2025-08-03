import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("❌ STRIPE_SECRET_KEY není definován v prostředí!");
    return new NextResponse(JSON.stringify({ error: 'Stripe key missing' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  const stripe = new Stripe(stripeSecretKey);

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
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    return new NextResponse(JSON.stringify({ error: 'Payment failed' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}

// 🔧 Přidání podpory pro CORS preflight request (nutné pro Webflow fetch)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

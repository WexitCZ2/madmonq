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
            unit_amount: 1500, // 15.00 USD
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://highs-wondrous-site-2bcc15.webflow.io/success',
      cancel_url: 'https://highs-wondrous-site-2bcc15.webflow.io/cancel',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Stripe error:', error.message);
    return NextResponse.json({ error: 'Chyba při vytváření session' }, { status: 500 });
  }
}

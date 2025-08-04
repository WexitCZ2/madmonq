// src/app/api/payment/create-subscription-session/route.ts

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

  if (!stripeSecretKey || !subscriptionPriceId) {
    console.error("❌ Chybí STRIPE_SECRET_KEY nebo STRIPE_SUBSCRIPTION_PRICE_ID v prostředí");
    return new NextResponse(JSON.stringify({ error: 'Chybí Stripe konfigurace' }), {
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
      mode: 'subscription',
      line_items: [
        {
          price: subscriptionPriceId,
          quantity: 1,
        },
      ],
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
  } catch (error: any) {
    console.error("❌ Stripe error:", error.message);
    return new NextResponse(JSON.stringify({ error: 'Chyba při vytváření předplatného' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}

// src/app/api/payment/create-subscription-session/route.ts

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceBasic = process.env.STRIPE_PRICE_ID_BASIC;
  const pricePremium = process.env.STRIPE_PRICE_ID_PREMIUM;

  if (!stripeSecretKey || !priceBasic || !pricePremium) {
    console.error("❌ Některý z Stripe klíčů chybí");
    return new NextResponse(JSON.stringify({ error: 'Stripe konfigurace chybí' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const body = await req.json();
    const { email, plan } = body as { email: string; plan: 'basic' | 'premium' };

    const priceId = plan === 'basic' ? priceBasic : pricePremium;

    // ✅ Vytvoření zákazníka
    const customer = await stripe.customers.create({ email });

    // ✅ Vytvoření session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
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
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    return new NextResponse(JSON.stringify({ error: 'Chyba při vytváření subscription session' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}

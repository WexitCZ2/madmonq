import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  // ✅ Kontrola, že proměnná existuje
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

  // ✅ Inicializace Stripe
  const stripe = new Stripe(stripeSecretKey, {
    // apiVersion není povinný, pokud nechceš specifickou verzi
  });

  try {
    // ✅ Vytvoření platby
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Madmonq produkt',
            },
            unit_amount: 1500, // $15.00
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

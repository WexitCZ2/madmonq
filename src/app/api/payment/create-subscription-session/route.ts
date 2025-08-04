import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

  if (!stripeSecretKey || !subscriptionPriceId) {
    console.error("❌ STRIPE_SECRET_KEY nebo STRIPE_SUBSCRIPTION_PRICE_ID nejsou definované!");
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
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
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
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Stripe chyba:", err.message);
    } else {
      console.error("❌ Neznámá chyba při vytváření předplatného:", err);
    }

    return new NextResponse(JSON.stringify({ error: 'Nepodařilo se vytvořit předplatné' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}

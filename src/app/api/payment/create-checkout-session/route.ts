import Stripe from 'stripe';
import { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
  });

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') || 'https://madmonq.cz';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: 'Členství Madmonq Alpha',
              description: 'Neomezený vstup, QR systém, statistiky',
            },
            unit_amount: 19900, // cena v haléřích: 199.00 Kč
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      },
    });

  } catch (err: any) {
    console.error("❌ Stripe chyba:", err.message);

    return new Response(JSON.stringify({ error: 'Nepodařilo se vytvořit session' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      },
    });
  }
}

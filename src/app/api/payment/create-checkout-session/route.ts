import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(req: Request) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Členství – Madmonq Gym',
          },
          unit_amount: 9900, // 99.00 USD
        },
        quantity: 1,
      },
    ],
    success_url: 'https://madmonq.cz/?success=true',
    cancel_url: 'https://madmonq.cz/?canceled=true',
  });

  // ✅ VRAŤ S CORS HLAVIČKOU:
  const response = NextResponse.json({ url: session.url });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// ✅ Pokud použiješ i OPTIONS (preflight), můžeš přidat:
export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  }
  

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inicializuj Stripe s tajným klíčem z environment proměnné
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Funkce na POST – vytvoření checkout session
export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Madmonq členství',
          },
          unit_amount: 9900, // 99.00 USD
        },
        quantity: 1,
      },
    ],
    success_url: 'https://madmonq.cz?success=true',
    cancel_url: 'https://madmonq.cz?canceled=true',
  });

  // Vrať URL do frontend fetchu a přidej CORS hlavičky
  const response = NextResponse.json({ url: session.url });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Funkce na OPTIONS – potřebné kvůli CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

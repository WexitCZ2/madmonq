import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

console.log("🧪 Stripe key z prostředí:", stripeSecretKey);

if (!stripeSecretKey) {
  throw new Error("❌ STRIPE_SECRET_KEY není definován v prostředí!");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST() {
  console.log("✅ Backend přijal požadavek na vytvoření checkout session");

  try {
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
            unit_amount: 9900,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://madmonq.cz?success=true',
      cancel_url: 'https://madmonq.cz?canceled=true',
    });

    console.log("✅ Checkout session vytvořena:", session.url);
    return Response.json({ url: session.url });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Stripe chyba:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ error: 'Neznámá chyba při vytváření session.' }, { status: 500 });
  }
}

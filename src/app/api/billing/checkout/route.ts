import { NextResponse } from 'next/server';
import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return stripe;
}

export async function POST(req: Request) {
  try {
    const { priceId, tenantId } = await req.json();

    if (!priceId || !tenantId) {
      return NextResponse.json({ error: 'Missing priceId or tenantId' }, { status: 400 });
    }

    const stripeClient = getStripe();
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/billing`,
      client_reference_id: tenantId,
      metadata: {
        tenantId: tenantId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

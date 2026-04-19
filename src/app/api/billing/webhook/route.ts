import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables are not defined');
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;

  try {
    const stripeClient = getStripe();
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : String(err)}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const tenantId = session.metadata?.tenantId;

  if (!tenantId) {
    return NextResponse.json({ error: 'No tenantId in metadata' }, { status: 400 });
  }

  const supabaseClient = getSupabase();

  switch (event.type) {
    case 'checkout.session.completed':
      // Update tenant to active plan
      await supabaseClient
        .from('tenants')
        .update({
          plan: 'premium',
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);
      break;

    case 'customer.subscription.deleted':
      // Downgrade tenant to free plan
      await supabaseClient
        .from('tenants')
        .update({
          plan: 'free',
          status: 'inactive'
        })
        .eq('id', tenantId);
      break;
  }

  return NextResponse.json({ received: true });
}

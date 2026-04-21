import Stripe from "stripe";
type CheckoutSession = Stripe.Checkout.Session;
import { PaymentProvider, PaymentSession } from "./PaymentProvider.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_default", {
  apiVersion: "2026-03-25.dahlia",
});

export class StripeProvider implements PaymentProvider {
  name = "stripe";

  async createSession(amount: number, userId: string, currency: string): Promise<PaymentSession> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Wallet Deposit",
              description: `Deposit of ${amount} ${currency}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/wallet?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/wallet?cancelled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        amount: amount.toString(),
      },
    });

    return {
      url: session.url ?? undefined,
      reference: session.id,
    };
  }

  async verifyWebhook(payload: any, signature: any): Promise<{
    reference: string;
    status: 'completed' | 'failed';
  }> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_default"
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        reference: session.id,
        status: "completed",
      };
    }

    return {
      reference: "",
      status: "failed",
    };
  }
}

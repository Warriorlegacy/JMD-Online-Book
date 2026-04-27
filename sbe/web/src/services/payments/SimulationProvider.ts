import { PaymentProvider, PaymentSession } from "./PaymentProvider";

export class SimulationProvider implements PaymentProvider {
  name = "simulation";

  async createSession(amount: number, userId: string, currency: string): Promise<PaymentSession> {
    const reference = `sim_${Date.now()}_${userId}`;
    
    // Simulate async payment by triggering webhook after 5 seconds
    setTimeout(async () => {
      try {
        // We simulate a webhook call to our own endpoint
        // In a real app, we'd use a proper webhook URL.
        // For simulation, we just call the endpoint via fetch or internally.
        await fetch("http://localhost:4000/wallet/deposit/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference,
            status: "completed",
            amount,
            userId
          })
        });
      } catch (e) {
        console.error("Simulation webhook failed", e);
      }
    }, 5000);

    return {
      confirmation: "Payment simulated. Balance will update in 5 seconds.",
      reference
    };
  }

  async verifyWebhook(payload: any, signature: any): Promise<{
    reference: string;
    status: 'completed' | 'failed';
  }> {
    // Simulation just trusts the payload
    return {
      reference: payload.reference,
      status: payload.status
    };
  }
}

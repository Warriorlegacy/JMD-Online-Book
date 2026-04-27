import { PaymentProvider } from "./PaymentProvider";
import { StripeProvider } from "./StripeProvider";
import { SimulationProvider } from "./SimulationProvider";

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    const stripe = new StripeProvider();
    const sim = new SimulationProvider();
    this.providers.set(stripe.name, stripe);
    this.providers.set(sim.name, sim);
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider ${name} not supported`);
    }
    return provider;
  }

  listProviders() {
    return Array.from(this.providers.keys());
  }
}

export const paymentService = new PaymentService();

export interface PaymentSession {
  url?: string;
  confirmation?: string;
  reference: string;
}

export interface PaymentProvider {
  name: string;
  createSession(amount: number, userId: string, currency: string): Promise<PaymentSession>;
  verifyWebhook(payload: any, signature: any): Promise<{
    reference: string;
    status: 'completed' | 'failed';
  }>;
}

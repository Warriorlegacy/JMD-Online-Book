import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  RESEND_API_KEY: z.string().min(10),
  NEXT_PUBLIC_APP_NAME: z.string().min(3),
  NEXT_PUBLIC_APP_URL: z.url(),
  Legacy_JWT_Secret: z.string().min(8),
});

const cleanString = (val?: string) => {
  if (!val) return val;
  return val.replace(/\\r\\n/g, '').replace(/\\n/g, '').replace(/\\r/g, '').replace(/[\r\n]/g, '').trim();
};

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: cleanString(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: cleanString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  SUPABASE_SERVICE_ROLE_KEY: cleanString(process.env.SUPABASE_SERVICE_ROLE_KEY),
  RESEND_API_KEY: cleanString(process.env.RESEND_API_KEY),
  NEXT_PUBLIC_APP_NAME: cleanString(process.env.NEXT_PUBLIC_APP_NAME),
  NEXT_PUBLIC_APP_URL: cleanString(process.env.NEXT_PUBLIC_APP_URL),
  Legacy_JWT_Secret: cleanString(process.env.Legacy_JWT_Secret),
});

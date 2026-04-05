import { z } from "zod";

export const emailSchema = z.email().transform((value) => value.toLowerCase().trim());
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10,15}$/, "Enter a valid phone number");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be shorter than 129 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character");

export const registerPayloadSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(2).max(80),
  password: passwordSchema,
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  referralCode: z.string().trim().max(20).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export const depositSchema = z.object({
  amount: z.coerce.number().positive(),
  payment_method: z.string().trim().min(2),
  upi_id: z.string().trim().max(100).optional().or(z.literal("")),
  screenshot_url: z.string().trim().url().optional().or(z.literal("")),
  reference: z.string().trim().max(100).optional().or(z.literal("")),
});

export const withdrawSchema = z.object({
  amount: z.coerce.number().positive(),
  payment_method: z.string().trim().min(2),
  upi_id: z.string().trim().max(100).optional().or(z.literal("")),
  bank_account: z.string().trim().max(50).optional().or(z.literal("")),
  ifsc_code: z.string().trim().max(20).optional().or(z.literal("")),
  account_holder: z.string().trim().max(100).optional().or(z.literal("")),
});

export const approveTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  note: z.string().trim().max(240).optional().or(z.literal("")),
});

export const placeBetSchema = z.object({
  game_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  odds: z.coerce.number().positive(),
});

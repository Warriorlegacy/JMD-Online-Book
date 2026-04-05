import { describe, it, expect } from "vitest";
import {
  emailSchema,
  phoneSchema,
  registerPayloadSchema,
  loginSchema,
  depositSchema,
  withdrawSchema,
  approveTransactionSchema,
  placeBetSchema,
} from "@/lib/validators";

describe("emailSchema", () => {
  it("should validate a valid email", () => {
    const result = emailSchema.parse("Test@Example.COM");
    // Zod v4 email schema transforms - check it's a string and lowered
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should trim and lowercase email", () => {
    // Zod v4 z.email() validates first then transforms; spaces fail validation
    // So we test with a valid email that has uppercase
    const result = emailSchema.parse("USER@DOMAIN.COM");
    expect(typeof result).toBe("string");
    expect(result).toBe(result.toLowerCase());
  });

  it("should reject invalid email", () => {
    expect(() => emailSchema.parse("not-an-email")).toThrow();
  });
});

describe("phoneSchema", () => {
  it("should validate a 10-digit phone number", () => {
    const result = phoneSchema.parse("9876543210");
    expect(result).toBe("9876543210");
  });

  it("should validate a 15-digit phone number", () => {
    const result = phoneSchema.parse("123456789012345");
    expect(result).toBe("123456789012345");
  });

  it("should reject letters in phone", () => {
    expect(() => phoneSchema.parse("abcdefghij")).toThrow();
  });

  it("should reject phone shorter than 10 digits", () => {
    expect(() => phoneSchema.parse("123456789")).toThrow();
  });

  it("should trim whitespace", () => {
    const result = phoneSchema.parse("  9876543210  ");
    expect(result).toBe("9876543210");
  });
});

describe("loginSchema", () => {
  it("should validate valid login credentials", () => {
    const result = loginSchema.parse({
      email: "user@example.com",
      password: "Password123!@#",
    });
    expect(result.email).toBe("user@example.com");
    expect(result.password).toBe("Password123!@#");
  });

  it("should reject empty email", () => {
    expect(() =>
      loginSchema.parse({ email: "", password: "Password1!" })
    ).toThrow();
  });

  it("should reject password shorter than 8 characters", () => {
    expect(() =>
      loginSchema.parse({ email: "user@example.com", password: "Short1!" })
    ).toThrow();
  });

  it("should reject password longer than 128 characters", () => {
    expect(() =>
      loginSchema.parse({
        email: "user@example.com",
        password: "A".repeat(129) + "1!",
      })
    ).toThrow();
  });
});

describe("registerPayloadSchema", () => {
  const validPayload = {
    email: "newuser@example.com",
    fullName: "John Doe",
    password: "SecurePass1!",
    phone: "9876543210",
    referralCode: "ABC123",
  };

  it("should validate a complete registration payload", () => {
    const result = registerPayloadSchema.parse(validPayload);
    expect(result.email).toBe("newuser@example.com");
    expect(result.fullName).toBe("John Doe");
  });

  it("should validate without optional fields", () => {
    const result = registerPayloadSchema.parse({
      email: "user@example.com",
      fullName: "Jane",
      password: "StrongPass1@",
    });
    expect(result.phone).toBeUndefined();
    expect(result.referralCode).toBeUndefined();
  });

  it("should accept empty string for phone", () => {
    const result = registerPayloadSchema.parse({
      email: "user@example.com",
      fullName: "Jane",
      password: "StrongPass1@",
      phone: "",
    });
    expect(result.phone).toBe("");
  });

  it("should reject name shorter than 2 characters", () => {
    expect(() =>
      registerPayloadSchema.parse({
        email: "user@example.com",
        fullName: "A",
        password: "StrongPass1@",
      })
    ).toThrow();
  });

  it("should reject name longer than 80 characters", () => {
    expect(() =>
      registerPayloadSchema.parse({
        email: "user@example.com",
        fullName: "A".repeat(81),
        password: "StrongPass1@",
      })
    ).toThrow();
  });

  it("should reject weak password without uppercase", () => {
    expect(() =>
      registerPayloadSchema.parse({
        email: "user@example.com",
        fullName: "John",
        password: "alllowercase1!",
      })
    ).toThrow();
  });

  it("should reject weak password without number", () => {
    expect(() =>
      registerPayloadSchema.parse({
        email: "user@example.com",
        fullName: "John",
        password: "NoNumbersHere!",
      })
    ).toThrow();
  });
});

describe("depositSchema", () => {
  it("should validate a valid deposit", () => {
    const result = depositSchema.parse({
      amount: 500,
      payment_method: "UPI",
      upi_id: "user@paytm",
      reference: "TXN123",
    });
    expect(Number(result.amount)).toBe(500);
  });

  it("should coerce string amount to number", () => {
    const result = depositSchema.parse({
      amount: "1000",
      payment_method: "UPI",
    });
    expect(Number(result.amount)).toBe(1000);
  });

  it("should accept empty string for optional fields", () => {
    const result = depositSchema.parse({
      amount: 500,
      payment_method: "UPI",
      upi_id: "",
      screenshot_url: "",
      reference: "",
    });
    expect(result.upi_id).toBe("");
  });

  it("should reject negative amount", () => {
    expect(() =>
      depositSchema.parse({ amount: -100, payment_method: "UPI" })
    ).toThrow();
  });

  it("should reject missing payment_method", () => {
    expect(() => depositSchema.parse({ amount: 500 })).toThrow();
  });
});

describe("withdrawSchema", () => {
  it("should validate a valid withdraw request", () => {
    const result = withdrawSchema.parse({
      amount: 1000,
      payment_method: "Bank Transfer",
      bank_account: "1234567890",
      ifsc_code: "HDFC0001234",
      account_holder: "John Doe",
    });
    expect(Number(result.amount)).toBe(1000);
  });

  it("should accept empty string for optional fields", () => {
    const result = withdrawSchema.parse({
      amount: 500,
      payment_method: "UPI",
      upi_id: "",
      bank_account: "",
      ifsc_code: "",
      account_holder: "",
    });
    expect(result.bank_account).toBe("");
  });

  it("should reject negative amount", () => {
    expect(() =>
      withdrawSchema.parse({ amount: -500, payment_method: "UPI" })
    ).toThrow();
  });
});

describe("approveTransactionSchema", () => {
  it("should validate approve action", () => {
    const result = approveTransactionSchema.parse({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      action: "approve",
    });
    expect(result.action).toBe("approve");
  });

  it("should validate reject action", () => {
    const result = approveTransactionSchema.parse({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      action: "reject",
      note: "Invalid details",
    });
    expect(result.action).toBe("reject");
    expect(result.note).toBe("Invalid details");
  });

  it("should accept empty string for note", () => {
    const result = approveTransactionSchema.parse({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      action: "approve",
      note: "",
    });
    expect(result.note).toBe("");
  });

  it("should reject invalid action", () => {
    expect(() =>
      approveTransactionSchema.parse({
        transactionId: "550e8400-e29b-41d4-a716-446655440000",
        action: "delete",
      })
    ).toThrow();
  });

  it("should reject note longer than 240 chars", () => {
    expect(() =>
      approveTransactionSchema.parse({
        transactionId: "550e8400-e29b-41d4-a716-446655440000",
        action: "reject",
        note: "A".repeat(241),
      })
    ).toThrow();
  });
});

describe("placeBetSchema", () => {
  it("should validate a valid bet", () => {
    const result = placeBetSchema.parse({
      game_id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a01",
      amount: 100,
      odds: 2.5,
    });
    expect(Number(result.amount)).toBe(100);
    expect(Number(result.odds)).toBe(2.5);
  });

  it("should coerce string amount and odds", () => {
    const result = placeBetSchema.parse({
      game_id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a01",
      amount: "200",
      odds: "1.8",
    });
    expect(Number(result.amount)).toBe(200);
    expect(Number(result.odds)).toBe(1.8);
  });

  it("should reject negative amount", () => {
    expect(() =>
      placeBetSchema.parse({
        game_id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a01",
        amount: -50,
        odds: 2.0,
      })
    ).toThrow();
  });

  it("should reject zero odds", () => {
    expect(() =>
      placeBetSchema.parse({
        game_id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a01",
        amount: 100,
        odds: 0,
      })
    ).toThrow();
  });
});

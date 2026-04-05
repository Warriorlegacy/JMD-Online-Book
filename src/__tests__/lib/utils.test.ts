import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, getInitials, sleep } from "@/lib/utils";

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "active", false && "disabled")).toBe("base active");
  });

  it("should handle array of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should handle object-based classes", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("should deduplicate and merge Tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle null and undefined", () => {
    expect(cn("foo", null, undefined, "bar")).toBe("foo bar");
  });

  it("should return empty string for no classes", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrency", () => {
  it("should format zero when value is null", () => {
    expect(formatCurrency(null)).toContain("0");
  });

  it("should format zero when value is undefined", () => {
    expect(formatCurrency(undefined)).toContain("0");
  });

  it("should format positive numbers with INR symbol", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("1,000");
    expect(result).toContain("₹");
  });

  it("should format negative numbers", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("-");
    expect(result).toContain("500");
  });

  it("should handle decimals", () => {
    const result = formatCurrency(99.99);
    expect(result).toContain("99.99");
  });
});

describe("formatDate", () => {
  it("should return 'Just now' for null value", () => {
    expect(formatDate(null)).toBe("Just now");
  });

  it("should return 'Just now' for undefined value", () => {
    expect(formatDate(undefined)).toBe("Just now");
  });

  it("should format a valid date string", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    expect(result).toMatch(/15 Jan 2024/);
  });

  it("should format date with time", () => {
    const result = formatDate("2024-06-20T14:45:00Z");
    expect(result).toMatch(/Jun 2024/);
  });
});

describe("getInitials", () => {
  it("should return 'JB' for null value", () => {
    expect(getInitials(null)).toBe("JB");
  });

  it("should return 'JB' for undefined value", () => {
    expect(getInitials(undefined)).toBe("JB");
  });

  it("should return initials for single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should return first two initials for full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should return first two initials for three names", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("should handle empty string as default initials", () => {
    // Empty string is falsy, so returns "JB" default
    expect(getInitials("")).toBe("JB");
  });

  it("should convert to uppercase", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});

describe("sleep", () => {
  it("should resolve after specified milliseconds", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow small timing variance
  });

  it("should resolve for zero delay", async () => {
    const start = Date.now();
    await sleep(0);
    expect(Date.now() - start).toBeGreaterThanOrEqual(0);
  });
});

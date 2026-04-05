import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/repo", () => ({
  countRecentTransactionsByType: vi.fn(),
  ensureRepoBootstrap: vi.fn(),
}));

describe("Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow requests under the limit", async () => {
    const repo = await import("@/lib/repo");
    vi.mocked(repo.countRecentTransactionsByType).mockResolvedValue(2);

    const { enforceTransactionRateLimit } = await import("@/lib/rate-limit");
    await expect(
      enforceTransactionRateLimit("user-1", "deposit")
    ).resolves.not.toThrow();
  });

  it("should reject when rate limit exceeded", async () => {
    const repo = await import("@/lib/repo");
    vi.mocked(repo.countRecentTransactionsByType).mockResolvedValue(5);

    const { enforceTransactionRateLimit } = await import("@/lib/rate-limit");
    await expect(
      enforceTransactionRateLimit("user-1", "deposit")
    ).rejects.toThrow("Too many deposit requests. Try again shortly.");
  });

  it("should track different types independently", async () => {
    const repo = await import("@/lib/repo");
    vi.mocked(repo.countRecentTransactionsByType)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1);

    const { enforceTransactionRateLimit } = await import("@/lib/rate-limit");
    await expect(
      enforceTransactionRateLimit("user-1", "deposit")
    ).rejects.toThrow();
    await expect(
      enforceTransactionRateLimit("user-1", "withdraw")
    ).resolves.not.toThrow();
  });

  it("should handle empty transaction list", async () => {
    const repo = await import("@/lib/repo");
    vi.mocked(repo.countRecentTransactionsByType).mockResolvedValue(0);

    const { enforceTransactionRateLimit } = await import("@/lib/rate-limit");
    await expect(
      enforceTransactionRateLimit("user-1", "bet")
    ).resolves.not.toThrow();
  });
});

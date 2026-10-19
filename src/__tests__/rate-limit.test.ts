import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
};

vi.mock("@/db", () => ({ db: mockDb }));
vi.mock("@/db/schema", () => ({ rateLimits: {} }));
vi.mock("drizzle-orm", () => ({
  and: vi.fn(),
  gte: vi.fn(),
  count: vi.fn().mockReturnValue("count()"),
  eq: vi.fn(),
}));

import { checkRateLimit, recordRateLimitHit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when under the limit", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ total: 2 }]),
      }),
    });
    expect(await checkRateLimit("some-hash")).toBe(true);
  });

  it("returns false when at the limit (5)", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ total: 5 }]),
      }),
    });
    expect(await checkRateLimit("some-hash")).toBe(false);
  });

  it("returns false when over the limit", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ total: 10 }]),
      }),
    });
    expect(await checkRateLimit("some-hash")).toBe(false);
  });
});

describe("recordRateLimitHit", () => {
  it("inserts a row", async () => {
    const valuesMock = vi.fn().mockResolvedValue([]);
    mockDb.insert.mockReturnValue({ values: valuesMock });
    await recordRateLimitHit("some-hash");
    expect(mockDb.insert).toHaveBeenCalled();
    expect(valuesMock).toHaveBeenCalledWith({ ipHash: "some-hash" });
  });
});

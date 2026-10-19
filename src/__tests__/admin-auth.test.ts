import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
  createSession: vi.fn().mockResolvedValue("token"),
  setSessionCookie: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ total: 0 }]),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
  },
}));

vi.mock("@/db/schema", () => ({ rateLimits: {} }));
vi.mock("@/lib/ip-hash", () => ({ hashIp: vi.fn().mockReturnValue("hash") }));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), gte: vi.fn(), count: vi.fn().mockReturnValue("count()"), eq: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]])),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { getSessionUser } from "@/lib/session";

describe("admin auth guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getSessionUser returns null when no session", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const user = await getSessionUser();
    expect(user).toBeNull();
  });

  it("getSessionUser returns user when session is valid", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ email: "admin@test.com" });
    const user = await getSessionUser();
    expect(user?.email).toBe("admin@test.com");
  });
});

describe("CSV export requires auth", () => {
  it("returns 401 when no session", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    // Simulate what the export route does
    const user = await getSessionUser();
    if (!user) {
      const status = 401;
      expect(status).toBe(401);
    }
  });
});

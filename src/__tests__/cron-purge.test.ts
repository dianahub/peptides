import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/db", () => ({
  db: {
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));
vi.mock("@/db/schema", () => ({
  consultationRequests: {},
  rateLimits: {},
}));
vi.mock("drizzle-orm", () => ({ lt: vi.fn() }));

import { GET } from "@/app/api/cron/purge/route";

function makeRequest(authHeader?: string) {
  const headers: Record<string, string> = {};
  if (authHeader) headers["authorization"] = authHeader;
  return new NextRequest("http://localhost/api/cron/purge", { headers });
}

describe("cron purge route", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "test-secret");
  });

  it("returns 401 with no authorization header", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong secret", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with correct secret", async () => {
    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

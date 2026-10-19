import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external dependencies
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ total: 0 }]),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  consultationRequests: {},
  rateLimits: {},
}));

vi.mock("@/lib/ip-hash", () => ({
  hashIp: vi.fn().mockReturnValue("hashed-ip"),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(true),
  recordRateLimitHit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map([["x-forwarded-for", "1.2.3.4"]])),
}));

import { submitConsultation } from "@/app/consultation/actions";
import { checkRateLimit } from "@/lib/rate-limit";

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const validFields = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Hello",
  topic: "GLP-3 (retatrutide) (Weight and Wellness)",
  consent: "on",
  website: "",
};

describe("submitConsultation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts a valid submission with topic", async () => {
    const result = await submitConsultation(null, makeFormData(validFields));
    expect(result?.success).toBe(true);
  });

  it("rejects when consent is missing", async () => {
    const fd = makeFormData({ ...validFields, consent: "" });
    fd.delete("consent");
    const result = await submitConsultation(null, fd);
    expect(result?.success).toBeUndefined();
    expect(result?.error ?? result?.fieldErrors?.consent).toBeTruthy();
  });

  it("blocks honeypot submissions", async () => {
    const result = await submitConsultation(
      null,
      makeFormData({ ...validFields, website: "http://spam.com" })
    );
    expect(result?.success).toBeUndefined();
    expect(result?.error).toMatch(/blocked/i);
  });

  it("rejects when rate limit is exceeded", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce(false);
    const result = await submitConsultation(null, makeFormData(validFields));
    expect(result?.success).toBeUndefined();
    expect(result?.error).toMatch(/too many/i);
  });

  it("rejects invalid email", async () => {
    const result = await submitConsultation(
      null,
      makeFormData({ ...validFields, email: "not-an-email" })
    );
    expect(result?.fieldErrors?.email).toBeTruthy();
  });

  it("rejects message over 1000 chars", async () => {
    const result = await submitConsultation(
      null,
      makeFormData({ ...validFields, message: "x".repeat(1001) })
    );
    expect(result?.fieldErrors?.message).toBeTruthy();
  });
});

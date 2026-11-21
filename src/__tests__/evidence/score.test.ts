import { describe, it, expect } from "vitest";
import { evidenceScore } from "@/lib/evidence/score";

describe("evidenceScore — retracted", () => {
  it("returns 0 for retracted RCT with large n", () => {
    expect(
      evidenceScore({ studyType: "rct", sampleSize: 10000, retracted: true }),
    ).toBe(0);
  });

  it("returns 0 for retracted paper of any shape", () => {
    expect(
      evidenceScore({ studyType: "meta_analysis", sampleSize: 500, retracted: true }),
    ).toBe(0);
    expect(
      evidenceScore({ studyType: null, sampleSize: null, retracted: true }),
    ).toBe(0);
  });
});

describe("evidenceScore — study type ordering (null n)", () => {
  it("RCT beats cohort beats case_series beats animal beats in_vitro", () => {
    const base = { sampleSize: null, retracted: false };
    const rct = evidenceScore({ ...base, studyType: "rct" });
    const cohort = evidenceScore({ ...base, studyType: "cohort" });
    const caseSeries = evidenceScore({ ...base, studyType: "case_series" });
    const animal = evidenceScore({ ...base, studyType: "animal" });
    const inVitro = evidenceScore({ ...base, studyType: "in_vitro" });
    expect(rct).toBeGreaterThan(cohort);
    expect(cohort).toBeGreaterThan(caseSeries);
    expect(caseSeries).toBeGreaterThan(animal);
    expect(animal).toBeGreaterThan(inVitro);
  });

  it("meta_analysis scores the same as rct (both top-tier)", () => {
    const base = { sampleSize: null, retracted: false };
    expect(evidenceScore({ ...base, studyType: "meta_analysis" })).toBe(
      evidenceScore({ ...base, studyType: "rct" }),
    );
  });

  it("unknown study type scores 0 when n is null", () => {
    expect(
      evidenceScore({ studyType: "something_weird", sampleSize: null, retracted: false }),
    ).toBe(0);
  });

  it("null study type scores 0 when n is null", () => {
    expect(
      evidenceScore({ studyType: null, sampleSize: null, retracted: false }),
    ).toBe(0);
  });
});

describe("evidenceScore — sample size bonus", () => {
  it("rising n increases the score monotonically within a study type", () => {
    const st = { studyType: "rct" as const, retracted: false };
    const a = evidenceScore({ ...st, sampleSize: null });
    const b = evidenceScore({ ...st, sampleSize: 5 });
    const c = evidenceScore({ ...st, sampleSize: 20 });
    const d = evidenceScore({ ...st, sampleSize: 50 });
    const e = evidenceScore({ ...st, sampleSize: 200 });
    const f = evidenceScore({ ...st, sampleSize: 2000 });
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(c).toBeLessThan(d);
    expect(d).toBeLessThan(e);
    expect(e).toBeLessThan(f);
  });

  it("n=0 or negative adds nothing", () => {
    const base = { studyType: "rct", retracted: false };
    expect(evidenceScore({ ...base, sampleSize: 0 })).toBe(
      evidenceScore({ ...base, sampleSize: null }),
    );
    expect(evidenceScore({ ...base, sampleSize: -1 })).toBe(
      evidenceScore({ ...base, sampleSize: null }),
    );
  });

  it("large RCT caps at 100", () => {
    expect(
      evidenceScore({ studyType: "rct", sampleSize: 1_000_000, retracted: false }),
    ).toBe(100);
  });
});

describe("evidenceScore — concrete scores", () => {
  it("RCT (null n) = 60", () => {
    expect(
      evidenceScore({ studyType: "rct", sampleSize: null, retracted: false }),
    ).toBe(60);
  });

  it("RCT (n=50) = 60 + 25 = 85", () => {
    expect(
      evidenceScore({ studyType: "rct", sampleSize: 50, retracted: false }),
    ).toBe(85);
  });

  it("animal study (n=24) = 15 + 15 = 30", () => {
    expect(
      evidenceScore({ studyType: "animal", sampleSize: 24, retracted: false }),
    ).toBe(30);
  });

  it("in_vitro (null n) = 5", () => {
    expect(
      evidenceScore({ studyType: "in_vitro", sampleSize: null, retracted: false }),
    ).toBe(5);
  });

  it("review (null n) = 20", () => {
    expect(
      evidenceScore({ studyType: "review", sampleSize: null, retracted: false }),
    ).toBe(20);
  });
});

describe("evidenceScore — clamping", () => {
  it("never returns > 100", () => {
    expect(
      evidenceScore({ studyType: "rct", sampleSize: 50_000, retracted: false }),
    ).toBeLessThanOrEqual(100);
  });

  it("never returns < 0 for non-retracted inputs", () => {
    expect(
      evidenceScore({ studyType: null, sampleSize: null, retracted: false }),
    ).toBeGreaterThanOrEqual(0);
  });
});

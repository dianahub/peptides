import { describe, it, expect } from "vitest";
import { lookup, getSynonyms, didYouMean } from "@/lib/peptides/normalize";

describe("lookup — exact matches", () => {
  it("finds BPC-157 by canonical name", () => {
    const r = lookup("BPC-157");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.id).toBe("bpc-157");
      expect(r.canonicalName).toBe("BPC-157");
    }
  });

  it("finds BPC-157 by synonym 'PL 14736'", () => {
    const r = lookup("PL 14736");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("bpc-157");
  });

  it("finds BPC-157 by synonym 'Body Protection Compound 157'", () => {
    const r = lookup("Body Protection Compound 157");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("bpc-157");
  });

  it("finds TB-500 by canonical name", () => {
    const r = lookup("TB-500");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.id).toBe("tb-500");
      expect(r.canonicalName).toBe("TB-500");
    }
  });

  it("finds TB-500 by fragment sequence 'Ac-LKKTETQ'", () => {
    const r = lookup("Ac-LKKTETQ");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("tb-500");
  });

  it("finds GHK-Cu by canonical name", () => {
    const r = lookup("GHK-Cu");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("ghk-cu");
  });

  it("finds GHK-Cu by synonym 'Copper Tripeptide-1'", () => {
    const r = lookup("Copper Tripeptide-1");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("ghk-cu");
  });

  it("finds KPV by synonym 'Lys-Pro-Val'", () => {
    const r = lookup("Lys-Pro-Val");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("kpv");
  });

  it("finds ARA-290 by synonym 'Cibinetide'", () => {
    const r = lookup("Cibinetide");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("ara-290");
  });

  it("finds ARA-290 by synonym 'HBSP'", () => {
    const r = lookup("HBSP");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("ara-290");
  });
});

describe("lookup — case and punctuation insensitivity", () => {
  it("matches lowercase 'bpc157'", () => {
    const r = lookup("bpc157");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("bpc-157");
  });

  it("matches 'ghk cu' (space instead of hyphen)", () => {
    const r = lookup("ghk cu");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("ghk-cu");
  });

  it("matches 'TB500' (no hyphen)", () => {
    const r = lookup("TB500");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("tb-500");
  });

  it("matches 'ARA290' (no hyphen)", () => {
    const r = lookup("ARA290");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("ara-290");
  });
});

describe("lookup — not found", () => {
  it("returns found:false for unknown peptide", () => {
    const r = lookup("completely-unknown-xyz");
    expect(r.found).toBe(false);
  });

  it("returns found:false with no suggestion for gibberish", () => {
    const r = lookup("zzzzzzzzzzzzzzzzzzz");
    expect(r.found).toBe(false);
    if (!r.found) expect(r.didYouMean).toBeNull();
  });
});

describe("getSynonyms", () => {
  it("returns all synonyms for bpc-157", () => {
    const synonyms = getSynonyms("bpc-157");
    expect(synonyms).not.toBeNull();
    expect(synonyms).toContain("BPC-157");
    expect(synonyms).toContain("PL 14736");
    expect(synonyms).toContain("Body Protection Compound 157");
  });

  it("includes canonical name as first entry", () => {
    const synonyms = getSynonyms("tb-500");
    expect(synonyms?.[0]).toBe("TB-500");
  });

  it("returns null for unknown id", () => {
    expect(getSynonyms("not-a-peptide")).toBeNull();
  });
});

describe("didYouMean", () => {
  it("suggests BPC-157 for 'BPC-158'", () => {
    expect(didYouMean("BPC-158")).toBe("BPC-157");
  });

  it("suggests TB-500 for 'TB500' (covered by exact match but also fuzzy)", () => {
    expect(didYouMean("TB-5OO")).toBe("TB-500");
  });

  it("suggests ARA-290 for 'cibinetid' (truncated)", () => {
    expect(didYouMean("cibinetid")).toBe("ARA-290");
  });

  it("returns null for gibberish with no close match", () => {
    expect(didYouMean("zzzzzzzzzzzzzzzzzzz")).toBeNull();
  });
});

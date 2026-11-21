import { describe, it, expect } from "vitest";
import { lookupGoal } from "@/lib/goals/normalize";
import { lookup as lookupPeptide } from "@/lib/peptides/normalize";

/**
 * Covers the Spanish queries that surface through /es/research. The goals lib
 * is where accent-normalization lives; peptide name lookup handles BPC-157.
 * These queries are the ones the user reported testing.
 */
describe("Spanish /research queries resolve", () => {
  const goalCases: Array<[string, string]> = [
    ["ansiedad", "anxiety-mood"],
    ["bajar de peso", "weight-loss"],
    ["perder peso", "weight-loss"],
    ["pérdida de peso", "weight-loss"],
    ["piel", "skin-beauty"],
    ["longevidad", "longevity"],
    ["cicatrización", "healing"],
    ["cicatrizacion", "healing"],
    ["sueño", "sleep"],
    ["sueno", "sleep"],
    ["memoria", "cognition"],
    ["estrés", "anxiety-mood"],
    ["estres", "anxiety-mood"],
    ["arrugas", "skin-beauty"],
    ["envejecimiento", "longevity"],
    ["curación", "healing"],
    ["curacion", "healing"],
    ["lesiones", "healing"],
  ];

  it.each(goalCases)("lookupGoal(%s) → %s", (q, expectedSlug) => {
    const r = lookupGoal(q, "es");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe(expectedSlug);
  });

  it("NFC and NFD forms of pérdida both resolve", () => {
    const nfc = "pérdida de peso".normalize("NFC");
    const nfd = "pérdida de peso".normalize("NFD");
    const a = lookupGoal(nfc, "es");
    const b = lookupGoal(nfd, "es");
    expect(a.found).toBe(true);
    expect(b.found).toBe(true);
    if (a.found && b.found) {
      expect(a.slug).toBe("weight-loss");
      expect(b.slug).toBe("weight-loss");
    }
  });

  it("BPC-157 falls through goal lookup but matches peptide lookup", () => {
    expect(lookupGoal("BPC-157", "es").found).toBe(false);
    const r = lookupPeptide("BPC-157");
    expect(r.found).toBe(true);
    if (r.found) expect(r.id).toBe("bpc-157");
  });
});

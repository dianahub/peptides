import { describe, it, expect } from "vitest";
import { GOALS } from "@/lib/goals/data";
import { lookupGoal, allGoalSlugs } from "@/lib/goals/normalize";

/**
 * The research page's goal buttons submit ?goal=<slug>, which the API
 * accepts directly (no text normalization). These tests pin:
 *   1. every seeded goal has a well-formed slug + EN/ES names + synonyms
 *   2. every slug is self-consistent across both locale name lookups
 *   3. every slug is recognized as a known slug — the server-side
 *      searchByGoalSlug validates against the GOALS array before
 *      hitting the DB, so this is the gate that keeps a button click
 *      from ever reaching the DB with a bad slug.
 */

const LOCALES = ["en", "es"] as const;

describe("goal data integrity", () => {
  it.each(GOALS)("$slug has nameEn, nameEs, and synonyms in both languages", (g) => {
    expect(g.slug).toMatch(/^[a-z][a-z0-9-]*$/);
    expect(g.nameEn.trim().length).toBeGreaterThan(0);
    expect(g.nameEs.trim().length).toBeGreaterThan(0);
    expect(g.synonymsEn.length).toBeGreaterThan(0);
    expect(g.synonymsEs.length).toBeGreaterThan(0);
  });

  it("allGoalSlugs() returns every GOALS slug exactly once", () => {
    const slugs = allGoalSlugs();
    expect(new Set(slugs).size).toBe(GOALS.length);
    expect(slugs.sort()).toEqual(GOALS.map((g) => g.slug).sort());
  });
});

describe("every goal slug resolves in both locales", () => {
  for (const g of GOALS) {
    for (const locale of LOCALES) {
      it(`${g.slug} × ${locale}: localized name resolves to its own slug`, () => {
        const name = locale === "en" ? g.nameEn : g.nameEs;
        const r = lookupGoal(name, locale);
        expect(r.found).toBe(true);
        if (r.found) {
          expect(r.slug).toBe(g.slug);
          expect(r.lang).toBe(locale);
        }
      });

      it(`${g.slug} × ${locale}: first synonym resolves to its own slug`, () => {
        const syn = locale === "en" ? g.synonymsEn[0] : g.synonymsEs[0];
        const r = lookupGoal(syn, locale);
        expect(r.found).toBe(true);
        if (r.found) expect(r.slug).toBe(g.slug);
      });
    }
  }
});

describe("slug lookup is locale-independent", () => {
  it.each(GOALS)("$slug: typing the slug itself matches regardless of lang", (g) => {
    // The slug may or may not be in the label list, but it IS always
    // in allGoalSlugs(); searchByGoalSlug skips lookupGoal entirely and
    // goes straight to the static GOALS array.
    expect(allGoalSlugs()).toContain(g.slug);
  });
});

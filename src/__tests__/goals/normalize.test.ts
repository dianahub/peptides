import { describe, it, expect } from "vitest";
import { lookupGoal, getGoal, allGoalSlugs } from "@/lib/goals/normalize";

describe("lookupGoal — English matches", () => {
  it("matches 'weight loss' → weight-loss", () => {
    const r = lookupGoal("weight loss");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.slug).toBe("weight-loss");
      expect(r.lang).toBe("en");
    }
  });

  it("matches 'I want to lose weight' → weight-loss", () => {
    const r = lookupGoal("I want to lose weight");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("weight-loss");
  });

  it("matches 'collagen' → skin-beauty", () => {
    const r = lookupGoal("collagen");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("skin-beauty");
  });

  it("matches 'anxiety' → anxiety-mood", () => {
    const r = lookupGoal("anxiety");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("anxiety-mood");
  });

  it("matches 'healthspan' → longevity", () => {
    const r = lookupGoal("healthspan");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("longevity");
  });

  it("matches 'tissue repair' → healing", () => {
    const r = lookupGoal("tissue repair");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("healing");
  });

  it("matches 'insomnia' → sleep", () => {
    const r = lookupGoal("insomnia");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("sleep");
  });

  it("matches 'brain fog' → cognition", () => {
    const r = lookupGoal("brain fog");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("cognition");
  });
});

describe("lookupGoal — Spanish matches", () => {
  it("matches 'bajar de peso' → weight-loss", () => {
    const r = lookupGoal("bajar de peso");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.slug).toBe("weight-loss");
      expect(r.lang).toBe("es");
    }
  });

  it("matches 'quiero adelgazar' → weight-loss", () => {
    const r = lookupGoal("quiero adelgazar");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("weight-loss");
  });

  it("matches 'piel' → skin-beauty", () => {
    const r = lookupGoal("piel");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("skin-beauty");
  });

  it("matches 'ansiedad' → anxiety-mood", () => {
    const r = lookupGoal("ansiedad");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("anxiety-mood");
  });

  it("matches 'longevidad' → longevity", () => {
    const r = lookupGoal("longevidad");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("longevity");
  });

  it("matches 'cicatrización' → healing", () => {
    const r = lookupGoal("cicatrización");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("healing");
  });

  it("matches 'insomnio' → sleep", () => {
    const r = lookupGoal("insomnio");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("sleep");
  });

  it("matches 'memoria' → cognition", () => {
    const r = lookupGoal("memoria");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("cognition");
  });
});

describe("lookupGoal — case and accent insensitivity", () => {
  it("matches 'PÉRDIDA DE PESO' (uppercase + accent)", () => {
    const r = lookupGoal("PÉRDIDA DE PESO");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("weight-loss");
  });

  it("matches 'perdida de peso' (no accent)", () => {
    const r = lookupGoal("perdida de peso");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("weight-loss");
  });

  it("matches 'Colágeno' with accent", () => {
    const r = lookupGoal("Colágeno");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("skin-beauty");
  });

  it("matches 'colageno' without accent", () => {
    const r = lookupGoal("colageno");
    expect(r.found).toBe(true);
    if (r.found) expect(r.slug).toBe("skin-beauty");
  });
});

describe("lookupGoal — longest match wins", () => {
  it("prefers 'deep sleep' over 'sleep'", () => {
    const r = lookupGoal("I want deep sleep tonight");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.slug).toBe("sleep");
      expect(r.matchedTerm).toBe("deep sleep");
    }
  });

  it("prefers 'bajar de peso' over any single word", () => {
    const r = lookupGoal("necesito bajar de peso pronto");
    expect(r.found).toBe(true);
    if (r.found) {
      expect(r.slug).toBe("weight-loss");
      expect(r.matchedTerm).toBe("bajar de peso");
    }
  });
});

describe("lookupGoal — lang restriction", () => {
  it("does not match English synonym when lang=es", () => {
    const r = lookupGoal("weight loss", "es");
    expect(r.found).toBe(false);
  });

  it("does not match Spanish synonym when lang=en", () => {
    const r = lookupGoal("ansiedad", "en");
    expect(r.found).toBe(false);
  });

  it("matches English synonym when lang=en", () => {
    const r = lookupGoal("anxiety", "en");
    expect(r.found).toBe(true);
    if (r.found) expect(r.lang).toBe("en");
  });
});

describe("lookupGoal — no match", () => {
  it("returns found:false for empty string", () => {
    const r = lookupGoal("");
    expect(r.found).toBe(false);
  });

  it("returns found:false for unrelated text", () => {
    const r = lookupGoal("xyzzy frobnicate quux");
    expect(r.found).toBe(false);
  });

  it("does not match partial-word substring", () => {
    const r = lookupGoal("piedra");
    expect(r.found).toBe(false);
  });
});

describe("getGoal", () => {
  it("returns full entry for a known slug", () => {
    const g = getGoal("longevity");
    expect(g).not.toBeNull();
    expect(g?.nameEn).toBe("Longevity");
    expect(g?.nameEs).toBe("Longevidad");
    expect(g?.synonymsEs).toContain("longevidad");
  });

  it("returns null for unknown slug", () => {
    expect(getGoal("not-a-goal")).toBeNull();
  });
});

describe("allGoalSlugs", () => {
  it("returns all 7 seeded goals", () => {
    const slugs = allGoalSlugs();
    expect(slugs).toHaveLength(7);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "weight-loss",
        "skin-beauty",
        "anxiety-mood",
        "longevity",
        "healing",
        "sleep",
        "cognition",
      ]),
    );
  });
});

import { GOALS, type GoalEntry } from "./data";

export type Lang = "en" | "es";

export interface GoalMatch {
  found: true;
  slug: string;
  matchedTerm: string;
  lang: Lang;
}

export interface GoalNotFound {
  found: false;
}

export type GoalLookupResult = GoalMatch | GoalNotFound;

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Maps free text (English or Spanish) to a goal slug.
 * Longer synonym matches win (so "deep sleep" beats "sleep", "bajar de peso" beats "peso").
 * Pass `lang` to restrict matching to one language.
 */
export function lookupGoal(
  text: string,
  lang?: Lang,
): GoalLookupResult {
  const folded = fold(text);
  if (!folded) return { found: false };

  let best: GoalMatch | null = null;
  let bestLen = 0;

  for (const goal of GOALS) {
    const candidates: Array<{ term: string; lang: Lang }> = [];
    if (!lang || lang === "en") {
      for (const t of goal.synonymsEn) candidates.push({ term: t, lang: "en" });
    }
    if (!lang || lang === "es") {
      for (const t of goal.synonymsEs) candidates.push({ term: t, lang: "es" });
    }

    for (const { term, lang: termLang } of candidates) {
      const foldedTerm = fold(term);
      if (!foldedTerm) continue;
      const pattern = new RegExp(`(?:^|\\s)${escapeRegex(foldedTerm)}(?=\\s|$)`);
      if (pattern.test(folded) && foldedTerm.length > bestLen) {
        best = {
          found: true,
          slug: goal.slug,
          matchedTerm: term,
          lang: termLang,
        };
        bestLen = foldedTerm.length;
      }
    }
  }

  return best ?? { found: false };
}

/** Returns the full goal entry for a slug, or null if unknown. */
export function getGoal(slug: string): GoalEntry | null {
  return GOALS.find((g) => g.slug === slug) ?? null;
}

/** Returns every known goal slug. */
export function allGoalSlugs(): string[] {
  return GOALS.map((g) => g.slug);
}

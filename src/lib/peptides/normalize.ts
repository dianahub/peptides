import { PEPTIDES, type PeptideEntry } from "./data";

export interface NormalizeResult {
  found: true;
  id: string;
  canonicalName: string;
  synonyms: string[];
}

export interface NotFoundResult {
  found: false;
  didYouMean: string | null;
}

export type LookupResult = NormalizeResult | NotFoundResult;

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_:]/g, "");
}

function allTokens(entry: PeptideEntry): string[] {
  return [entry.canonicalName, ...entry.synonyms];
}

/** Exact match (case- and punctuation-insensitive). */
export function lookup(input: string): LookupResult {
  const key = normalize(input);

  for (const entry of PEPTIDES) {
    if (allTokens(entry).some((t) => normalize(t) === key)) {
      return {
        found: true,
        id: entry.id,
        canonicalName: entry.canonicalName,
        synonyms: entry.synonyms,
      };
    }
  }

  return { found: false, didYouMean: didYouMean(input) };
}

/** Returns canonical name + all synonyms for a known peptide ID, or null. */
export function getSynonyms(id: string): string[] | null {
  const entry = PEPTIDES.find((p) => p.id === id);
  return entry ? [entry.canonicalName, ...entry.synonyms] : null;
}

/**
 * Returns the closest matching canonical name when the input doesn't match
 * exactly, or null if nothing is close enough (threshold: 40% of input length).
 */
export function didYouMean(input: string): string | null {
  const key = normalize(input);
  const threshold = Math.max(2, Math.floor(key.length * 0.4));

  let best: string | null = null;
  let bestDist = Infinity;

  for (const entry of PEPTIDES) {
    for (const token of allTokens(entry)) {
      const dist = levenshtein(key, normalize(token));
      if (dist < bestDist) {
        bestDist = dist;
        best = entry.canonicalName;
      }
    }
  }

  return bestDist <= threshold ? best : null;
}

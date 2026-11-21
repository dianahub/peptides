export type StudyType =
  | "rct"
  | "meta_analysis"
  | "cohort"
  | "case_series"
  | "review"
  | "animal"
  | "in_vitro"
  | "other";

export interface EvidenceInput {
  studyType: string | null;
  sampleSize: number | null;
  retracted: boolean;
}

const STUDY_TYPE_WEIGHT: Record<StudyType, number> = {
  rct: 60,
  meta_analysis: 60,
  cohort: 45,
  case_series: 25,
  review: 20,
  animal: 15,
  in_vitro: 5,
  other: 10,
};

function studyTypeScore(st: string | null): number {
  if (!st) return 0;
  return STUDY_TYPE_WEIGHT[st as StudyType] ?? 0;
}

function sampleSizeScore(n: number | null): number {
  if (n == null || !Number.isFinite(n) || n < 1) return 0;
  if (n < 10) return 5;
  if (n < 30) return 15;
  if (n < 100) return 25;
  if (n < 500) return 35;
  return 40;
}

/**
 * Evidence score on a 0–100 scale. Retracted papers always score 0.
 * Score = study-type weight + sample-size bonus, clamped to [0, 100].
 */
export function evidenceScore(input: EvidenceInput): number {
  if (input.retracted) return 0;
  const total = studyTypeScore(input.studyType) + sampleSizeScore(input.sampleSize);
  return Math.min(100, Math.max(0, total));
}

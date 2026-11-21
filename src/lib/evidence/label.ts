export type EvidenceLabel =
  | { kind: "humanRct"; n: number | null }
  | { kind: "humanCohort"; n: number | null }
  | { kind: "humanCaseSeries"; n: number | null }
  | { kind: "humanOther"; n: number | null; studyType: string | null }
  | { kind: "animalOnly"; species: string[]; n: number | null }
  | { kind: "inVitroOnly" }
  | { kind: "review" }
  | { kind: "preclinical" }
  | { kind: "unknown" };

export interface EvidenceLabelInput {
  studyType: string | null;
  species: string[] | null;
  sampleSize: number | null;
}

export function evidenceLabel(input: EvidenceLabelInput): EvidenceLabel {
  const st = input.studyType;
  const species = input.species ?? [];
  const n = input.sampleSize;
  const isHuman = species.includes("human");
  const isInVitro = species.length > 0 && species.every((s) => s === "in_vitro");

  if (st === "review" || st === "meta_analysis") return { kind: "review" };
  if (isHuman) {
    if (st === "rct") return { kind: "humanRct", n };
    if (st === "cohort") return { kind: "humanCohort", n };
    if (st === "case_series") return { kind: "humanCaseSeries", n };
    return { kind: "humanOther", n, studyType: st };
  }
  if (isInVitro || st === "in_vitro") return { kind: "inVitroOnly" };
  if (st === "animal" || (species.length > 0 && !isHuman)) {
    return { kind: "animalOnly", species, n };
  }
  if (!st) return { kind: "unknown" };
  return { kind: "preclinical" };
}

/** Badge color tier for the UI, independent of locale. */
export function evidenceTier(label: EvidenceLabel): "green" | "blue" | "amber" | "slate" {
  switch (label.kind) {
    case "humanRct":
      return "green";
    case "humanCohort":
    case "humanCaseSeries":
    case "humanOther":
    case "review":
      return "blue";
    case "animalOnly":
    case "preclinical":
      return "amber";
    case "inVitroOnly":
    case "unknown":
      return "slate";
  }
}

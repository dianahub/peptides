export interface PeptideEntry {
  id: string;
  canonicalName: string;
  synonyms: string[];
  category: string;
  fdaStatus: string;
  goals: string[];
}

export const PEPTIDES: PeptideEntry[] = [
  {
    id: "bpc-157",
    canonicalName: "BPC-157",
    synonyms: [
      "PL 14736",
      "Body Protection Compound 157",
      "Body Protection Compound-157",
      "Bepecin",
      "Pentadecapeptide BPC 157",
    ],
    category: "healing",
    fdaStatus: "research_only",
    goals: ["healing"],
  },
  {
    id: "tb-500",
    canonicalName: "TB-500",
    synonyms: [
      "Thymosin Beta-4 Fragment",
      "Thymosin Beta 4 Fragment",
      "Ac-LKKTETQ",
      "TB500",
      "Tβ4 fragment",
    ],
    category: "healing",
    fdaStatus: "research_only",
    goals: ["healing"],
  },
  {
    id: "ghk-cu",
    canonicalName: "GHK-Cu",
    synonyms: [
      "Copper Peptide GHK",
      "Copper Tripeptide-1",
      "GHK Copper",
      "Glycyl-L-histidyl-L-lysine copper",
      "GHK:Cu",
    ],
    category: "healing",
    fdaStatus: "cosmetic_use",
    goals: ["healing", "skin-beauty"],
  },
  {
    id: "kpv",
    canonicalName: "KPV",
    synonyms: [
      "Lys-Pro-Val",
      "α-MSH (11-13)",
      "Alpha-MSH C-terminal tripeptide",
      "α-melanocyte-stimulating hormone fragment 11-13",
    ],
    category: "healing",
    fdaStatus: "research_only",
    goals: ["healing"],
  },
  {
    id: "ara-290",
    canonicalName: "ARA-290",
    synonyms: [
      "Cibinetide",
      "Helix B Surface Peptide",
      "HBSP",
      "ARA290",
    ],
    category: "healing",
    fdaStatus: "investigational",
    goals: ["healing"],
  },
  {
    id: "semaglutide",
    canonicalName: "Semaglutide",
    synonyms: [
      "Ozempic",
      "Wegovy",
      "Rybelsus",
      "NN9924",
      "GLP-1 receptor agonist",
    ],
    category: "weight-loss",
    fdaStatus: "approved",
    goals: ["weight-loss"],
  },
  {
    id: "tirzepatide",
    canonicalName: "Tirzepatide",
    synonyms: [
      "Mounjaro",
      "Zepbound",
      "LY3298176",
      "GIP/GLP-1 receptor agonist",
    ],
    category: "weight-loss",
    fdaStatus: "approved",
    goals: ["weight-loss"],
  },
  {
    id: "aod-9604",
    canonicalName: "AOD-9604",
    synonyms: [
      "AOD9604",
      "HGH fragment 176-191",
      "hGH 177-191",
      "Advanced Obesity Drug 9604",
    ],
    category: "weight-loss",
    fdaStatus: "investigational",
    goals: ["weight-loss"],
  },
  {
    id: "tesamorelin",
    canonicalName: "Tesamorelin",
    synonyms: [
      "Egrifta",
      "TH9507",
      "GHRH analog",
    ],
    category: "weight-loss",
    fdaStatus: "approved",
    goals: ["weight-loss"],
  },
  {
    id: "matrixyl",
    canonicalName: "Palmitoyl Pentapeptide-4",
    synonyms: [
      "Matrixyl",
      "Pal-KTTKS",
      "Palmitoyl-Lysyl-Threonyl-Threonyl-Lysyl-Serine",
      "Pal-Lys-Thr-Thr-Lys-Ser",
    ],
    category: "skin-beauty",
    fdaStatus: "cosmetic_use",
    goals: ["skin-beauty"],
  },
  {
    id: "argireline",
    canonicalName: "Acetyl Hexapeptide-3",
    synonyms: [
      "Argireline",
      "Acetyl Hexapeptide-8",
      "Ac-EEMQRR",
      "Ac-Glu-Glu-Met-Gln-Arg-Arg",
    ],
    category: "skin-beauty",
    fdaStatus: "cosmetic_use",
    goals: ["skin-beauty"],
  },
  {
    id: "selank",
    canonicalName: "Selank",
    synonyms: [
      "TP-7",
      "Thr-Lys-Pro-Arg-Pro-Gly-Pro",
      "Threonyl-Lysyl-Prolyl-Arginyl-Prolyl-Glycyl-Prolyl",
    ],
    category: "anxiety-mood",
    fdaStatus: "research_only",
    goals: ["anxiety-mood"],
  },
  {
    id: "semax",
    canonicalName: "Semax",
    synonyms: [
      "Met-Glu-His-Phe-Pro-Gly-Pro",
      "N-acetyl Semax",
      "ACTH (4-7) analog",
    ],
    category: "anxiety-mood",
    fdaStatus: "research_only",
    goals: ["anxiety-mood"],
  },
  {
    id: "epitalon",
    canonicalName: "Epitalon",
    synonyms: [
      "Epithalon",
      "Ala-Glu-Asp-Gly",
      "Alanyl-Glutamyl-Aspartyl-Glycine",
      "AEDG",
    ],
    category: "longevity",
    fdaStatus: "research_only",
    goals: ["longevity"],
  },
  {
    id: "mots-c",
    canonicalName: "MOTS-c",
    synonyms: [
      "MOTSc",
      "MOTS c",
      "Mitochondrial ORF of 12S rRNA-c",
    ],
    category: "longevity",
    fdaStatus: "research_only",
    goals: ["longevity"],
  },
  {
    id: "ss-31",
    canonicalName: "SS-31",
    synonyms: [
      "Elamipretide",
      "Bendavia",
      "MTP-131",
      "D-Arg-Dmt-Lys-Phe-NH2",
    ],
    category: "longevity",
    fdaStatus: "investigational",
    goals: ["longevity"],
  },
];

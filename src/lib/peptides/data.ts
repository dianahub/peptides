export interface PeptideEntry {
  id: string;
  canonicalName: string;
  synonyms: string[];
  category: string;
  fdaStatus: string;
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
  },
];

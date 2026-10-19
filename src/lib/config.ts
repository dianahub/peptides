// AFFILIATE_URL is off by default. Set it in environment variables only if
// your affiliate terms require a tracked link.
export const AFFILIATE_URL: string | null =
  process.env.AFFILIATE_URL ?? null;

export const SITE_NAME = "Futurotek";
export const SITE_TITLE = "Futurotek: Peptide and Longevity Education";
export const SITE_DESCRIPTION =
  "Educational information about peptides and longevity research, and free consultation requests.";

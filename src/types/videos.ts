export interface VideoEntry {
  id: string;
  title: string;
  description: string;
  url: string;
  featured?: boolean;
  /** Optional canonical peptide name or synonym that this video is about. */
  peptide?: string;
  /** Optional topic slug (e.g. "ss-31") that this video is about. */
  topic?: string;
  /** Optional free-form tags for cross-cutting discovery. */
  tags?: string[];
}

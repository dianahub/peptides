export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

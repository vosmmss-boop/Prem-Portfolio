/**
 * Slug generation and validation utility
 */

export function generateSlug(text: string): string {
  if (!text) return `item-${Date.now().toString(36)}`;

  // Convert to lowercase and trim
  let slug = text
    .toLowerCase()
    .trim()
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    slug = `article-${Date.now().toString(36)}`;
  }

  return slug;
}

export function isSlugUnique(slug: string, existingSlugs: string[], currentId?: string): boolean {
  if (!slug) return false;
  // If editing an existing item, the slug is valid if it matches only that item's slug
  const normalized = slug.toLowerCase().trim();
  const duplicates = existingSlugs.filter((s) => s.toLowerCase() === normalized);
  return duplicates.length === 0;
}

/**
 * Sanitize incoming slug parameter to match storage keys
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

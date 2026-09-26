/**
 * Generates URL-friendly slugs supporting English, Bengali, numbers, and symbols.
 * Handles duplicate slug collisions with random or incremental suffixes.
 */
export function generateSlug(title: string, suffix?: string | number): string {
  if (!title) return `video-${Date.now().toString(36)}`;

  // Trim whitespace
  let clean = title.trim();

  // Convert to lowercase for ASCII characters while preserving Unicode letters/numbers (Bengali, Hindi, etc.)
  clean = clean.toLowerCase();

  // Replace punctuation and special symbols with hyphen, keeping unicode characters and digits
  // Allow \p{L} (Unicode letters), \p{N} (numbers)
  clean = clean.replace(/[^\p{L}\p{N}]+/gu, '-');

  // Strip leading and trailing hyphens
  clean = clean.replace(/^-+|-+$/g, '');

  if (!clean) {
    clean = `video-${Date.now().toString(36)}`;
  }

  // Truncate to reasonable slug length
  if (clean.length > 80) {
    clean = clean.substring(0, 80).replace(/-+$/g, '');
  }

  if (suffix !== undefined && suffix !== '') {
    return `${clean}-${suffix}`;
  }

  return clean;
}

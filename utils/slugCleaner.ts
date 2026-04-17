// utils/slugCleaner.ts - Utility functions for cleaning and normalizing slugs

/**
 * Clean a slug by removing special characters, trailing slashes, and normalizing
 * @param slug The slug to clean
 * @returns Cleaned slug
 */
export function cleanSlug(slug: string): string {
  if (!slug) return '';
  
  return slug
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\/+$/g, '')      // Remove trailing slashes
    .replace(/\/+/g, '')       // Remove all slashes
    .replace(/&/g, '-and-')    // Replace "&" with "-and-"
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/[^\w\-]/g, '')   // Remove special characters except hyphens and word chars
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Clean category slug specifically, handling "&" symbols
 * Converts "People & Issues" to "people-issues"
 * Converts "Food & Beverage" to "food-beverage"
 */
export function cleanCategorySlug(categorySlug: string): string {
  if (!categorySlug) return 'news';
  
  const cleaned = cleanSlug(categorySlug);
  
  // Special handling for common category patterns with "&"
  const specialMappings: Record<string, string> = {
    'people-and-issues': 'people-issues',
    'food-and-beverage': 'food-beverage',
    'health-and-wellness': 'health-wellness',
    'home-and-living': 'home-living',
    'art-and-culture': 'art-culture',
    'science-and-technology': 'science-technology'
  };
  
  return specialMappings[cleaned] || cleaned;
}

/**
 * Validate if a URL slug is clean (no special characters, no trailing slashes)
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  
  // Check for trailing slashes
  if (slug.endsWith('/')) return false;
  
  // Check for multiple slashes
  if (slug.includes('//')) return false;
  
  // Check for invalid characters (allow only alphanumeric, hyphens, and underscores)
  const validSlugRegex = /^[a-z0-9\-_]+$/;
  return validSlugRegex.test(slug.toLowerCase());
}

/**
 * Normalize a URL path by cleaning each segment
 * Example: "/news/some-post////" becomes "/news/some-post"
 */
export function normalizeUrlPath(path: string): string {
  if (!path) return '/';
  
  // Split by slashes, clean each segment, then join back
  const segments = path.split('/')
    .map(segment => cleanSlug(segment))
    .filter(segment => segment.length > 0); // Remove empty segments
  
  return '/' + segments.join('/');
}

/**
 * Extract clean category and slug from a URL path
 * Returns { category: string, slug: string } or null if invalid
 */
export function parsePostUrl(path: string): { category: string; slug: string } | null {
  if (!path || path === '/') return null;
  
  const normalizedPath = normalizeUrlPath(path);
  const segments = normalizedPath.split('/').filter(segment => segment.length > 0);
  
  // Expecting format: /category/slug
  if (segments.length < 2) return null;
  
  const category = segments[0];
  const slug = segments.slice(1).join('/'); // In case slug has hyphens
  
  return { category, slug };
}

/**
 * Generate a clean post URL from category and slug
 */
export function generateCleanPostUrl(category: string, slug: string): string {
  const cleanCategory = cleanCategorySlug(category);
  const cleanSlugValue = cleanSlug(slug);
  
  return `/${cleanCategory}/${cleanSlugValue}`;
}
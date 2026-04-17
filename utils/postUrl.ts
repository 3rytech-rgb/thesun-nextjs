// utils/postUrl.ts - Helper functions for generating post URLs with category validation

import { WPPostWithMedia, WPCategory } from '@/types/wordpress';
import { getShortenedCategorySlug } from '@/lib/wordpress';

/**
 * Generate post URL with parent/child category hierarchy
 * Format: /[parent-category]/[child-category]/[post-slug]
 */
export function generatePostUrlWithCategory(
  post: WPPostWithMedia, 
  categories: WPCategory[]
): string {
  if (!post) return '/';
  
  // Get post category IDs
  const postCategoryIds = post.categories || [];
  
  // Find categories for this post
  const postCategories = categories.filter(cat => 
    postCategoryIds.includes(cat.id)
  );
  
  let categoryPath = 'news'; // Default fallback
  
  if (postCategories.length > 0) {
    // Sort by parent-child relationship
    const sortedCategories = sortCategoriesByHierarchy(postCategories);
    
    // Get shortened slugs for each category
    const categorySlugs = sortedCategories.map(cat => 
      getShortenedCategorySlug(cat.slug)
    );
    
    // Join with slashes
    categoryPath = categorySlugs.join('/');
  }
  
  // Clean category path and post slug
  const cleanCategoryPath = cleanCategoryPathForUrl(categoryPath);
  const cleanPostSlug = post.slug
    .toLowerCase()
    .replace(/[^\w\-]/g, '')
    .trim();
  
  return `/${cleanCategoryPath}/${cleanPostSlug}`;
}

// Helper function to sort categories by hierarchy (parent first, then child)
function sortCategoriesByHierarchy(categories: WPCategory[]): WPCategory[] {
  // Find root categories (no parent or parent = 0)
  const rootCategories = categories.filter(cat => !cat.parent || cat.parent === 0);
  
  // Find child categories
  const childCategories = categories.filter(cat => cat.parent && cat.parent > 0);
  
  // Sort child categories under their parents
  const sorted: WPCategory[] = [];
  
  // Add root categories first
  sorted.push(...rootCategories);
  
  // Add child categories after their parents
  for (const child of childCategories) {
    const parentIndex = sorted.findIndex(cat => cat.id === child.parent);
    if (parentIndex !== -1) {
      // Insert child after its parent
      sorted.splice(parentIndex + 1, 0, child);
    } else {
      // If parent not found in this list, add to end
      sorted.push(child);
    }
  }
  
  return sorted;
}

// Helper function to clean category path for URL
function cleanCategoryPathForUrl(path: string): string {
  return path
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\/]/g, '')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '')
    .replace(/^\/+|\/+$/g, '') || 'news';
}

/**
 * Validate if a post belongs to a specific category
 */
export function validatePostCategory(
  post: WPPostWithMedia,
  categorySlug: string,
  categories: WPCategory[]
): boolean {
  if (!post || !categorySlug || !categories) return false;
  
  // Get original category slug from shortened slug
  const originalCategorySlug = getOriginalCategorySlugFromShort(categorySlug);
  
  // Find category by slug
  const category = categories.find(cat => cat.slug === originalCategorySlug);
  if (!category) return false;
  
  // Check if post belongs to this category
  return post.categories && post.categories.includes(category.id);
}

/**
 * Get original category slug from shortened slug
 * This is a simplified version that doesn't require the full mapping
 */
function getOriginalCategorySlugFromShort(shortSlug: string): string {
  if (!shortSlug) return 'berita-nasional';
  
  // Simple reverse mapping for common categories
  const reverseMappings: Record<string, string> = {
    'news': 'berita-nasional',
    'world': 'berita-internasional',
    'sports': 'sukan',
    'entertainment': 'hiburan',
    'lifestyle': 'gaya-hidup',
    'tech': 'teknologi',
    'business': 'ekonomi',
    'politics': 'politik',
    'health': 'kesihatan',
    'education': 'pendidikan',
    'religion': 'agama',
    'travel': 'travel',
    'food': 'makanan',
    'fashion': 'fesyen',
    'automotive': 'otomotif',
    'crime': 'jenayah',
    'opinion': 'pendapat'
  };
  
  return reverseMappings[shortSlug] || shortSlug;
}

/**
 * Clean text content by removing HTML tags and decoding entities
 */
export function cleanTextContent(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove HTML tags
  const withoutTags = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const textArea = document.createElement('textarea');
  textArea.innerHTML = withoutTags;
  return textArea.value;
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
}
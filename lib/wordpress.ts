// lib/wordpress.ts - FULL UPDATED VERSION
import { 
  WPPost, 
  WPPostWithMedia, 
  WPMedia, 
  WPTag, 
  WPAuthor,
  WPCategory 
} from '../types/wordpress';

// Constants
const WORDPRESS_API_URL = 'https://thesun.my/wp-json/wp/v2';

// Helper function untuk extract featured media
export function extractFeaturedMedia(post: WPPost): WPPostWithMedia {
  const postWithMedia: WPPostWithMedia = { ...post };
  
  // Extract featured media dari _embedded
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0];
    postWithMedia.featured_media_url = media.source_url;
    postWithMedia.featured_media_alt = media.alt_text || '';
    postWithMedia.featured_media_width = media.media_details?.width;
    postWithMedia.featured_media_height = media.media_details?.height;
  }
  
  // Extract authors dari _embedded atau dari post.authors
  if (post._embedded?.author?.[0]) {
    postWithMedia.authors = [post._embedded.author[0]];
  }
  
  return postWithMedia;
}

// Function untuk fetch posts dengan parameter opsional - KINI RETURN WPPostWithMedia[]
export async function getPosts(perPage = 20, page = 1): Promise<WPPostWithMedia[]> {
  try {
    console.log('🔗 Fetching posts:', {
      perPage,
      page,
      url: `${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia,author&per_page=${perPage}&page=${page}`
    });
    
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia,author&per_page=${perPage}&page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('❌ API Response not OK:', res.status, res.statusText);
      throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log('✅ Posts fetched successfully:', posts.length);
    
    // Process each post to ensure consistent structure
    const processedPosts = posts.map((post: WPPost): WPPostWithMedia => {
      // Ensure categories and tags are numbers
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media jika ada di _embedded
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });

    console.log('🖼️ Processed posts with images:', processedPosts.filter(p => p.featured_media_url).length);
    return processedPosts;
  } catch (error) {
    console.error('💥 Error fetching posts:', error);
    return [];
  }
}

// Fetch single post by slug - KINI RETURN WPPostWithMedia
export async function getPost(slug: string): Promise<WPPostWithMedia | null> {
  try {
    console.log('📄 Fetching post by slug:', slug);
    
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed=wp:featuredmedia,author`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch post:', res.status, res.statusText);
      throw new Error(`Failed to fetch post: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    
    if (!posts.length) {
      console.log('⚠️ Post not found:', slug);
      return null;
    }
    
    const post = posts[0];
    console.log('✅ Post fetched successfully:', post.title.rendered);
    
    // Process post untuk konsistensi
    const categories = Array.isArray(post.categories) 
      ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
      : [];
    
    const tags = Array.isArray(post.tags)
      ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
      : [];
    
    // Extract media
    let featured_media_url = undefined;
    let featured_media_alt = undefined;
    let featured_media_width = undefined;
    let featured_media_height = undefined;
    
    if (post._embedded?.['wp:featuredmedia']?.[0]) {
      const media = post._embedded['wp:featuredmedia'][0];
      featured_media_url = media.source_url;
      featured_media_alt = media.alt_text || post.title.rendered;
      featured_media_width = media.media_details?.width;
      featured_media_height = media.media_details?.height;
    }
    
    // Create WPPostWithMedia object
    const postWithMedia: WPPostWithMedia = {
      ...post,
      categories,
      tags,
      authors: post.authors || post._embedded?.author || []
    };
    
    // Add media properties
    if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
    if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
    if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
    if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
    
    return postWithMedia;
  } catch (error) {
    console.error('💥 Error fetching post:', error);
    return null;
  }
}

// Fetch all categories
export async function getCategories(): Promise<WPCategory[]> {
  try {
    console.log('📂 Fetching categories...');
    
    const res = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100&orderby=count&order=desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch categories:', res.status, res.statusText);
      throw new Error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
    }
    
    const categories = await res.json();
    console.log('✅ Categories fetched successfully:', categories.length);
    
    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      link: cat.link,
      count: cat.count || 0,
      parent: cat.parent || 0,
    }));
  } catch (error) {
    console.error('💥 Error fetching categories:', error);
    return [];
  }
}

// Fetch posts by category ID - KINI RETURN WPPostWithMedia[]
export async function getPostsByCategory(categoryId: number, perPage = 20): Promise<WPPostWithMedia[]> {
  try {
    console.log(`📂 Fetching posts for category ${categoryId}`);
    
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?categories=${categoryId}&_embed=wp:featuredmedia,author&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch category posts:', res.status, res.statusText);
      throw new Error(`Failed to fetch category posts: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log(`✅ Category ${categoryId} posts fetched:`, posts.length);
    
    // Process posts untuk konsistensi
    return posts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('💥 Error fetching category posts:', error);
    return [];
  }
}

// Fetch posts by category dengan include children - KINI RETURN WPPostWithMedia[]
export async function getPostsByCategoryWithChildren(parentCategoryId: number, perPage = 50): Promise<WPPostWithMedia[]> {
  try {
    console.log(`📂 Fetching posts for parent category ${parentCategoryId} with children`);
    
    // Fetch all categories untuk mendapatkan children
    const allCategories = await getCategories();
    
    // Find all child category IDs
    const childCategories = allCategories.filter(cat => cat.parent === parentCategoryId);
    const allCategoryIds = [parentCategoryId, ...childCategories.map(cat => cat.id)];
    
    console.log('📋 Category IDs to fetch:', allCategoryIds);
    
    // Build query untuk multiple categories
    const categoryQuery = allCategoryIds.map(id => `categories[]=${id}`).join('&');
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?${categoryQuery}&_embed=wp:featuredmedia,author&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch category posts with children:', res.status, res.statusText);
      throw new Error(`Failed to fetch category posts: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log(`✅ Parent + children posts fetched:`, posts.length);
    
    // Remove duplicates
    const uniquePosts = posts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    
    // Process posts
    return uniquePosts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('💥 Error fetching parent category posts with children:', error);
    return [];
  }
}

// Fetch specific media by ID
export async function getMediaById(mediaId: number): Promise<WPMedia | null> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}/media/${mediaId}`);
    
    if (!res.ok) {
      console.error(`Failed to fetch media ${mediaId}:`, res.status);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching media ${mediaId}:`, error);
    return null;
  }
}

// ===========================================
// TOP STORIES FUNCTION - NEW
// ===========================================

// Fetch top stories dari custom API endpoint
export async function getTopStories(): Promise<WPPostWithMedia[]> {
  try {
    console.log('📊 Fetching top stories from custom API...');
    
    const res = await fetch('https://thesun.my/wp-json/thesun/v1/top-stories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // Revalidate setiap 60 saat
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch top stories:', res.status, res.statusText);
      throw new Error(`Failed to fetch top stories: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log('✅ Top stories fetched:', posts.length);
    
    // Process posts untuk konsistensi
    return posts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('💥 Error fetching top stories:', error);
    // Fallback ke posts biasa jika API custom gagal
    console.log('🔄 Using regular posts as fallback for top stories');
    return await getPosts(10);
  }
}

// ===========================================
// SEARCH AND OTHER FUNCTIONS
// ===========================================

// Fetch posts by search term - KINI RETURN WPPostWithMedia[]
export async function searchPosts(searchTerm: string, perPage = 20): Promise<WPPostWithMedia[]> {
  try {
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?search=${encodeURIComponent(searchTerm)}&_embed=wp:featuredmedia,author&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('Failed to search posts:', res.status, res.statusText);
      throw new Error(`Failed to search posts: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    
    // Process posts
    return posts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

// Fetch posts by author - KINI RETURN WPPostWithMedia[]
export async function getPostsByAuthor(authorId: number, perPage = 20): Promise<WPPostWithMedia[]> {
  try {
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?author=${authorId}&_embed=wp:featuredmedia,author&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('Failed to fetch author posts:', res.status, res.statusText);
      throw new Error(`Failed to fetch author posts: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    
    // Process posts
    return posts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('Error fetching author posts:', error);
    return [];
  }
}

// Fetch specific page by slug - KINI RETURN WPPostWithMedia
export async function getPage(slug: string): Promise<WPPostWithMedia | null> {
  try {
    const res = await fetch(
      `${WORDPRESS_API_URL}/pages?slug=${slug}&_embed=wp:featuredmedia,author`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('Failed to fetch page:', res.status, res.statusText);
      return null;
    }
    
    const pages: WPPost[] = await res.json();
    
    if (!pages.length) {
      return null;
    }
    
    const page = pages[0];
    
    // Process page
    const categories = Array.isArray(page.categories) 
      ? page.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
      : [];
    
    const tags = Array.isArray(page.tags)
      ? page.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
      : [];
    
    // Extract media
    let featured_media_url = undefined;
    let featured_media_alt = undefined;
    let featured_media_width = undefined;
    let featured_media_height = undefined;
    
    if (page._embedded?.['wp:featuredmedia']?.[0]) {
      const media = page._embedded['wp:featuredmedia'][0];
      featured_media_url = media.source_url;
      featured_media_alt = media.alt_text || page.title.rendered;
      featured_media_width = media.media_details?.width;
      featured_media_height = media.media_details?.height;
    }
    
    // Create WPPostWithMedia object
    const pageWithMedia: WPPostWithMedia = {
      ...page,
      categories,
      tags,
      authors: page.authors || page._embedded?.author || []
    };
    
    // Add media properties
    if (featured_media_url) pageWithMedia.featured_media_url = featured_media_url;
    if (featured_media_alt) pageWithMedia.featured_media_alt = featured_media_alt;
    if (featured_media_width) pageWithMedia.featured_media_width = featured_media_width;
    if (featured_media_height) pageWithMedia.featured_media_height = featured_media_height;
    
    return pageWithMedia;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

// ===========================================
// TAGS AND EXCLUSIVE POSTS FUNCTIONS
// ===========================================

// Fetch all tags
export async function getTags(): Promise<WPTag[]> {
  try {
    console.log('🏷️ Fetching tags...');
    
    const res = await fetch(`${WORDPRESS_API_URL}/tags?per_page=100&orderby=count&order=desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch tags:', res.status, res.statusText);
      throw new Error(`Failed to fetch tags: ${res.status} ${res.statusText}`);
    }
    
    const tags = await res.json();
    console.log('✅ Tags fetched successfully:', tags.length);
    
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }));
  } catch (error) {
    console.error('💥 Error fetching tags:', error);
    return [];
  }
}

// Fetch posts by tag ID - KINI RETURN WPPostWithMedia[]
export async function getPostsByTag(tagId: number, perPage = 10): Promise<WPPostWithMedia[]> {
  try {
    console.log(`🏷️ Fetching posts for tag ${tagId}`);
    
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?tags=${tagId}&_embed=wp:featuredmedia,author&per_page=${perPage}&orderby=date&order=desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch posts by tag:', res.status, res.statusText);
      throw new Error(`Failed to fetch posts by tag: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log(`✅ Tag ${tagId} posts fetched:`, posts.length);
    
    // Process posts
    return posts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('💥 Error fetching posts by tag:', error);
    return [];
  }
}

// Fetch posts by tag slug
export async function getPostsByTagSlug(tagSlug: string, perPage = 10): Promise<WPPostWithMedia[]> {
  try {
    console.log(`🔍 Looking for tag with slug: "${tagSlug}"`);
    
    // First get tag ID from slug
    const tagsResponse = await fetch(`${WORDPRESS_API_URL}/tags?slug=${tagSlug}`);
    
    if (!tagsResponse.ok) {
      console.error('❌ Failed to fetch tag by slug:', tagsResponse.status, tagsResponse.statusText);
      return [];
    }
    
    const tags = await tagsResponse.json();
    
    if (tags.length === 0) {
      console.log(`⚠️ No tag found with slug: "${tagSlug}"`);
      return [];
    }
    
    const tagId = tags[0].id;
    console.log(`✅ Found tag: "${tags[0].name}" (ID: ${tagId})`);
    
    // Then get posts by tag ID
    return await getPostsByTag(tagId, perPage);
  } catch (error) {
    console.error('💥 Error fetching posts by tag slug:', error);
    return [];
  }
}

// Fetch exclusive posts (posts with tag "exclusive" or "exclusive-story")
export async function getExclusivePosts(perPage = 10): Promise<WPPostWithMedia[]> {
  try {
    console.log('🎯 Fetching exclusive posts...');
    
    // Try multiple possible tag slugs for exclusive posts
    const possibleTagSlugs = [
      'exclusive',
      'exclusive-story', 
      'exclusive-news',
      'the-sun-exclusive',
      'sun-exclusive'
    ];
    
    let exclusivePosts: WPPostWithMedia[] = [];
    
    // Try each tag slug until we find posts
    for (const tagSlug of possibleTagSlugs) {
      const posts = await getPostsByTagSlug(tagSlug, perPage);
      
      if (posts.length > 0) {
        console.log(`✅ Found ${posts.length} exclusive posts with tag: "${tagSlug}"`);
        exclusivePosts = posts;
        break;
      }
    }
    
    // If no posts found with specific tags, try searching in tag names
    if (exclusivePosts.length === 0) {
      console.log('🔍 No posts found with specific exclusive tags, searching all tags...');
      
      const allTags = await getTags();
      const exclusiveTags = allTags.filter(tag => 
        tag.name.toLowerCase().includes('exclusive') ||
        tag.slug.toLowerCase().includes('exclusive')
      );
      
      console.log(`📋 Found ${exclusiveTags.length} tags with "exclusive" in name/slug`);
      
      if (exclusiveTags.length > 0) {
        // Get posts from the first exclusive tag found
        const tagId = exclusiveTags[0].id;
        exclusivePosts = await getPostsByTag(tagId, perPage);
        console.log(`✅ Found ${exclusivePosts.length} posts from tag: "${exclusiveTags[0].name}"`);
      }
    }
    
    if (exclusivePosts.length === 0) {
      console.log('⚠️ No exclusive posts found');
    }
    
    return exclusivePosts;
  } catch (error) {
    console.error('💥 Error fetching exclusive posts:', error);
    return [];
  }
}

// Get latest exclusive post
export async function getLatestExclusivePost(): Promise<WPPostWithMedia | null> {
  try {
    console.log('🎯 Fetching latest exclusive post...');
    
    const exclusivePosts = await getExclusivePosts(1);
    
    if (exclusivePosts.length > 0) {
      const latestPost = exclusivePosts[0];
      console.log('✅ Latest exclusive post found:', {
        id: latestPost.id,
        title: latestPost.title.rendered,
        date: latestPost.date,
        tags: latestPost.tags
      });
      return latestPost;
    }
    
    console.log('⚠️ No exclusive posts found');
    return null;
  } catch (error) {
    console.error('💥 Error getting latest exclusive post:', error);
    return null;
  }
}

// Check if post has exclusive tag
export function hasExclusiveTag(post: WPPostWithMedia): boolean {
  if (!post.tags || post.tags.length === 0) return false;
  
  // If we have tag IDs, we need to check them
  // This function assumes tags are already numbers
  // For a proper check, we'd need to fetch tag details
  return post.tags.length > 0;
}

// Get posts with multiple tags - KINI RETURN WPPostWithMedia[]
export async function getPostsByMultipleTags(tagIds: number[], perPage = 10): Promise<WPPostWithMedia[]> {
  try {
    console.log(`🏷️ Fetching posts with tags: ${tagIds.join(', ')}`);
    
    const tagQuery = tagIds.map(id => `tags[]=${id}`).join('&');
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?${tagQuery}&_embed=wp:featuredmedia,author&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch posts by multiple tags:', res.status, res.statusText);
      throw new Error(`Failed to fetch posts by multiple tags: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log(`✅ Posts with multiple tags fetched:`, posts.length);
    
    // Process posts
    return posts.map((post: WPPost): WPPostWithMedia => {
      const categories = Array.isArray(post.categories) 
        ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
        : [];
      
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      let featured_media_width = undefined;
      let featured_media_height = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
        featured_media_width = media.media_details?.width;
        featured_media_height = media.media_details?.height;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      if (featured_media_width) postWithMedia.featured_media_width = featured_media_width;
      if (featured_media_height) postWithMedia.featured_media_height = featured_media_height;
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('💥 Error fetching posts by multiple tags:', error);
    return [];
  }
}

// Test API connection
export async function testWordPressAPI(): Promise<{success: boolean; message: string; data?: any}> {
  try {
    console.log('🧪 Testing API connection to:', WORDPRESS_API_URL);
    
    const res = await fetch(`${WORDPRESS_API_URL}/posts?per_page=1&_embed=wp:featuredmedia`);
    
    if (!res.ok) {
      return {
        success: false,
        message: `API Error: ${res.status} ${res.statusText}`
      };
    }
    
    const data = await res.json();
    return {
      success: true,
      message: `✅ API Connected! Found ${data.length} posts`,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Get popular posts berdasarkan view count (jika ada) - KINI RETURN WPPostWithMedia[]
export async function getPopularPosts(limit = 10): Promise<WPPostWithMedia[]> {
  try {
    return await getPosts(limit);
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return [];
  }
}

// Get trending posts (contoh implementation) - KINI RETURN WPPostWithMedia[]
export async function getTrendingPosts(limit = 10): Promise<WPPostWithMedia[]> {
  try {
    const allPosts = await getPosts(50);
    
    // Shuffle array untuk mendapatkan posts acak
    const shuffled = [...allPosts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return [];
  }
}

// Get tag by name
export async function getTagByName(tagName: string): Promise<WPTag | null> {
  try {
    const tags = await getTags();
    const tag = tags.find(t => 
      t.name.toLowerCase() === tagName.toLowerCase() ||
      t.slug.toLowerCase() === tagName.toLowerCase()
    );
    
    return tag || null;
  } catch (error) {
    console.error('Error getting tag by name:', error);
    return null;
  }
}

// Search tags by name
export async function searchTags(searchTerm: string): Promise<WPTag[]> {
  try {
    const tags = await getTags();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching tags:', error);
    return [];
  }
}

// Dalam lib/wordpress.ts - tambah function ini
export async function getTopStoriesWithCategories(): Promise<WPPostWithMedia[]> {
  try {
    console.log('📊 Fetching top stories with categories...');
    
    const res = await fetch('https://thesun.my/wp-json/thesun/v1/top-stories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch top stories:', res.status, res.statusText);
      throw new Error(`Failed to fetch top stories: ${res.status} ${res.statusText}`);
    }
    
    const posts: WPPost[] = await res.json();
    console.log('✅ Top stories fetched:', posts.length);
    
    // Fetch all categories untuk mapping
    const allCategories = await getCategories();
    
    // Process posts untuk konsistensi
    return posts.map((post: WPPost): WPPostWithMedia => {
      // Handle categories dengan betul
      let categories: number[] = [];
      
      if (Array.isArray(post.categories)) {
        categories = post.categories.map(cat => {
          if (typeof cat === 'number') {
            return cat;
          } else if (typeof cat === 'object' && cat !== null) {
            // Jika category object, cuba dapatkan ID
            const categoryObj = cat as any;
            return categoryObj.id || categoryObj.term_id || 0;
          }
          return 0;
        }).filter(id => id !== 0);
      }
      
      // Handle tags
      const tags = Array.isArray(post.tags)
        ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
        : [];
      
      // Extract media (optional - tak perlu untuk top stories)
      let featured_media_url = undefined;
      let featured_media_alt = undefined;
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        featured_media_url = media.source_url;
        featured_media_alt = media.alt_text || post.title.rendered;
      }
      
      // Create WPPostWithMedia object
      const postWithMedia: WPPostWithMedia = {
        ...post,
        categories,
        tags,
        authors: post.authors || post._embedded?.author || []
      };
      
      // Add media properties jika ada
      if (featured_media_url) postWithMedia.featured_media_url = featured_media_url;
      if (featured_media_alt) postWithMedia.featured_media_alt = featured_media_alt;
      
      // Debug info untuk setiap post
      if (process.env.NODE_ENV === 'development' && categories.length > 0) {
        const firstCategoryId = categories[0];
        const categoryInfo = allCategories.find(c => c.id === firstCategoryId);
        console.log(`Post ${post.id} category mapping:`, {
          postId: post.id,
          originalCategories: post.categories,
          mappedCategoryIds: categories,
          categoryName: categoryInfo?.name || 'Not found'
        });
      }
      
      return postWithMedia;
    });
  } catch (error) {
    console.error('💥 Error fetching top stories:', error);
    // Fallback ke posts biasa
    console.log('🔄 Using regular posts as fallback for top stories');
    return await getPosts(10);
  }
}
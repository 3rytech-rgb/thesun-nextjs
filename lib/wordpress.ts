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
    postWithMedia.featured_media_url = media.source_url || null;
    postWithMedia.featured_media_alt = media.alt_text || null;
    postWithMedia.featured_media_caption = media.caption?.rendered || null;
    postWithMedia.featured_media_width = media.media_details?.width || null;
    postWithMedia.featured_media_height = media.media_details?.height || null;
  }

  // Extract authors dari _embedded atau dari post.authors
  if (post._embedded?.author?.[0]) {
    postWithMedia.authors = [post._embedded.author[0]];
  }

  return postWithMedia;
}

// Function untuk fetch posts dengan parameter opsional
export async function getPosts(perPage = 20, page = 1): Promise<WPPostWithMedia[]> {
  try {
    console.log('🔗 Fetching posts:', {
      perPage,
      page,
      url: `${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia,author,wp:term&per_page=${perPage}&page=${page}`
    });
    
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?_embed=wp:featuredmedia,author,wp:term&per_page=${perPage}&page=${page}`, {
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

// Fetch single post by slug
export async function getPost(slug: string): Promise<WPPostWithMedia | null> {
  try {
    console.log('📄 Fetching post by slug:', slug);
    
    // Try multiple slug variations to handle different URL formats
    const slugVariations = [
      slug, // Original slug
      slug.replace(/-+/g, ' ').trim(), // Convert hyphens to spaces
      slug.replace(/[^\w\s-]/g, ''), // Remove special characters
      encodeURIComponent(slug), // URL encoded
    ];
    
    // Remove duplicates
    const filteredSlugs = slugVariations.filter(s => s && s.length > 0);
    const uniqueSlugs = Array.from(new Set(filteredSlugs));
    
    console.log('🔍 Trying slug variations:', uniqueSlugs);
    
    let post: WPPost | null = null;
    
    // Try each slug variation
    for (const slugVar of uniqueSlugs) {
      try {
        const res = await fetch(
          `${WORDPRESS_API_URL}/posts?slug=${slugVar}&_embed=wp:featuredmedia,author,wp:term`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const posts: WPPost[] = await res.json();
          
          if (posts.length > 0) {
            post = posts[0];
            console.log(`✅ Post found with slug variation: ${slugVar}`);
            console.log(`📝 Post title: ${post.title.rendered}`);
            console.log(`🔗 WordPress slug: ${post.slug}`);
            break;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`⚠️ Failed with slug variation ${slugVar}:`, errorMessage);
        continue;
      }
    }
    
    if (!post) {
      // Last attempt: search by title or try to get all posts and filter
      console.log('🔍 Last attempt: searching posts...');
      try {
        const res = await fetch(
          `${WORDPRESS_API_URL}/posts?search=${encodeURIComponent(slug.replace(/-/g, ' '))}&per_page=50&_embed=wp:featuredmedia,author,wp:term`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const posts: WPPost[] = await res.json();
          
          // Try to find post by matching slug or title
          const foundPost = posts.find(p => 
            p.slug.toLowerCase().includes(slug.toLowerCase().replace(/-/g, '')) ||
            p.title.rendered.toLowerCase().includes(slug.toLowerCase().replace(/-/g, ' '))
          );
          
          if (foundPost) {
            post = foundPost;
            console.log(`✅ Post found via search: ${post.title.rendered}`);
          }
        }
      } catch (error) {
        console.error('💥 Search failed:', error);
      }
    }
    
    if (!post) {
      console.log('❌ Post not found with any slug variation:', slug);
      return null;
    }
    
    // Process post untuk konsistensi
    const categories = Array.isArray(post.categories) 
      ? post.categories.map(cat => typeof cat === 'object' ? (cat as WPCategory).id : cat)
      : [];
    
    const tags = Array.isArray(post.tags)
      ? post.tags.map(tag => typeof tag === 'object' ? (tag as WPTag).id : tag)
      : [];
    
    // Extract media
    let featured_media_url: string | null = null;
    let featured_media_alt: string | null = null;
    let featured_media_caption: string | null = null;
    let featured_media_width: number | null = null;
    let featured_media_height: number | null = null;

    if (post._embedded?.['wp:featuredmedia']?.[0]) {
      const media = post._embedded['wp:featuredmedia'][0];
      featured_media_url = media.source_url || null;
      featured_media_alt = media.alt_text || post.title.rendered || null;
      featured_media_caption = media.caption?.rendered || null;
      featured_media_width = media.media_details?.width || null;
      featured_media_height = media.media_details?.height || null;
    }

    // Create WPPostWithMedia object
    const postWithMedia: WPPostWithMedia = {
      ...post,
      categories,
      tags,
      authors: post.authors || post._embedded?.author || []
    };

    // Add media properties only if they exist
    if (featured_media_url !== null) postWithMedia.featured_media_url = featured_media_url;
    if (featured_media_alt !== null) postWithMedia.featured_media_alt = featured_media_alt;
    if (featured_media_caption !== null) postWithMedia.featured_media_caption = featured_media_caption;
    if (featured_media_width !== null) postWithMedia.featured_media_width = featured_media_width;
    if (featured_media_height !== null) postWithMedia.featured_media_height = featured_media_height;
    
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

// Fetch posts by category ID
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

// Fetch posts by category dengan include children
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

// Fetch top stories dari custom API endpoint
export async function getTopStories(): Promise<WPPostWithMedia[]> {
  try {
    console.log('📊 Fetching top stories from custom API...');
    
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

// Fetch posts by search term
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

// Fetch posts by ppma_author ID
export async function getPostsByAuthor(authorId: number, perPage = 20): Promise<WPPostWithMedia[]> {
  try {
    // Use ppma_author_id query parameter for custom author field
    const res = await fetch(
      `${WORDPRESS_API_URL}/posts?ppma_author=${authorId}&_embed=wp:featuredmedia,author,wp:term&per_page=${perPage}`, {
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

// Fetch specific page by slug
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

// Fetch tags by IDs
export async function getTagsByIds(tagIds: number[]): Promise<WPTag[]> {
  try {
    if (!tagIds || tagIds.length === 0) return [];
    
    console.log(`🏷️ Fetching ${tagIds.length} tags by ID...`);
    
    const ids = tagIds.join(',');
    const res = await fetch(`${WORDPRESS_API_URL}/tags?include=${ids}&per_page=${tagIds.length}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('❌ Failed to fetch tags by IDs:', res.status, res.statusText);
      return [];
    }
    
    const tags = await res.json();
    console.log(`✅ Fetched ${tags.length} tags by ID`);
    
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }));
  } catch (error) {
    console.error('💥 Error fetching tags by IDs:', error);
    return [];
  }
}

// Fetch posts by tag ID
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

// Fetch exclusive posts
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

// Get posts with multiple tags
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

// Get popular posts
export async function getPopularPosts(limit = 10): Promise<WPPostWithMedia[]> {
  try {
    return await getPosts(limit);
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return [];
  }
}

// Get trending posts
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

// Get shortened category slug
export function getShortenedCategorySlug(categorySlug: string): string {
  if (!categorySlug) return 'news';
  
  // Convert to lowercase and trim
  const cleanSlug = categorySlug.toLowerCase().trim();
  
  // Common category mappings - SIMPLIFIED VERSION
  const slugMappings: Record<string, string> = {
    'berita-nasional': 'news',
    'berita-internasional': 'world',
    'sukan': 'sports',
    'hiburan': 'entertainment',
    'gaya-hidup': 'lifestyle',
    'teknologi': 'tech',
    'ekonomi': 'business',
    'politik': 'politics',
    'kesihatan': 'health',
    'pendidikan': 'education',
    'agama': 'religion',
    'travel': 'travel',
    'makanan': 'food',
    'fesyen': 'fashion',
    'otomotif': 'automotive',
    'jenayah': 'crime',
    'pendapat': 'opinion',
    'going-viral': 'going-viral',
    'sedang-viral': 'going-viral',
    'malaysia': 'malaysia-news',
    'malaysia-news': 'malaysia-news',
    'malaysia news': 'malaysia-news',
    // Handle "&" by replacing with "-" in the mapping
    'people & issues': 'people-issues',
    'food & beverage': 'food-beverage',
    'health & wellness': 'health-wellness',
    // Additional common categories
    'business': 'business',
    'finance': 'business',
    'economy': 'business',
    'local': 'news',
    'national': 'news',
    'international': 'world',
    'world': 'world',
    'entertainment': 'entertainment',
    'lifestyle': 'lifestyle',
    'sports': 'sports',
    'tech': 'tech',
    'technology': 'tech',
    'health': 'health',
    'education': 'education',
    'religion': 'religion',
    'food': 'food',
    'fashion': 'fashion',
    'automotive': 'automotive',
    'crime': 'crime',
    'opinion': 'opinion'
  };
  
  // Check if we have a mapping
  const mappedSlug = slugMappings[cleanSlug];
  if (mappedSlug) {
    return mappedSlug;
  }
  
  // If no mapping, clean the slug for URL use
  // Replace "&" with "-and-", spaces with "-", remove special chars
  return cleanSlug
    .replace(/&/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'news';
}

// Get original category slug from shortened slug
export function getOriginalCategorySlug(shortSlug: string): string {
  if (!shortSlug) return 'berita-nasional';
  
  const cleanShortSlug = shortSlug.toLowerCase().trim();
  
  // Reverse mapping - SIMPLIFIED VERSION
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
    'opinion': 'pendapat',
    'going-viral': 'going-viral',
    'malaysia-news': 'malaysia',
    'malaysia news': 'malaysia',
    // Handle "&" categories
    'people-issues': 'people & issues',
    'food-beverage': 'food & beverage',
    'health-wellness': 'health & wellness',
    // Additional mappings
    'finance': 'business',
    'economy': 'business',
    'local': 'news',
    'national': 'news',
    'international': 'world',
    'technology': 'tech'
  };
  
  // Check reverse mapping
  const originalSlug = reverseMappings[cleanShortSlug];
  if (originalSlug) {
    return originalSlug;
  }
  
  // If no mapping, return as-is (for categories that are already correct)
  return cleanShortSlug;
}

// Get category by ID
export async function getCategoryById(categoryId: number): Promise<WPCategory | null> {
  try {
    const categories = await getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    return category || null;
  } catch (error) {
    console.error('Error getting category by ID:', error);
    return null;
  }
}

// Get category hierarchy (parent -> child chain)
export async function getCategoryHierarchy(categoryId: number): Promise<WPCategory[]> {
  try {
    const categories = await getCategories();
    const hierarchy: WPCategory[] = [];
    
    let currentId: number | undefined = categoryId;
    
    // Traverse up the hierarchy
    while (currentId) {
      const category = categories.find(cat => cat.id === currentId);
      if (!category) break;
      
      // Add to beginning of array (so parent comes first)
      hierarchy.unshift(category);
      
      // Move to parent
      currentId = category.parent && category.parent > 0 ? category.parent : undefined;
    }
    
    return hierarchy;
  } catch (error) {
    console.error('Error getting category hierarchy:', error);
    return [];
  }
}

// Get all parent categories
export async function getParentCategories(): Promise<WPCategory[]> {
  try {
    const categories = await getCategories();
    return categories.filter(cat => !cat.parent || cat.parent === 0);
  } catch (error) {
    console.error('Error getting parent categories:', error);
    return [];
  }
}

// Get child categories for a parent
export async function getChildCategories(parentId: number): Promise<WPCategory[]> {
  try {
    const categories = await getCategories();
    return categories.filter(cat => cat.parent === parentId);
  } catch (error) {
    console.error('Error getting child categories:', error);
    return [];
  }
}

// Generate post URL with parent/child category hierarchy
export function generatePostUrl(post: WPPostWithMedia): string {
  if (!post) return '/';
  
  // Get category hierarchy
  let categoryPath = 'news'; // Default fallback
  
  if (post._embedded?.['wp:term']?.[0]) {
    const categoryTerms = post._embedded['wp:term'][0] as WPCategory[];
    
    // Find categories for this post
    const postCategoryIds = post.categories || [];
    const postCategories = categoryTerms.filter(cat => 
      postCategoryIds.includes(cat.id)
    );
    
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
  } else if (post.categories && post.categories.length > 0) {
    // Fallback to first category if no embedded terms
    categoryPath = 'news';
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

// Simple function to generate post URL from post object (for components)
export function getPostUrl(post: WPPostWithMedia | WPPost): string {
  if (!post) return '/';
  
  // Cast to WPPostWithMedia to access _embedded
  const postWithMedia = post as WPPostWithMedia;
  
  // Get category hierarchy
  let categoryPath = 'news'; // Default fallback
  
  if (postWithMedia._embedded?.['wp:term']?.[0]) {
    const categoryTerms = postWithMedia._embedded['wp:term'][0] as WPCategory[];
    
    // Find categories for this post
    const postCategoryIds = post.categories || [];
    const postCategories = categoryTerms.filter(cat => 
      postCategoryIds.includes(cat.id)
    );
    
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
  } else if (post.categories && post.categories.length > 0) {
    // Fallback to first category if no embedded terms
    categoryPath = 'news';
  }
  
  // Clean category path and post slug
  const cleanCategoryPath = cleanCategoryPathForUrl(categoryPath);
  const cleanPostSlug = post.slug
    .toLowerCase()
    .replace(/[^\w\-]/g, '')
    .trim();
  
  const url = `/${cleanCategoryPath}/${cleanPostSlug}`;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 getPostUrl generated:', {
      postId: post.id,
      postSlug: post.slug,
      categoryPath,
      cleanCategoryPath,
      cleanPostSlug,
      finalUrl: url,
      hasEmbedded: !!postWithMedia._embedded,
      categories: post.categories
    });
  }
  
  return url;
}

// Fetch top stories with categories
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

// ================================================
// FUNGSI BARU UNTUK AUTHOR BY SLUG
// ================================================

// Dalam lib/wordpress.ts - PERBAIKAN FUNGSI getAuthorBySlug
export async function getAuthorBySlug(slug: string): Promise<WPAuthor | null> {
  try {
    console.log(`🔍 Mencari author dengan slug: "${slug}"`);
    
    // PERUBAHAN: Guna endpoint users dengan parameter slug
    const url = `${WORDPRESS_API_URL}/users?slug=${slug}`;
    console.log(`📡 API URL: ${url}`);
    
    const res = await fetch(url, { 
      next: { revalidate: 300 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      console.error(`❌ API Response: ${res.status} ${res.statusText}`);
      return null;
    }

    const users = await res.json();
    console.log(`📊 Users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log(`⚠️ Tiada author ditemukan dengan slug: "${slug}"`);
      
      // Fallback: Cuba cari melalui posts
      console.log('🔄 Mencari author melalui posts...');
      return await getAuthorBySlugFallback(slug);
    }

    const user = users[0];
    console.log(`✅ Author ditemukan: ${user.name} (ID: ${user.id})`);
    
    // Format response mengikut interface WPAuthor
    const author: WPAuthor = {
      term_id: user.id || 0,
      user_id: user.id || 0,
      is_guest: 0,
      slug: user.slug || slug,
      job_title: user.description || '', // WordPress users biasanya ada description
      display_name: user.name || '',
      avatar_url: {
        url: user.avatar_urls?.['96'] || '/default-avatar.png',
        url2x: user.avatar_urls?.['192'] || '/default-avatar.png'
      },
      author_category: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      description: user.description || user.bio || ''
    };

    return author;
  } catch (err) {
    console.error('💥 Error getAuthorBySlug:', err);
    return null;
  }
}

// Fallback function jika user tidak ditemukan
async function getAuthorBySlugFallback(slug: string): Promise<WPAuthor | null> {
  try {
    console.log(`🔍 Fallback: Mencari author melalui posts dengan slug: "${slug}"`);
    
    const url = `${WORDPRESS_API_URL}/posts?author_slug=${slug}&per_page=1&_embed=author`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      console.error(`❌ Fallback API Response: ${res.status} ${res.statusText}`);
      return null;
    }

    const posts = await res.json();
    
    if (posts.length === 0 || !posts[0]._embedded?.author?.[0]) {
      console.log(`⚠️ Tiada author ditemukan melalui fallback dengan slug: "${slug}"`);
      return null;
    }

    const rawAuthor = posts[0]._embedded.author[0];
    console.log(`✅ Author ditemukan melalui fallback: ${rawAuthor.name}`);
    
    return {
      term_id: rawAuthor.id || rawAuthor.term_id || 0,
      user_id: rawAuthor.user_id || 0,
      is_guest: rawAuthor.is_guest || 0,
      slug: rawAuthor.slug || slug,
      job_title: rawAuthor.job_title || '',
      display_name: rawAuthor.name || rawAuthor.display_name || 'Penulis',
      avatar_url: {
        url: rawAuthor.avatar_urls?.['96'] || rawAuthor.avatar_url?.url || '/default-avatar.png',
        url2x: rawAuthor.avatar_urls?.['192'] || rawAuthor.avatar_url?.url2x || ''
      },
      author_category: rawAuthor.author_category || '',
      first_name: rawAuthor.first_name || '',
      last_name: rawAuthor.last_name || '',
      description: rawAuthor.description || rawAuthor.bio || ''
    };
  } catch (err) {
    console.error('💥 Error getAuthorBySlugFallback:', err);
    return null;
  }
}
// Dalam lib/wordpress.ts - TAMBAH FUNGSI INI
export async function getPostsByAuthorSlug(
  authorSlug: string,
  perPage: number = 12,
  page: number = 1
): Promise<WPPostWithMedia[]> {
  try {
    console.log(`📝 Fetching posts by author slug: "${authorSlug}"`);
    
    // First try to get author by slug
    const author = await getAuthorBySlug(authorSlug);
    if (!author?.term_id) {
      console.log(`⚠️ No author found with slug: "${authorSlug}"`);
      return [];
    }

    console.log(`✅ Author found: ${author.display_name} (ID: ${author.term_id})`);
    
    // Now get posts by author ID
    const posts = await getPostsByAuthor(author.term_id, perPage);
    console.log(`✅ Found ${posts.length} posts for author "${authorSlug}"`);
    
    return posts;
  } catch (err) {
    console.error('💥 Error getPostsByAuthorSlug:', err);
    return [];
  }
}

// Fetch all authors with post counts - FROM POSTS DATA
export async function getAllAuthors(): Promise<WPAuthor[]> {
  try {
    console.log('📊 Fetching authors from posts data...');
    
    const authors = new Map<string, { author: WPAuthor; postCount: number }>();
    let page = 1;
    const perPage = 50;
    let hasMore = true;
    
    // Fetch multiple pages of posts to get all authors
    while (hasMore && page <= 10) { // Max 10 pages (500 posts)
      try {
        console.log(`📄 Fetching posts page ${page}...`);
        
         const postsRes = await fetch(
           `https://thesun.my/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}`,
           {
             method: 'GET',
             headers: { 'Content-Type': 'application/json' },
             next: { revalidate: 3600 }
           }
         );
        
        if (!postsRes.ok) {
          console.error(`❌ Failed to fetch posts page ${page}:`, postsRes.status, postsRes.statusText);
          break;
        }
        
        const posts = await postsRes.json();
        
        if (posts.length === 0) {
          hasMore = false;
          break;
        }
        
        // Process each post to extract author data
        posts.forEach((post: any) => {
          // Debug: log post structure
          if (page === 1 && posts.indexOf(post) === 0) {
            console.log('📋 First post structure:', {
              hasAuthors: !!post.authors,
              authorsCount: post.authors?.length,
              authors: post.authors,
              hasEmbeddedAuthor: !!post._embedded?.author,
              ppmaAuthor: post.ppma_author
            });
          }
          
          // Try to get authors from post.authors field (PublishPress Authors)
          if (post.authors && Array.isArray(post.authors) && post.authors.length > 0) {
            console.log(`📝 Processing ${post.authors.length} authors from post.authors field`);
            post.authors.forEach((rawAuthor: any) => {
              const authorSlug = rawAuthor.slug || 
                                rawAuthor.display_name?.toLowerCase().replace(/\s+/g, '-') || 
                                `author-${rawAuthor.term_id}`;
              
              if (!authorSlug) return;
              
              // Create or update author
              const existing = authors.get(authorSlug);
              const postCount = (existing?.postCount || 0) + 1;
              
              const author: WPAuthor = {
                term_id: rawAuthor.term_id || 0,
                user_id: rawAuthor.user_id || 0,
                is_guest: rawAuthor.is_guest || 0,
                slug: authorSlug,
                job_title: rawAuthor.job_title || '',
                display_name: rawAuthor.display_name || 'Penulis',
                avatar_url: {
                  url: rawAuthor.avatar_url?.url || '',
                  url2x: rawAuthor.avatar_url?.url2x || ''
                },
                author_category: rawAuthor.author_category || '',
                first_name: rawAuthor.first_name || '',
                last_name: rawAuthor.last_name || '',
                description: rawAuthor.description || ''
              };
              
              authors.set(authorSlug, { author, postCount });
            });
          }
          // Fallback to embedded author data
          else if (post._embedded?.author?.[0]) {
            const rawAuthor = post._embedded.author[0];
            const authorSlug = rawAuthor.slug || 
                              rawAuthor.name?.toLowerCase().replace(/\s+/g, '-') || 
                              `author-${rawAuthor.id || rawAuthor.term_id}`;
            
            if (!authorSlug) return;
            
            // Create or update author
            const existing = authors.get(authorSlug);
            const postCount = (existing?.postCount || 0) + 1;
            
            const author: WPAuthor = {
              term_id: rawAuthor.id || rawAuthor.term_id || 0,
              user_id: rawAuthor.user_id || 0,
              is_guest: rawAuthor.is_guest || 0,
              slug: authorSlug,
              job_title: rawAuthor.job_title || '',
              display_name: rawAuthor.name || rawAuthor.display_name || 'Penulis',
              avatar_url: {
                url: rawAuthor.avatar_urls?.['96'] || rawAuthor.avatar_url?.url || '',
                url2x: rawAuthor.avatar_urls?.['192'] || rawAuthor.avatar_url?.url2x || ''
              },
              author_category: rawAuthor.author_category || '',
              first_name: rawAuthor.first_name || '',
              last_name: rawAuthor.last_name || '',
              description: rawAuthor.description || ''
            };
            
            authors.set(authorSlug, { author, postCount });
          }
          
          // Also check ppma_author field
          if (post.ppma_author && Array.isArray(post.ppma_author) && post.ppma_author.length > 0) {
            post.ppma_author.forEach((ppmaId: number) => {
              const authorSlug = `ppma-${ppmaId}`;
              const existing = authors.get(authorSlug);
              const postCount = (existing?.postCount || 0) + 1;
              
              // For ppma authors, we need to fetch details separately
              // For now, create basic author entry
              if (!existing) {
                const author: WPAuthor = {
                  term_id: ppmaId,
                  user_id: ppmaId,
                  is_guest: 1,
                  slug: authorSlug,
                  job_title: '',
                  display_name: `Author ${ppmaId}`,
                  avatar_url: { url: '', url2x: '' },
                  author_category: '',
                  first_name: '',
                  last_name: '',
                  description: ''
                };
                
                authors.set(authorSlug, { author, postCount });
              } else {
                authors.set(authorSlug, { ...existing, postCount });
              }
            });
          }
        });
        
        console.log(`✅ Page ${page}: Processed ${posts.length} posts, found ${authors.size} authors so far`);
        
        // Check if there are more pages
        const totalPages = postsRes.headers.get('X-WP-TotalPages');
        if (totalPages && parseInt(totalPages) <= page) {
          hasMore = false;
        }
        
        page++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error fetching posts page ${page}:`, error);
        hasMore = false;
      }
    }
    
    // Convert to array and filter out admin-like authors
    const authorsArray = Array.from(authors.values())
      .map(item => item.author)
      .filter(author => {
        // Filter out admin-like authors
        const slug = author.slug.toLowerCase();
        const name = author.display_name.toLowerCase();
        
        const isAdminLike = 
          slug.includes('admin') ||
          name.includes('admin') ||
          slug.includes('web') ||
          slug.includes('dev') ||
          slug.includes('sys') ||
          slug.includes('tech') ||
          slug.includes('test') ||
          author.display_name === 'Penulis' || // Default name
          author.display_name === 'Author';
        
        return !isAdminLike;
      });
    
    console.log(`📊 Total authors from posts: ${authorsArray.length}`);
    
    return authorsArray;
  } catch (error) {
    console.error('💥 Error fetching authors from posts:', error);
    return [];
  }
}

// Get author post count - optimized for authors from posts
export async function getAuthorPostCount(authorId: number, authorSlug?: string): Promise<number> {
  try {
    // Try multiple methods to get post count
    const methods = [
      // Method 1: Try ppma_author parameter (most common for The Sun)
      async () => {
        const res = await fetch(
          `https://thesun.my/wp-json/wp/v2/posts?ppma_author=${authorId}&per_page=1`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 }
          }
        );
        
        if (res.ok) {
          const total = res.headers.get('X-WP-Total');
          if (total) {
            const count = parseInt(total);
            if (count > 0) {
              console.log(`✅ Author ${authorId} has ${count} posts (ppma_author)`);
              return count;
            }
          }
        }
        return 0;
      },
      
      // Method 2: Try regular author parameter
      async () => {
        const res = await fetch(
          `https://thesun.my/wp-json/wp/v2/posts?author=${authorId}&per_page=1`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 }
          }
        );
        
        if (res.ok) {
          const total = res.headers.get('X-WP-Total');
          if (total) {
            const count = parseInt(total);
            if (count > 0) {
              console.log(`✅ Author ${authorId} has ${count} posts (author)`);
              return count;
            }
          }
        }
        return 0;
      },
      
      // Method 3: Try author_slug parameter
      async () => {
        if (!authorSlug) return 0;
        
        const res = await fetch(
          `https://thesun.my/wp-json/wp/v2/posts?author_slug=${authorSlug}&per_page=1`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 }
          }
        );
        
        if (res.ok) {
          const total = res.headers.get('X-WP-Total');
          if (total) {
            const count = parseInt(total);
            if (count > 0) {
              console.log(`✅ Author ${authorSlug} has ${count} posts (author_slug)`);
              return count;
            }
          }
        }
        return 0;
      }
    ];
    
    // Try each method with timeout
    for (const method of methods) {
      try {
        const count = await Promise.race([
          method(),
          new Promise<number>(resolve => setTimeout(() => resolve(0), 2000)) // 2 second timeout
        ]);
        
        if (count > 0) {
          return count;
        }
      } catch (error) {
        // Continue to next method
        continue;
      }
    }
    
    return 0;
  } catch (error) {
    console.error(`💥 Error getting post count for author ${authorId}:`, error);
    return 0;
  }
}
// utils/mediaHelper.ts
import { WPPost, WPPostWithMedia } from '@/types/wordpress';

export async function fetchFeaturedMedia(postId: number): Promise<{
  url: string;
  alt: string;
  width: number;
  height: number;
} | null> {
  try {
    const response = await fetch(
      `https://thesun.my/wp-json/wp/v2/media/${postId}`
    );
    
    if (!response.ok) return null;
    
    const media = await response.json();
    
    return {
      url: media.source_url,
      alt: media.alt_text || '',
      width: media.media_details?.width || 1200,
      height: media.media_details?.height || 675,
    };
  } catch (error) {
    console.error('Error fetching media:', error);
    return null;
  }
}

export function extractFeaturedMedia(post: WPPost): WPPostWithMedia {
  const postWithMedia: WPPostWithMedia = { ...post };
  
  // Jika ada _embedded featured media
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    const media = post._embedded['wp:featuredmedia'][0];
    postWithMedia.featured_media_url = media.source_url;
    postWithMedia.featured_media_alt = media.alt_text || '';
    postWithMedia.featured_media_width = media.media_details?.width;
    postWithMedia.featured_media_height = media.media_details?.height;
  }
  
  return postWithMedia;
}
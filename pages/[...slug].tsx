// pages/[...slug].tsx - UPDATED WITH PARENT/CHILD CATEGORY URL STRUCTURE
// Supports: /{parent-category}/{child-category}/{post-slug}
// Also supports: /{category}/{post-slug} for backward compatibility
import { GetStaticProps, GetStaticPaths } from 'next';
import {
  getPosts,
  getPost,
  getPostsByCategory,
  getCategories,
  getTags,
  getTagsByIds,
  getAuthorBySlug,
  getCategoryById,
  getCategoryHierarchy,
  generatePostUrl,
  getOriginalCategorySlug,
  getShortenedCategorySlug
} from '@/lib/wordpress';
import { cleanSlug, cleanCategorySlug } from '@/utils/slugCleaner';
import {
  WPPost,
  WPPostWithMedia,
  WPCategory,
  WPAuthor,
  WPTag
} from '@/types/wordpress';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/common/Breadcrumb';
import NetworkImage from '@/components/common/NetworkImage';
import { AdWidget } from '@/components/ads/AdWidget';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface PostProps {
  post: WPPostWithMedia;
  latestPosts: WPPostWithMedia[];
  categories: WPCategory[];
  allTags: WPTag[];
  initialMorePosts: WPPostWithMedia[];
  authorSlug?: string; // TAMBAH INI
  currentCategory: WPCategory; // TAMBAH INI
}

// Helper function untuk format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  // Format hari, tarikh dan time
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  // Format time ago
  let timeAgo = '';
  if (diffDays > 0) {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
  
  return `${dayName}, ${day} ${month} ${year}, ${timeAgo}`;
}

// Helper function untuk format time only (untuk latest stories dan more stories)
function formatTimeOnly(dateString: string): string {
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

// Helper function untuk extract author
function getAuthor(post: WPPostWithMedia): WPAuthor | string {
  if (post.authors && post.authors.length > 0) {
    return post.authors[0];
  }

  if (post._embedded?.author?.[0]) {
    return {
      term_id: post._embedded.author[0].id || post._embedded.author[0].term_id || 0,
      user_id: post._embedded.author[0].user_id || 0,
      is_guest: post._embedded.author[0].is_guest || 0,
      slug: post._embedded.author[0].slug || '',
      job_title: post._embedded.author[0].job_title || '',
      display_name: post._embedded.author[0].name || post._embedded.author[0].display_name || 'Penulis',
      avatar_url: {
        url: post._embedded.author[0].avatar_urls?.['96'] || post._embedded.author[0].avatar_url?.url || '/default-avatar.png',
        url2x: post._embedded.author[0].avatar_urls?.['2*96'] || post._embedded.author[0].avatar_url?.url2x || ''
      },
      author_category: post._embedded.author[0].author_category || '',
      first_name: post._embedded.author[0].first_name || '',
      last_name: post._embedded.author[0].last_name || '',
      description: post._embedded.author[0].description || post._embedded.author[0].bio || ''
    };
  }

  return 'The Sun Webdesk';
}

// Helper function untuk dapatkan author slug
function getAuthorSlug(post: WPPostWithMedia): string | null {
  const author = getAuthor(post);

  if (typeof author === 'string') {
    return 'the-sun-webdesk'; // Default slug untuk webdesk
  }

  return author.slug || null;
}

// Decode HTML entities and special characters from content with multiple passes
function cleanHtmlContent(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let result = html;

  // Multiple passes to handle nested/double-encoded entities
  for (let pass = 0; pass < 3; pass++) {
    result = result
      // Step 1: Decode numeric HTML entities (decimal and hexadecimal)
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = parseInt(dec, 10);
        return code >= 0 && code <= 0x10FFFF ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        return code >= 0 && code <= 0x10FFFF ? String.fromCharCode(code) : '';
      })

      // Step 2: Decode essential named entities (in correct order)
      .replace(/&amp;/g, '&')
      .replace(/&#038;/g, '&')  // Alternative ampersand
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')

      // Step 3: Decode all quote and apostrophe variants
      .replace(/&#39;/g, "'")    // Decimal apostrophe
      .replace(/&#x27;/g, "'")   // Hex apostrophe
      .replace(/&apos;/g, "'")   // Named apostrophe
      .replace(/&#8216;/g, "'")  // Left single quotation mark
      .replace(/&#8217;/g, "'")  // Right single quotation mark
      .replace(/&#8220;/g, '"')  // Left double quotation mark
      .replace(/&#8221;/g, '"')  // Right double quotation mark

      // Step 4: Decode whitespace and special characters
      .replace(/&nbsp;/g, ' ')
      .replace(/&#160;/g, ' ')   // Non-breaking space
      .replace(/&#8211;/g, '–')  // En dash
      .replace(/&#8212;/g, '—')  // Em dash
      .replace(/&#8230;/g, '…')  // Horizontal ellipsis

      // Step 5: Remove any remaining unhandled named entities
      .replace(/&[a-zA-Z][a-zA-Z0-9]*;?/g, '');
  }

  // Final cleanup
  return result.trim();
}

// Strip HTML tags and decode entities for plain text content
function cleanTextContent(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Remove HTML tags first, then decode entities
  return cleanHtmlContent(text.replace(/<[^>]*>/g, ''));
}

// Component untuk Author Section dengan Link
const AuthorSection = ({ post }: { post: WPPostWithMedia }) => {
  const author = getAuthor(post);
  const authorSlug = getAuthorSlug(post);

  // Check if author should be hidden
  const shouldHideAuthor = () => {
    if (typeof author === 'string') {
      return false; // The Sun Webdesk should not be hidden
    }
    
    const displayName = cleanTextContent(author.display_name);
    const hideAuthors = ['AFP', 'Reuters', 'Bernama'];
    
    return hideAuthors.some(hiddenAuthor => 
      displayName.toLowerCase().includes(hiddenAuthor.toLowerCase()) ||
      hiddenAuthor.toLowerCase().includes(displayName.toLowerCase())
    );
  };

  if (shouldHideAuthor()) {
    return null; // Return nothing to hide the author section
  }

  if (typeof author === 'string') {
    return (
      <div className="flex items-center">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-4 border-2 border-white shadow-lg">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900">The Sun Webdesk</span>
            <p className="text-base text-gray-600">Editorial Team</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = cleanTextContent(author.display_name);
  const avatar = author.avatar_url?.url || '/default-avatar.png';

  return (
    <div className="flex items-center">
      {authorSlug ? (
        <Link
          href={`/author/${authorSlug}`}
          className="flex items-center hover:opacity-80 transition-opacity group"
        >
          <NetworkImage
            src={avatar}
            alt={displayName}
            width={56}
            height={56}
            className="rounded-full mr-4 border-2 border-white shadow-lg group-hover:border-red-300 transition-colors"
          />
          <div>
            <p className="font-bold text-xl text-gray-900 group-hover:text-red-600 transition-colors">
              {displayName}
            </p>
            {author.job_title && (
              <p className="text-base text-gray-600">{author.job_title}</p>
            )}
          </div>
          <svg
            className="w-5 h-5 ml-3 text-gray-400 group-hover:text-red-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      ) : (
        <div className="flex items-center">
          <NetworkImage
            src={avatar}
            alt={displayName}
            width={56}
            height={56}
            className="rounded-full mr-4 border-2 border-white shadow-lg"
          />
          <div>
            <p className="font-bold text-xl text-gray-900">{displayName}</p>
            {author.job_title && (
              <p className="text-base text-gray-600">{author.job_title}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component untuk Latest Stories
const LatestStories = ({ posts }: { posts: WPPostWithMedia[] }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
        Latest Stories
      </h2>
      <div className="space-y-6">
        {posts.slice(0, 5).map((post, index) => {
          return (
            <div key={post.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex-shrink-0 w-24 h-20">
                {post.featured_media_url ? (
                  <NetworkImage
                    src={post.featured_media_url}
                    alt={post.featured_media_alt || cleanTextContent(post.title.rendered)}
                    width={96}
                    height={80}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 hover:text-red-600 transition-colors">
                   <Link href={generatePostUrl(post)}>
                    {cleanTextContent(post.title.rendered)}
                  </Link>
                </h3>

                <div className="flex items-center text-xs text-gray-500">
                  <span>{formatTimeOnly(post.date)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Component untuk Popular Categories
const PopularCategories = ({ categories }: { categories: WPCategory[] }) => {
  const popularCategories = categories.filter(cat =>
    ['News', 'Going Viral', 'Lifestyle', 'Sports', 'Business', 'Berita']
      .includes(cat.name)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
        Popular Categories
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {popularCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-red-50 hover:to-red-100 transition-all duration-300 border border-blue-200 hover:border-red-300"
          >
            <span className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
              {cleanTextContent(category.name)}
            </span>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-red-500 transform group-hover:translate-x-1 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Component untuk More Stories
const MoreStoriesSection = ({
  initialPosts,
  currentPostId
}: {
  initialPosts: WPPostWithMedia[],
  currentPostId: number
}) => {
  const [posts, setPosts] = useState<WPPostWithMedia[]>(initialPosts.filter(p => p.id !== currentPostId).slice(0, 8));
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);

  const loadMore = async () => {
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const nextPosts = initialPosts
        .filter(p => p.id !== currentPostId)
        .slice(visibleCount, visibleCount + 8);

      setPosts(prev => [...prev, ...nextPosts]);
      setVisibleCount(prev => prev + 8);

      if (visibleCount + 8 >= initialPosts.filter(p => p.id !== currentPostId).length) {
        setAllPostsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasMore = visibleCount < initialPosts.filter(p => p.id !== currentPostId).length;

  return (
    <div className="w-full py-12 bg-gray-50 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">More Stories You Might Like</h2>
            <p className="text-gray-600">Discover more articles from our collection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => {
            return (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full">
                {post.featured_media_url && (
                  <div className="w-full h-48 relative">
                    <NetworkImage
                      src={post.featured_media_url}
                      alt={post.featured_media_alt || cleanTextContent(post.title.rendered)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight hover:text-red-600 transition-colors line-clamp-2">
                    <Link href={generatePostUrl(post)}>
                      {cleanTextContent(post.title.rendered)}
                    </Link>
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{formatTimeOnly(post.date)}</span>
                  </div>

                  {post.excerpt?.rendered && (
                    <div
                      className="text-gray-600 text-base leading-relaxed line-clamp-3 content-font"
                      dangerouslySetInnerHTML={{
                        __html: cleanHtmlContent(
                          post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                        )
                      }}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && !allPostsLoaded && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full max-w-[300px] mx-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More Articles</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {allPostsLoaded && (
          <div className="text-center mt-12 pt-6 border-t border-gray-300">
            <p className="text-gray-600">You've reached the end of the articles</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Social Share Component
const SocialShare = ({ title, post }: { title: string, post: WPPostWithMedia }) => {
  const articlePath = generatePostUrl(post);
  const articleUrl = `https://thesun.my${articlePath}`;

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(articleUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: `https://www.instagram.com/thesun.my/`,
    twitter: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=theSundaily`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=Check%20out%20this%20article:%20${encodedUrl}`
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-600 font-medium">Share:</span>
      <div className="flex items-center gap-2">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        <a
          href={shareLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-colors"
          aria-label="Follow on Instagram"
          title="Follow on Instagram"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
          </svg>
        </a>

        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors"
          aria-label="Share on X"
          title="Share on X"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>

        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.436 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
          </svg>
        </a>

        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          aria-label="Share on Telegram"
          title="Share on Telegram"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>

        <a
          href={shareLinks.email}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
          aria-label="Share via Email"
          title="Share via Email"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

// Component untuk Tags dengan nama sebenar
const PostTags = ({ tags, allTags }: { tags: number[], allTags: WPTag[] }) => {
  const tagsToHide = ['pin', 'exclusive', 'top stories', 'topstories', 'top-stories'];

  // Filter tags - show all except hidden ones
  const postTags = allTags.filter(tag => {
    // Check if tag is in the post's tag list
    if (!tags.includes(tag.id)) return false;
    
    // Check if tag should be hidden
    const shouldHide = tagsToHide.some(hiddenTag =>
      tag.name.toLowerCase() === hiddenTag.toLowerCase() ||
      tag.slug.toLowerCase() === hiddenTag.toLowerCase()
    );
    
    return !shouldHide;
  });

  if (postTags.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">Tags</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {postTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="group relative inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-orange-50 border-2 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 hover:shadow-md"
          >
            <span>{cleanTextContent(tag.name)}</span>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default function Post({
  post,
  latestPosts,
  categories,
  allTags,
  initialMorePosts,
  currentCategory
}: PostProps) {
  const [content, setContent] = useState('');
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  
  const articlePath = generatePostUrl(post);
  const articleUrl = `https://thesun.my${articlePath}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (post.content.rendered) {
      // First clean HTML entities, then process HTML tags
      let processedContent = cleanHtmlContent(post.content.rendered);

      processedContent = processedContent.replace(
        /<img/g,
        '<img class="max-w-[800px] w-full h-auto rounded-lg shadow-md my-6 mx-auto"'
      );
      
      // Add styling for image captions (figcaption elements)
      processedContent = processedContent.replace(
        /<figcaption>/g,
        '<figcaption class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">'
      );
      
      // Also handle common caption patterns like div with class wp-caption-text
      processedContent = processedContent.replace(
        /<div class="wp-caption-text">/g,
        '<div class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">'
      );
      
      // Handle p tags that might contain captions
      processedContent = processedContent.replace(
        /<p class="wp-caption-text">/g,
        '<p class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">'
      );
      
      // Add space after image caption (one line break)
      processedContent = processedContent.replace(
        /<\/figcaption>/g,
        '</figcaption><div class="mb-8"></div>'
      );
      
      // Add space after wp-caption-text div
      processedContent = processedContent.replace(
        /<div class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">(.*?)<\/div>/g,
        '<div class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">$1</div><div class="mb-8"></div>'
      );
      
      // Add space after wp-caption-text p
      processedContent = processedContent.replace(
        /<p class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">(.*?)<\/p>/g,
        '<p class="text-center text-sm text-gray-500 mt-2 italic max-w-4xl mx-auto content-font">$1</p><div class="mb-8"></div>'
      );

      processedContent = processedContent.replace(
        /<p>/g,
        '<p class="text-gray-700 leading-relaxed mb-6 text-xl max-w-4xl mx-auto content-font">'
      );

      processedContent = processedContent.replace(
        /<h1>/g,
        '<h1 class="text-4xl font-bold text-gray-900 mt-10 mb-6 max-w-4xl mx-auto">'
      );
      processedContent = processedContent.replace(
        /<h2>/g,
        '<h2 class="text-4xl font-bold text-gray-900 mt-10 mb-6 max-w-4xl mx-auto">'
      );
      processedContent = processedContent.replace(
        /<h3>/g,
        '<h3 class="text-2xl font-bold text-gray-900 mt-6 mb-3 max-w-4xl mx-auto">'
      );

      processedContent = processedContent.replace(
        /<ul>/g,
        '<ul class="list-disc list-inside mb-6 text-gray-700 text-xl max-w-4xl mx-auto content-font">'
      );
      processedContent = processedContent.replace(
        /<ol>/g,
        '<ol class="list-decimal list-inside mb-6 text-gray-700 text-xl max-w-4xl mx-auto content-font">'
      );

      processedContent = processedContent.replace(
        /<blockquote>/g,
        '<blockquote class="border-l-4 border-red-500 pl-4 italic text-gray-600 my-6 text-xl max-w-4xl mx-auto content-font">'
      );

      // Check if author is AFP, Reuters, or Bernama and add suffix to content
      const author = getAuthor(post);
      if (typeof author !== 'string') {
        const displayName = cleanTextContent(author.display_name);
        const hideAuthors = ['AFP', 'Reuters', 'Bernama'];
        
        // Find which hidden author matches
        const matchedHiddenAuthor = hideAuthors.find(hiddenAuthor => 
          displayName.toLowerCase().includes(hiddenAuthor.toLowerCase()) ||
          hiddenAuthor.toLowerCase().includes(displayName.toLowerCase())
        );
        
        if (matchedHiddenAuthor) {
          // Debug log untuk melihat author details
          console.log('🔍 Hidden author detected:', {
            displayName,
            rawDisplayName: author.display_name,
            hideAuthors,
            matchedHiddenAuthor,
            authorSuffix: `-${matchedHiddenAuthor}`
          });
          
          // Add author suffix at the end of the content
          // Use the matched hidden author name (AFP, Reuters, or Bernama) not the full displayName
          const authorSuffix = `-${matchedHiddenAuthor}`;
          
          // Find the last closing </p> tag and add suffix before it
          // If there are multiple paragraphs, add to the last one
          const lastParagraphIndex = processedContent.lastIndexOf('</p>');
          if (lastParagraphIndex !== -1) {
            // Insert suffix before the closing </p> tag
            processedContent = processedContent.substring(0, lastParagraphIndex) + 
                              authorSuffix + 
                              processedContent.substring(lastParagraphIndex);
          } else {
            // If no </p> tag found, append suffix at the end
            processedContent += `<p class="text-gray-700 leading-relaxed mb-6 text-xl max-w-4xl mx-auto content-font">${authorSuffix}</p>`;
          }
        }
      }

      setContent(processedContent);
    }
  }, [post.content.rendered]);

  const cleanTitle = cleanTextContent(post.title.rendered);

  return (
    <Layout 
      categories={categories}
      title={`${cleanTitle} | The Sun Malaysia`}
      description={cleanTextContent(post.excerpt.rendered) || 'Read this article on The Sun Malaysia'}
    >
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
                 <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                   <div className="p-8 max-w-4xl mx-auto">
                     {/* 1. Category Tags */}
                     {post.categories && post.categories.length > 0 && (
                       <div className="mb-4">
                         <div className="flex flex-wrap gap-2">
                           {post.categories.map((categoryId: number, index: number) => {
                             const category = categories.find(cat => cat.id === categoryId);
                             return (
                               <Link
                                 key={index}
                                 href={`/category/${category?.slug || 'news'}`}
                                 className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-lg px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                               >
                                 {category ? cleanTextContent(category.name) : 'Uncategorized'}
                               </Link>
                             );
                           })}
                         </div>
                       </div>
                     )}
                     
                     {/* 2. Title - Selepas category */}
                     <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                       {cleanTitle}
                     </h1>
                   </div>

                {/* 2. Featured Image - Selepas title */}
                {post.featured_media_url && (
                  <div className="w-full max-w-[1200px] mx-auto px-8 pb-8">
                    <NetworkImage
                      src={post.featured_media_url}
                      alt={post.featured_media_alt || cleanTitle}
                      width={1200}
                      height={post.featured_media_height || 675}
                      className="w-full h-auto max-h-[600px] object-contain mx-auto rounded-lg shadow-lg"
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    {/* Image Caption */}
                    {post.featured_media_caption && (
                      <div 
                        className="text-center text-sm text-gray-500 mt-2 italic"
                        dangerouslySetInnerHTML={{ __html: post.featured_media_caption }}
                      />
                    )}
                  </div>
                )}

                <div className="p-8 max-w-4xl mx-auto">
                    {/* 3. Author + Date + Share Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                      {/* Author on the left */}
                      <div className="flex-1">
                        <AuthorSection post={post} />
                      </div>
                      
                      {/* Date and Share on the right */}
                      <div className="flex items-center space-x-4">
                        {/* Date */}
                        <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-bold text-lg">{formatDate(post.date)}</span>
                        </div>
                        
                        {/* Share Button */}
                        <div className="relative" ref={shareDropdownRef}>
                          <button
                            onClick={() => setShowShareDropdown(!showShareDropdown)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors duration-300 shadow hover:shadow-md"
                            aria-label="Share options"
                            title="Share options"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {showShareDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                              <div className="py-1">
                                {/* Facebook */}
                                <a
                                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => setShowShareDropdown(false)}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center mr-3 text-blue-600">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                  </div>
                                  <span>Facebook</span>
                                </a>
                                
                                {/* X (Twitter) */}
                                <a
                                   href={`https://x.com/intent/tweet?text=${encodeURIComponent(cleanTitle)}&url=${encodeURIComponent(articleUrl)}&via=thesun.my`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => setShowShareDropdown(false)}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center mr-3 text-gray-900">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                  </div>
                                  <span>X (Twitter)</span>
                                </a>
                                
                                {/* WhatsApp */}
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(cleanTitle + ' - ' + articleUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => setShowShareDropdown(false)}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center mr-3 text-green-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.436 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                                    </svg>
                                  </div>
                                  <span>WhatsApp</span>
                                </a>
                                
                                {/* Telegram */}
                                <a
                                  href={`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(cleanTitle)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => setShowShareDropdown(false)}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center mr-3 text-blue-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                  </div>
                                  <span>Telegram</span>
                                </a>
                                
                                {/* Email */}
                                <a
                                  href={`mailto:?subject=${encodeURIComponent(cleanTitle)}&body=${encodeURIComponent('Check out this article: ' + articleUrl)}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  onClick={() => setShowShareDropdown(false)}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center mr-3 text-gray-600">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                    </svg>
                                  </div>
                                  <span>Email</span>
                                </a>
                                
                                {/* Divider */}
                                <div className="border-t border-gray-200 my-1"></div>
                                
                                {/* Copy Link */}
                                <button
                                  onClick={() => {
                                    handleCopyLink();
                                    setShowShareDropdown(false);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                >
                                  <div className="w-5 h-5 flex items-center justify-center mr-3 text-gray-600">
                                    {copied ? (
                                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    )}
                                  </div>
                                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    


                     {/* 5. Content */}
                    {content && (
                      <div
                        className="prose prose-lg max-w-none content-font 
                          prose-p:text-lg prose-p:leading-relaxed prose-p:tracking-wide prose-p:mb-6
                          prose-h1:text-4xl prose-h1:leading-tight prose-h1:tracking-tight prose-h1:mb-6 prose-h1:mt-10
                          prose-h2:text-3xl prose-h2:leading-snug prose-h2:tracking-normal prose-h2:mb-5 prose-h2:mt-8
                          prose-h3:text-2xl prose-h3:leading-normal prose-h3:tracking-normal prose-h3:mb-4 prose-h3:mt-7
                          prose-h4:text-xl prose-h4:leading-normal prose-h4:tracking-wide prose-h4:mb-3 prose-h4:mt-6
                          prose-h5:text-lg prose-h5:leading-relaxed prose-h5:tracking-wide prose-h5:mb-3 prose-h5:mt-5
                          prose-h6:text-base prose-h6:leading-relaxed prose-h6:tracking-wide prose-h6:mb-2 prose-h6:mt-4
                          prose-ul:text-lg prose-ul:leading-relaxed prose-ul:tracking-wide prose-ul:mb-6
                          prose-ol:text-lg prose-ol:leading-relaxed prose-ol:tracking-wide prose-ol:mb-6
                          prose-li:mb-3 prose-li:tracking-wide
                          prose-blockquote:text-xl prose-blockquote:leading-loose prose-blockquote:tracking-wide prose-blockquote:my-8
                          prose-figcaption:text-sm prose-figcaption:leading-relaxed prose-figcaption:tracking-wider"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    )}

                  {/* 6. Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <PostTags tags={post.tags} allTags={allTags} />
                  )}
                  
                  {/* Taboola Mid Article Widget - Below Tags */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <AdWidget type="taboola" containerId="taboola-mid-article-thumbnails" />
                  </div>
                </div>
              </article>
            </div>

            <div className="lg:w-1/4">
              <LatestStories posts={latestPosts} />
              <PopularCategories categories={categories} />
              
              {/* Ad Widget 1 - Below Popular Categories */}
              <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
                <AdWidget type="mgwidget" widgetId="1884419" />
              </div>
              
              {/* Ad Widget 2 - Below Ad Widget 1 */}
              <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
                <div id="mg-ad-placeholder-2"></div>
                {/* Additional ad placeholder */}
              </div>
            </div>
          </div>
        </div>

        {initialMorePosts.length > 1 && (
          <MoreStoriesSection
            initialPosts={initialMorePosts}
            currentPostId={post.id}
          />
        )}
       </div>
     </Layout>
   );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // For now, let's use a simpler approach
    // We'll generate paths on-demand with fallback: 'blocking'
    // This is better for large sites
    return {
      paths: [],
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error generating paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    // Get params from URL - now it's an array of segments
    const slugArray = params?.slug as string[];
    
    if (!slugArray || slugArray.length < 2) {
      console.log('❌ Invalid URL format - need at least category and slug');
      return { notFound: true };
    }
    
    // Last segment is the post slug
    const urlSlug = slugArray[slugArray.length - 1];
    
    // Previous segments are category path
    const urlCategoryPath = slugArray.slice(0, -1);
    
    console.log('🔍 getStaticProps - URL params:', { 
      categoryPath: urlCategoryPath.join('/'), 
      slug: urlSlug,
      fullPath: slugArray.join('/')
    });
    
    // Clean the URL slug for better matching
    const cleanUrlSlug = urlSlug
      .toLowerCase()
      .replace(/[^\w\-]/g, '')
      .trim();
    
    console.log('🔧 Cleaned URL slug:', cleanUrlSlug);
    
    // Get the post - try with cleaned slug first
    let post = await getPost(cleanUrlSlug);
    
    // If not found, try with original slug
    if (!post) {
      console.log('🔄 Trying with original slug...');
      post = await getPost(urlSlug);
    }
    
    // If still not found, try to find post by searching
    if (!post) {
      console.log('🔍 Searching for post...');
      const allPosts = await getPosts(100);
      const foundPost = allPosts.find(p => {
        const postSlug = p.slug.toLowerCase();
        const urlSlugLower = urlSlug.toLowerCase();
        
        // Check exact match or partial match
        return postSlug === urlSlugLower || 
               postSlug === cleanUrlSlug ||
               postSlug.includes(urlSlugLower.replace(/-/g, '')) ||
               p.title.rendered.toLowerCase().includes(urlSlugLower.replace(/-/g, ' '));
      });
      
      if (foundPost) {
        post = foundPost;
        console.log(`✅ Found post via search: ${post.title.rendered}`);
      }
    }
    
    if (!post) {
      console.log(`❌ Post not found: ${urlSlug}`);
      return { notFound: true };
    }
    
    console.log(`✅ Found post: ${post.title.rendered}`);
    console.log(`📝 Post slug: ${post.slug}`);
    console.log(`🔗 URL slug: ${urlSlug}`);
    
    // Get other data
    const [categories, allPosts] = await Promise.all([
      getCategories(),
      getPosts(50),
    ]);
    
    // Fetch tags specific to this post
    const postTagIds = post.tags || [];
    const postTags = postTagIds.length > 0 ? await getTagsByIds(postTagIds) : [];
    
    // Get post's category hierarchy
    const firstCategoryId = post.categories?.[0];
    let currentCategory = categories[0]; // Default
    
    if (firstCategoryId) {
      const foundCategory = categories.find(cat => cat.id === firstCategoryId);
      if (foundCategory) {
        currentCategory = foundCategory;
        console.log(`📂 Post category: ${foundCategory.name} (${foundCategory.slug})`);
        
        // Get category hierarchy for this post
        const categoryHierarchy = await getCategoryHierarchy(firstCategoryId);
        const expectedUrlPath = categoryHierarchy.map(cat => 
          getShortenedCategorySlug(cat.slug)
        ).join('/');
        
        const urlPath = urlCategoryPath.join('/');
        
        console.log(`📊 Category check: URL="${urlPath}", Expected="${expectedUrlPath}"`);
        
        if (urlPath !== expectedUrlPath) {
          console.log(`⚠️ URL category path doesn't match expected`);
          
          // For now, we'll allow the mismatch for backward compatibility
          // In production, you might want to redirect to the correct URL
          console.log(`ℹ️ Allowing URL mismatch for backward compatibility`);
        }
      }
    }
    
    // Get latest posts (excluding current)
    const latestPosts = allPosts
      .filter((p: WPPostWithMedia) => p.id !== post.id)
      .slice(0, 5);
    
    // Get more posts for "More Stories"
    const initialMorePosts = allPosts
      .filter((p: WPPostWithMedia) => p.id !== post.id)
      .slice(0, 24);
    
    return {
      props: {
        post,
        latestPosts,
        categories,
        allTags: postTags,
        initialMorePosts,
        currentCategory
      },
      revalidate: 60,
    };
    
  } catch (error) {
    console.error('💥 Error fetching post:', error);
    return { notFound: true };
  }
};
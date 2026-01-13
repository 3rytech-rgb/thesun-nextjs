// pages/posts/[slug].tsx - FIXED WITH TYPE ANNOTATIONS
import { GetStaticProps, GetStaticPaths } from 'next';
import { 
  getPosts, 
  getPost, 
  getPostsByCategory, 
  getCategories,
  getTags
} from '../../lib/wordpress';
import { 
  WPPost, 
  WPPostWithMedia,
  WPCategory, 
  WPAuthor,
  WPTag
} from '../../types/wordpress';
import Layout from '../../components/layout/Layout';
import NetworkImage from '../../components/common/NetworkImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface PostProps {
  post: WPPostWithMedia;
  latestPosts: WPPostWithMedia[];
  categories: WPCategory[];
  allTags: WPTag[];
  initialMorePosts: WPPostWithMedia[];
}

// Helper function untuk format date
function formatDate(dateString: string): string {
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
function getAuthor(post: WPPostWithMedia): string {
  if (post.authors && post.authors.length > 0) {
    return post.authors[0].display_name;
  }
  
  if (post._embedded?.author?.[0]?.name) {
    return post._embedded.author[0].name;
  }
  
  return 'The Sun Webdesk';
}

// Function untuk clean HTML content
function cleanHtmlContent(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&#8230;/g, '...')
    .replace(/&[#\w]+;/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Function untuk clean text content (tanpa HTML tags)
function cleanTextContent(text: string): string {
  return cleanHtmlContent(text.replace(/<[^>]*>/g, ''));
}

// Component untuk Latest Stories
const LatestStories = ({ posts }: { posts: WPPostWithMedia[] }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
        Latest Stories
      </h2>
      <div className="space-y-6">
        {posts.slice(0, 5).map((post, index) => (
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
                <Link href={`/posts/${post.slug}`}>
                  {cleanTextContent(post.title.rendered)}
                </Link>
              </h3>
              
              <div className="flex items-center text-xs text-gray-500 space-x-2">
                <span>{formatDate(post.date)}</span>
                <span>•</span>
                <span className="text-red-600 font-medium">By {cleanTextContent(getAuthor(post))}</span>
              </div>
            </div>
          </div>
        ))}
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

// Component untuk More Stories (Full Width Section dengan Load More - FIXED RESPONSIVE)
const MoreStoriesSection = ({ initialPosts, currentPostId }: { 
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
          {posts.map((post) => (
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
                  <Link href={`/posts/${post.slug}`}>
                    {cleanTextContent(post.title.rendered)}
                  </Link>
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 space-x-2 mb-3">
                  <span>{formatDate(post.date)}</span>
                  <span>•</span>
                  <span className="text-red-600 font-medium">By {cleanTextContent(getAuthor(post))}</span>
                </div>
                
                {post.excerpt?.rendered && (
                  <div 
                    className="text-gray-600 text-sm leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: cleanHtmlContent(
                        post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                      )
                    }}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
        
        {/* Load More Button - FIXED RESPONSIVE: SELALU DI BAWAH */}
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
const SocialShare = ({ title, slug }: { title: string, slug: string }) => {
  const articleUrl = `https://thesundaily.my/posts/${slug}`;
  
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(articleUrl);
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: `https://www.instagram.com/thesundaily/`,
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

// Component untuk Tags dengan nama sebenar - FIXED: HIDE ONLY SPECIFIC TAGS
const PostTags = ({ tags, allTags }: { tags: number[], allTags: WPTag[] }) => {
  const tagsToHide = ['exclusive', 'top stories', 'topstories', 'top-stories'];
  
  const postTags = allTags.filter(tag => tags.includes(tag.id));
  
  if (postTags.length === 0) return null;

  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
      <div className="flex flex-wrap gap-2">
        {postTags.map((tag) => {
          const shouldHide = tagsToHide.some(hiddenTag => 
            tag.name.toLowerCase().includes(hiddenTag.toLowerCase()) || 
            tag.slug.toLowerCase().includes(hiddenTag.toLowerCase())
          );
          
          if (shouldHide) {
            return null;
          }
          
          return (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full transition-colors"
            >
              #{cleanTextContent(tag.name)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default function Post({ 
  post, 
  latestPosts, 
  categories, 
  allTags, 
  initialMorePosts 
}: PostProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (post.content.rendered) {
      let processedContent = cleanHtmlContent(post.content.rendered);
      
      processedContent = processedContent.replace(
        /<img/g, 
        '<img class="max-w-[800px] w-full h-auto rounded-lg shadow-md my-6 mx-auto"'
      );
      
      processedContent = processedContent.replace(
        /<p>/g, 
        '<p class="text-gray-700 leading-relaxed mb-4 text-lg max-w-4xl mx-auto">'
      );
      
      processedContent = processedContent.replace(
        /<h1>/g, 
        '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4 max-w-4xl mx-auto">'
      );
      processedContent = processedContent.replace(
        /<h2>/g, 
        '<h2 class="text-2xl font-bold text-gray-900 mt-6 mb-3 max-w-4xl mx-auto">'
      );
      processedContent = processedContent.replace(
        /<h3>/g, 
        '<h3 class="text-xl font-bold text-gray-900 mt-5 mb-3 max-w-4xl mx-auto">'
      );
      
      processedContent = processedContent.replace(
        /<ul>/g, 
        '<ul class="list-disc list-inside mb-4 text-gray-700 text-lg max-w-4xl mx-auto">'
      );
      processedContent = processedContent.replace(
        /<ol>/g, 
        '<ol class="list-decimal list-inside mb-4 text-gray-700 text-lg max-w-4xl mx-auto">'
      );
      
      processedContent = processedContent.replace(
        /<blockquote>/g, 
        '<blockquote class="border-l-4 border-red-500 pl-4 italic text-gray-600 my-4 text-lg max-w-4xl mx-auto">'
      );
      
      setContent(processedContent);
    }
  }, [post.content.rendered]);

  const cleanTitle = cleanTextContent(post.title.rendered);
  const cleanAuthor = cleanTextContent(getAuthor(post));

  return (
    <Layout categories={categories}>
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                {post.featured_media_url && (
                  <div className="w-full max-w-[1200px] mx-auto p-4">
                    <NetworkImage
                      src={post.featured_media_url}
                      alt={post.featured_media_alt || cleanTitle}
                      width={1200}
                      height={post.featured_media_height || 675}
                      className="w-full h-auto max-h-[600px] object-contain mx-auto rounded-lg shadow-lg"
                      priority={true}
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                  </div>
                )}
                
                <div className="p-8 max-w-4xl mx-auto">
                  <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {cleanTitle}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{formatDate(post.date)}</span>
                    </div>
                    
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <div className="flex flex-wrap gap-2">
                          {post.categories.map((categoryId: number, index: number) => {
                            const category = categories.find(cat => cat.id === categoryId);
                            return (
                              <span
                                key={index}
                                className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium"
                              >
                                {category ? cleanTextContent(category.name) : 'Uncategorized'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-8 pb-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        {post.authors && post.authors.length > 0 ? (
                          <>
                            {post.authors.slice(0, 1).map((author: WPAuthor) => (
                              <div key={author.term_id} className="flex items-center">
                                <NetworkImage
                                  src={author.avatar_url.url}
                                  alt={author.display_name}
                                  width={40}
                                  height={40}
                                  className="rounded-full mr-3 border-2 border-gray-200"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{author.display_name}</p>
                                  {author.job_title && (
                                    <p className="text-sm text-gray-600">{author.job_title}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <span className="font-medium text-red-600 text-lg">By {cleanAuthor}</span>
                        )}
                      </div>
                      
                      <SocialShare title={cleanTitle} slug={post.slug} />
                    </div>
                  </div>
                  
                  {content && (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <PostTags tags={post.tags} allTags={allTags} />
                  )}
                </div>
              </article>
            </div>
            
            <div className="lg:w-1/4">
              <LatestStories posts={latestPosts} />
              <PopularCategories categories={categories} />
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
    const posts = await getPosts(100);
    
    const paths = posts.map((post: WPPostWithMedia) => ({
      params: { slug: post.slug },
    }));
    
    return {
      paths,
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
  const slug = params?.slug as string;
  
  try {
    const [
      post,
      allPosts,
      categories,
      allTags
    ] = await Promise.all([
      getPost(slug),
      getPosts(50),
      getCategories(),
      getTags()
    ]);
    
    if (!post) {
      return {
        notFound: true,
      };
    }

    const latestPosts = allPosts
      .filter(p => p.id !== post.id)
      .slice(0, 5);

    const initialMorePosts = allPosts
      .filter(p => p.id !== post.id)
      .slice(0, 24);

    return {
      props: { 
        post,
        latestPosts,
        categories,
        allTags,
        initialMorePosts
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching post data:', error);
    return {
      notFound: true,
    };
  }
};
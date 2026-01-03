// pages/posts/[slug].tsx - PERBAIKI DENGAN TYPE ANNOTATIONS
import { GetStaticProps, GetStaticPaths } from 'next';
import { 
  getPosts, 
  getPost, 
  getPostsByCategory, 
  getCategories
} from '../../lib/wordpress';
import { 
  WPPost, 
  WPPostWithMedia, // ✅ SEKARANG SUDAH ADA
  WPCategory, 
  WPAuthor 
} from '../../types/wordpress';
import Layout from '../../components/layout/Layout';
import NetworkImage from '../../components/common/NetworkImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface PostProps {
  post: WPPostWithMedia;
  latestPosts: WPPostWithMedia[];
  relatedPosts: WPPostWithMedia[];
  categories: WPCategory[];
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

// Helper function untuk get category name
function getCategoryName(category: number | WPCategory): string {
  if (typeof category === 'object' && 'name' in category) {
    return category.name;
  }
  return 'Uncategorized';
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
            {/* Thumbnail */}
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
            
            {/* Content */}
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

// Component untuk Related Articles
const RelatedArticles = ({ posts }: { posts: WPPostWithMedia[] }) => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, 6).map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image */}
            {post.featured_media_url && (
              <div className="w-full h-48 relative">
                <NetworkImage
                  src={post.featured_media_url}
                  alt={post.featured_media_alt || cleanTextContent(post.title.rendered)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight hover:text-red-600 transition-colors">
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
                  className="text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: cleanHtmlContent(
                      post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                    )
                  }}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default function Post({ post, latestPosts, relatedPosts, categories }: PostProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Process content untuk styling yang lebih baik
    if (post.content.rendered) {
      let processedContent = cleanHtmlContent(post.content.rendered);
      
      // Add classes to images for better styling - FIXED WIDTH 800px
      processedContent = processedContent.replace(
        /<img/g, 
        '<img class="max-w-[800px] w-full h-auto rounded-lg shadow-md my-6 mx-auto"'
      );
      
      // Add classes to paragraphs
      processedContent = processedContent.replace(
        /<p>/g, 
        '<p class="text-gray-700 leading-relaxed mb-4 text-lg max-w-4xl mx-auto">'
      );
      
      // Add classes to headings
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
      
      // Add classes to lists
      processedContent = processedContent.replace(
        /<ul>/g, 
        '<ul class="list-disc list-inside mb-4 text-gray-700 text-lg max-w-4xl mx-auto">'
      );
      processedContent = processedContent.replace(
        /<ol>/g, 
        '<ol class="list-decimal list-inside mb-4 text-gray-700 text-lg max-w-4xl mx-auto">'
      );
      
      // Add classes to blockquotes
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content - 3/4 width */}
            <div className="lg:w-3/4">
              <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Featured Image - FIXED WIDTH */}
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
                
                {/* Article Header */}
                <div className="p-8 max-w-4xl mx-auto">
                  {/* Title */}
                  <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {cleanTitle}
                  </h1>
                  
                  {/* Meta Information - DATE & CATEGORIES SATU ROW */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{formatDate(post.date)}</span>
                    </div>
                    
                    {/* Categories */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span>•</span>
                        <div className="flex flex-wrap gap-2">
                          {post.categories.map((categoryId: number, index: number) => {
                            // Find category name from categories list
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

                  {/* BYLINE - BAWAH ROW */}
                  <div className="mb-8 pb-6 border-b border-gray-200">
                    <span className="font-medium text-red-600 text-lg">By {cleanAuthor}</span>
                    
                    {/* Authors info jika ada */}
                    {post.authors && post.authors.length > 0 && (
                      <div className="flex items-center mt-4">
                        {post.authors.map((author: WPAuthor) => (
                          <div key={author.term_id} className="flex items-center mr-6">
                            <NetworkImage
                              src={author.avatar_url.url}
                              alt={author.display_name}
                              width={48}
                              height={48}
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
                      </div>
                    )}
                  </div>
                  
                  {/* Article Content */}
                  {content && (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  )}
                  
                  {/* Tags jika ada */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tagId: number) => {
                          // In actual implementation, you'd need to fetch tags or have them in _embedded
                          return (
                            <span
                              key={tagId}
                              className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                            >
                              Tag #{tagId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </article>
              
              {/* Related Articles Section */}
              {relatedPosts.length > 0 && (
                <RelatedArticles posts={relatedPosts} />
              )}
            </div>
            
            {/* Sidebar - 1/4 width */}
            <div className="lg:w-1/4">
              <LatestStories posts={latestPosts} />
              <PopularCategories categories={categories} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const posts = await getPosts(100); // Fetch more posts for better coverage
    
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
    // Fetch current post - sudah WPPostWithMedia
    const post = await getPost(slug);
    
    if (!post) {
      return {
        notFound: true,
      };
    }

    // Fetch latest posts (5 posts terbaru) - sudah WPPostWithMedia[]
    const allPosts = await getPosts(20);
    const latestPosts = allPosts
      .filter(p => p.id !== post.id)
      .slice(0, 5);

    // Fetch categories untuk Popular Categories
    const categories = await getCategories();

    // Fetch related posts berdasarkan kategori - sudah WPPostWithMedia[]
    let relatedPosts: WPPostWithMedia[] = [];
    
    if (post.categories && post.categories.length > 0) {
      // Get the first category ID
      const firstCategoryId = post.categories[0];
      
      const categoryPosts = await getPostsByCategory(firstCategoryId, 10);
      relatedPosts = categoryPosts
        .filter(p => p.id !== post.id)
        .slice(0, 6);
    }

    // Jika tak cukup related posts, tambah dari latest posts
    if (relatedPosts.length < 6) {
      const additionalPosts = latestPosts
        .filter(p => !relatedPosts.some(rp => rp.id === p.id))
        .slice(0, 6 - relatedPosts.length);
      relatedPosts = [...relatedPosts, ...additionalPosts];
    }

    return {
      props: { 
        post, // ✅ Tidak perlu extractFeaturedMedia lagi
        latestPosts, // ✅ Tidak perlu extractFeaturedMedia lagi
        relatedPosts, // ✅ Tidak perlu extractFeaturedMedia lagi
        categories
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
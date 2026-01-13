// pages/category/[slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next';
import { 
  getCategories, 
  getPostsByCategory, 
  getPostsByCategoryWithChildren,
  extractFeaturedMedia 
} from '../../lib/wordpress';
import { 
  WPPost, 
  WPPostWithMedia,
  WPCategory 
} from '../../types/wordpress';
import Layout from '../../components/layout/Layout';
import NetworkImage from '../../components/common/NetworkImage';
import Link from 'next/link';
import { useState } from 'react';

// Buat type dengan count yang pasti
interface CategoryWithCount extends WPCategory {
  count: number;
  parent: number;
}

interface CategoryProps {
  category: CategoryWithCount;
  subCategories: CategoryWithCount[];
  featuredPost: WPPostWithMedia | null;
  categoryPosts: WPPostWithMedia[];
  allCategories: CategoryWithCount[];
  totalPostsCount: number;
  allPosts: WPPostWithMedia[];
}

// Helper function untuk clean HTML
function cleanHtmlContent(html: string): string {
  if (!html) return '';
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

// Helper function untuk clean text excerpt (remove HTML tags)
function cleanTextExcerpt(html: string): string {
  if (!html) return '';
  const cleanText = html.replace(/<[^>]*>/g, '');
  return cleanHtmlContent(cleanText);
}

// Helper function untuk format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Function untuk get parent category name
function getParentCategoryName(allCategories: CategoryWithCount[], parentId: number): string {
  const parentCat = allCategories.find(cat => cat.id === parentId);
  return parentCat ? cleanHtmlContent(parentCat.name) : 'Parent';
}

export default function CategoryPage({ 
  category, 
  subCategories, 
  featuredPost, 
  categoryPosts,
  allCategories,
  totalPostsCount,
  allPosts
}: CategoryProps) {
  const [displayCount, setDisplayCount] = useState(9);
  
  // Featured post adalah post paling latest (index 0)
  const mainFeaturedPost = allPosts.length > 0 ? allPosts[0] : null;
  
  // Side featured posts (index 1-4)
  const sideFeaturedPosts = allPosts.slice(1, 5);
  
  // More stories mulai dari index 5
  const moreStories = allPosts.slice(5, displayCount + 5);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 9);
  };

  const hasMorePosts = displayCount < allPosts.length - 5;

  // Find parent category jika ada
  const parentCategory = category.parent !== 0 
    ? allCategories.find(cat => cat.id === category.parent)
    : null;

  // Find sibling categories jika ada parent
  const siblingCategories = parentCategory 
    ? allCategories.filter(cat => cat.parent === parentCategory.id && cat.id !== category.id)
    : [];

  return (
    <Layout categories={allCategories}>
      <div className="category-page">
        {/* Clean Header */}
        <section className="category-header bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold capitalize mb-6 animate-fade-in">
              {cleanHtmlContent(category.name)}
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-light animate-fade-in-delayed">
              {totalPostsCount > 0 
                ? `Discover the latest stories and updates in ${cleanHtmlContent(category.name)}` 
                : 'Be the first to share your story in this category'
              }
            </p>
          </div>
        </section>

        {/* Sub Categories Navigation - TUNJUK untuk semua level */}
        {(subCategories.length > 0 || category.parent !== 0) && (
          <section className="sub-categories bg-white py-8 border-b border-slate-200">
            <div className="container mx-auto px-4">
              <h2 className="text-lg font-semibold text-slate-700 mb-6 text-center">
                {category.parent === 0 ? 'Browse Sub Categories' : 'Related Categories'}
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {/* Jika ini child category, tunjuk siblings */}
                {category.parent !== 0 && parentCategory && (
                  <>
                    {/* Parent category link */}
                    <Link
                      href={`/category/${parentCategory.slug}`}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-5 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      All {cleanHtmlContent(parentCategory.name)}
                    </Link>
                    
                    {/* Sibling categories */}
                    {siblingCategories.map((siblingCat) => (
                      <Link
                        key={siblingCat.id}
                        href={`/category/${siblingCat.slug}`}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-5 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                      >
                        {cleanHtmlContent(siblingCat.name)}
                      </Link>
                    ))}
                  </>
                )}
                
                {/* Jika ini parent category, tunjuk children */}
                {category.parent === 0 && subCategories.map((subCat) => (
                  <Link
                    key={subCat.id}
                    href={`/category/${subCat.slug}`}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-5 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    {cleanHtmlContent(subCat.name)}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Section - Layout 3/5 kiri, 2/5 kanan */}
        <section className="featured-section py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-2 border-b-2 border-red-500 inline-block">
              Featured Stories
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Left - Main Featured Post (3/5) */}
              <div className="lg:col-span-3">
                {mainFeaturedPost ? (
                  <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    {mainFeaturedPost.featured_media_url && (
                      <div className="featured-image-container h-64 md:h-80 relative">
                        <NetworkImage
                          src={mainFeaturedPost.featured_media_url}
                          alt={mainFeaturedPost.featured_media_alt || cleanHtmlContent(mainFeaturedPost.title.rendered)}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 60vw"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex flex-wrap items-center mb-4 gap-2">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                          {cleanHtmlContent(category.name.toUpperCase())}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {formatDate(mainFeaturedPost.date)}
                        </span>
                      </div>
                      
                      <Link href={`/posts/${mainFeaturedPost.slug}`}>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight cursor-pointer hover:text-red-600 transition-colors duration-300"
                            dangerouslySetInnerHTML={{ 
                              __html: cleanHtmlContent(mainFeaturedPost.title.rendered) 
                            }} />
                      </Link>
                      
                      <div 
                        className="text-slate-600 leading-relaxed mb-6 text-sm md:text-base"
                        dangerouslySetInnerHTML={{ 
                          __html: cleanHtmlContent(
                            mainFeaturedPost.excerpt?.rendered?.length > 200 
                              ? mainFeaturedPost.excerpt.rendered.substring(0, 200) + '...' 
                              : mainFeaturedPost.excerpt?.rendered || ''
                          )
                        }} 
                      />
                      
                      <Link 
                        href={`/posts/${mainFeaturedPost.slug}`}
                        className="inline-flex items-center bg-slate-900 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-sm md:text-base"
                      >
                        Read Full Story
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
                    <p className="text-slate-500">No featured story available</p>
                  </div>
                )}
              </div>

              {/* Right - Side Featured Posts (2/5) */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {sideFeaturedPosts.map((post, index) => (
                    <article key={post.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex space-x-4">
                        {post.featured_media_url && (
                          <div className="flex-shrink-0 w-20 h-20 relative">
                            <NetworkImage
                              src={post.featured_media_url}
                              alt={post.featured_media_alt || cleanHtmlContent(post.title.rendered)}
                              fill
                              className="object-cover rounded-lg"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center mb-2 gap-2">
                            <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs font-medium">
                              {cleanHtmlContent(category.name)}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {formatDate(post.date)}
                            </span>
                          </div>
                          
                          <Link href={`/posts/${post.slug}`}>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 leading-tight cursor-pointer hover:text-red-600 transition-colors duration-300 line-clamp-2"
                                dangerouslySetInnerHTML={{ 
                                  __html: cleanHtmlContent(post.title.rendered) 
                                }} />
                          </Link>
                          
                          <div className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                            {cleanTextExcerpt(
                              post.excerpt?.rendered?.length > 80 
                                ? post.excerpt.rendered.substring(0, 80) + '...' 
                                : post.excerpt?.rendered || ''
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                  
                  {sideFeaturedPosts.length === 0 && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                      <p className="text-slate-500 text-sm">No additional stories yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Stories Section */}
        <section className="more-stories py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                More Stories
              </h2>
              <p className="text-slate-600">Continue exploring more amazing content</p>
            </div>
            
            {moreStories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moreStories.map((post) => (
                    <article key={post.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                      {post.featured_media_url && (
                        <Link href={`/posts/${post.slug}`}>
                          <div className="article-image h-48 overflow-hidden cursor-pointer relative">
                            <NetworkImage
                              src={post.featured_media_url}
                              alt={post.featured_media_alt || cleanHtmlContent(post.title.rendered)}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        </Link>
                      )}
                      
                      <div className="p-5">
                        <div className="flex flex-wrap items-center mb-3 gap-2">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {cleanHtmlContent(category.name)}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {formatDate(post.date)}
                          </span>
                        </div>
                        
                        <Link href={`/posts/${post.slug}`}>
                          <h4 className="article-title text-lg font-bold text-slate-900 mb-3 leading-tight cursor-pointer hover:text-red-600 transition-colors duration-300"
                              dangerouslySetInnerHTML={{ 
                                __html: cleanHtmlContent(post.title.rendered) 
                              }} />
                        </Link>
                        
                        <div className="article-excerpt text-slate-600 text-sm leading-relaxed mb-4">
                          {cleanTextExcerpt(
                            post.excerpt?.rendered?.length > 100 
                              ? post.excerpt.rendered.substring(0, 100) + '...' 
                              : post.excerpt?.rendered || ''
                          )}
                        </div>
                        
                        <Link 
                          href={`/posts/${post.slug}`}
                          className="text-slate-700 hover:text-red-600 font-medium text-sm transition-colors duration-300 inline-flex items-center"
                        >
                          Read More
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Load More Button - FIXED RESPONSIVE: SELALU DI BAWAH */}
                {hasMorePosts && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="w-full max-w-[300px] mx-auto bg-white border border-slate-300 hover:border-red-500 text-slate-700 hover:text-red-600 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Load More Stories
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-slate-500">No more stories found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-delayed {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Responsive breakpoints */
        @media (max-width: 640px) {
          .category-header h1 {
            font-size: 2.25rem;
          }
          .category-header p {
            font-size: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allCategories = await getCategories();
    
    const paths = allCategories.map((category: WPCategory) => ({
      params: { slug: category.slug },
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
  try {
    const slug = params?.slug as string;
    
    // Fetch semua categories
    const allCategoriesData = await getCategories();
    
    // Pastikan semua categories memiliki count dan parent dengan default values
    const allCategories: CategoryWithCount[] = allCategoriesData.map(cat => ({
      ...cat,
      count: cat.count || 0,
      parent: cat.parent || 0,
    }));
    
    // Find current category
    const category = allCategories.find(cat => cat.slug === slug);
    
    if (!category) {
      return {
        notFound: true,
      };
    }

    // Find subcategories untuk category ini
    const subCategories: CategoryWithCount[] = allCategories
      .filter(cat => cat.parent === category.id)
      .map(cat => ({
        ...cat,
        count: cat.count || 0,
        parent: cat.parent || 0,
      }));

    // Fetch posts berdasarkan apakah ini parent atau child category
    let allPostsData: WPPost[] = [];
    
    if (category.parent === 0) {
      // Parent category - fetch semua posts dari parent + children
      allPostsData = await getPostsByCategoryWithChildren(category.id, 50);
    } else {
      // Child category - fetch hanya posts dari category ini
      allPostsData = await getPostsByCategory(category.id, 50);
    }
    
    // Extract media untuk semua posts
    const allPosts: WPPostWithMedia[] = allPostsData.map(post => extractFeaturedMedia(post));
    
    // Total posts count
    const totalPostsCount = allPosts.length;
    
    // Featured post (latest)
    const featuredPost = allPosts.length > 0 ? allPosts[0] : null;
    
    // Initial category posts (excluding featured)
    const categoryPosts = allPosts.slice(1, 10);

    return {
      props: {
        category,
        subCategories,
        featuredPost,
        categoryPosts,
        allCategories,
        totalPostsCount,
        allPosts,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in category page getStaticProps:', error);
    return {
      notFound: true,
    };
  }
};
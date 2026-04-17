import { getPostUrl } from '../../../lib/wordpress';
// components/home/categories/CategoryLayout3.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';
import { cleanTextContent } from '../utils/contentCleaner';
import { formatRelativeTime } from '../utils/timeFormatter';

interface CategoryLayout3Props {
  name: string;
  slug: string;
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function CategoryLayout3({ 
  name, 
  slug, 
  posts, 
  categories, 
  isLast = false 
}: CategoryLayout3Props) {
  if (posts.length === 0) return null;

  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    
    const categoryId = typeof post.categories[0] === 'number' 
      ? post.categories[0] 
      : (post.categories[0] as any).id;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? cleanTextContent(category.name) : 'Uncategorized';
  };

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  const gridPosts = posts.slice(3, 7);

  return (
    <div>
      {/* Section Header dengan gaya elegant */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {name}
        </h2>
        <p className="text-gray-600 text-lg">Style, wellness, and modern living</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto mt-4"></div>
      </div>

      {/* Magazine Layout */}
      <div className="mb-16">
        {/* Featured + Secondary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Featured Article */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {featuredPost.featured_media_url && (
                <div className="w-full h-96 relative overflow-hidden">
                  <img 
                    src={featuredPost.featured_media_url} 
                    alt={cleanTextContent(featuredPost.featured_media_alt || featuredPost.title.rendered)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-gray-500 text-sm">
                    {formatRelativeTime(featuredPost.date)}
                  </span>
                  <span className="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full font-medium">
                    {getPostCategoryName(featuredPost, categories)}
                  </span>
                </div>
                
                <Link href={`${getPostUrl(featuredPost)}`}>
                  <h3 
                    className="text-3xl font-bold text-gray-900 mb-4 hover:text-pink-600 transition-colors cursor-pointer"
                    dangerouslySetInnerHTML={{ __html: cleanTextContent(featuredPost.title.rendered) }} 
                  />
                </Link>
                
                {featuredPost.excerpt?.rendered && (
                  <div 
                    className="text-gray-600 text-lg leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ 
                      __html: cleanTextContent(featuredPost.excerpt.rendered)
                    }} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Secondary Articles */}
          <div className="space-y-6">
            {secondaryPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {post.featured_media_url && (
                  <div className="w-full h-48 relative overflow-hidden">
                    <img 
                      src={post.featured_media_url} 
                      alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 text-xs">
                      {formatRelativeTime(post.date)}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                      {getPostCategoryName(post, categories)}
                    </span>
                  </div>
                  
                  <Link href={`${getPostUrl(post)}`}>
                    <h4 
                      className="font-semibold text-gray-900 text-sm hover:text-purple-600 transition-colors cursor-pointer line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gridPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              {post.featured_media_url && (
                <div className="w-full h-40 relative overflow-hidden">
                  <img 
                    src={post.featured_media_url} 
                    alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-xs">
                    {formatRelativeTime(post.date)}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                    {getPostCategoryName(post, categories)}
                  </span>
                </div>
                
                <Link href={`${getPostUrl(post)}`}>
                  <h4 
                    className="font-semibold text-gray-900 text-sm hover:text-pink-600 transition-colors cursor-pointer line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link 
            href={`/category/${slug}`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 hover:shadow-lg"
          >
            Explore More {name}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Line break */}
      {!isLast && (
        <div className="border-t border-gray-300 my-12"></div>
      )}
    </div>
  );
}
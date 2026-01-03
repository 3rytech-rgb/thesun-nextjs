// components/home/CategoryGrid.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../types/wordpress';
import { cleanTextContent } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';

interface CategoryGridProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
}

export default function CategoryGrid({ posts, categories }: CategoryGridProps) {
  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    
    const categoryId = typeof post.categories[0] === 'number' 
      ? post.categories[0] 
      : (post.categories[0] as any).id;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? cleanTextContent(category.name) : 'Uncategorized';
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
          {post.featured_media_url && (
            <div className="w-full h-40 flex-shrink-0 relative overflow-hidden">
              <img 
                src={post.featured_media_url} 
                alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-gray-100');
                }}
              />
            </div>
          )}
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-xs">
                {formatRelativeTime(post.date)}
              </div>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {getPostCategoryName(post, categories)}
              </span>
            </div>
            
            <Link href={`/posts/${post.slug}`}>
              <h4 
                className="font-semibold text-gray-900 text-sm hover:text-red-600 transition-colors cursor-pointer leading-tight line-clamp-3 flex-1"
                dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
              />
            </Link>
            
            {/* Optional: Add excerpt for longer content */}
            {post.excerpt?.rendered && (
              <div 
                className="text-gray-600 text-xs mt-2 line-clamp-2"
                dangerouslySetInnerHTML={{ 
                  __html: cleanTextContent(
                    post.excerpt.rendered.substring(0, 80) + '...'
                  )
                }} 
              />
            )}
            
            {/* Read more link */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link 
                href={`/posts/${post.slug}`}
                className="text-red-600 hover:text-red-800 text-xs font-medium inline-flex items-center transition-colors"
              >
                Read more
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
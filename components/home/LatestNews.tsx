// components/home/LatestNews.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../types/wordpress';
import { cleanTextContent, getFullParagraphExcerpt } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';

interface LatestNewsProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
}

export default function LatestNews({ posts, categories }: LatestNewsProps) {
  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    
    const categoryId = typeof post.categories[0] === 'number' 
      ? post.categories[0] 
      : (post.categories[0] as any).id;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? cleanTextContent(category.name) : 'Uncategorized';
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
        Latest News
      </h3>
      
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={post.id} className={`pb-6 ${index < posts.length - 1 ? 'border-b border-gray-200' : ''}`}>
            {/* Hanya post pertama ada featured image besar */}
            {index === 0 && post.featured_media_url && (
              <div className="w-full h-40 mb-3">
                <img 
                  src={post.featured_media_url} 
                  alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            {/* Untuk post 2-4, thumbnail kecil */}
            {index > 0 && post.featured_media_url && (
              <div className="w-16 h-16 float-left mr-3 mb-2">
                <img 
                  src={post.featured_media_url} 
                  alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs">
                {formatRelativeTime(post.date)}
              </span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {getPostCategoryName(post, categories)}
              </span>
            </div>
            
            <Link href={`/posts/${post.slug}`}>
              <h4 
                className={`font-semibold text-gray-900 hover:text-red-600 transition-colors cursor-pointer ${
                  index === 0 ? 'text-lg' : 'text-sm'
                }`}
                dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
              />
            </Link>
            
            {index === 0 && (
              <div 
                className="text-gray-600 text-sm mt-2"
                dangerouslySetInnerHTML={{ 
                  __html: getFullParagraphExcerpt(
                    post.excerpt?.rendered || 
                    post.content?.rendered?.substring(0, 150) || 
                    ''
                  )
                }} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
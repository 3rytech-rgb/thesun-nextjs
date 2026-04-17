// components/home/LatestNews.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../types/wordpress';
import { cleanTextContent, getFullParagraphExcerpt } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';
import { getPostUrl } from '../../lib/wordpress';

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

  // Debug: Tunjukkan post yang diterima
  if (process.env.NODE_ENV === 'development') {
    console.log('LatestNews - Posts count:', posts.length);
    console.log('LatestNews - Posts:', posts.map(p => ({
      id: p.id,
      title: cleanTextContent(p.title.rendered),
      date: p.date,
      categories: p.categories
    })));
  }

  // Pastikan kita ada 5 posts terbaru
  const latestPosts = posts.slice(0, 6);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
        Latest News
      </h3>
      
      {latestPosts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No latest news available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {latestPosts.map((post, index) => (
            <div key={post.id} className={`pb-6 ${index < latestPosts.length - 1 ? 'border-b border-gray-200' : ''}`}>
              {/* Hanya post pertama ada featured image besar */}
              {index === 0 && post.featured_media_url && (
                <div className="w-full h-40 mb-3">
                  <img 
                    src={post.featured_media_url} 
                    alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/images/news-placeholder.jpg';
                    }}
                  />
                </div>
              )}
              
              {/* Untuk post 2-5, thumbnail kecil */}
              {index > 0 && post.featured_media_url && (
                <div className="w-16 h-16 float-left mr-3 mb-2">
                  <img 
                    src={post.featured_media_url} 
                    alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/images/news-placeholder.jpg';
                    }}
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
              
              <Link href={`${getPostUrl(post)}`}>
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
      )}
    </div>
  );
}
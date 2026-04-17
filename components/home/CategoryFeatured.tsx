// components/home/CategoryFeatured.tsx
import { getPostUrl } from '../../lib/wordpress';
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../types/wordpress';
import { cleanTextContent, getFullParagraphExcerpt } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';

interface CategoryFeaturedProps {
  post: WPPostWithMedia;
  categories: WPCategory[];
}

export default function CategoryFeatured({ post, categories }: CategoryFeaturedProps) {
  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    
    const categoryId = typeof post.categories[0] === 'number' 
      ? post.categories[0] 
      : (post.categories[0] as any).id;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? cleanTextContent(category.name) : 'Uncategorized';
  };

  if (!post) return null;

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      {/* Gunakan featured_media_url, bukan featured_media (yang adalah ID) */}
      {post.featured_media_url && (
        <div className="w-full h-80 flex-shrink-0 relative overflow-hidden">
          <img 
            src={post.featured_media_url} 
            alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback jika gambar gagal load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-blue-100');
            }}
          />
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 text-sm">
              {formatRelativeTime(post.date)}
            </span>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
              {getPostCategoryName(post, categories)}
            </span>
          </div>
          
          {/* Optional: Author info */}
          {post.authors && post.authors.length > 0 && (
            <span className="text-gray-500 text-xs">
              By {post.authors[0].display_name}
            </span>
          )}
        </div>
        
        <Link href={`${getPostUrl(post)}`}>
          <h3 
            className="text-2xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors cursor-pointer flex-1"
            dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
          />
        </Link>
        
        <div 
          className="text-gray-600 leading-relaxed text-base mb-6 line-clamp-3"
          dangerouslySetInnerHTML={{ 
            __html: getFullParagraphExcerpt(
              post.excerpt?.rendered || 
              post.content?.rendered?.substring(0, 200) || 
              ''
            )
          }} 
        />
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link 
            href={`${getPostUrl(post)}`}
            className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold transition-colors"
          >
            Read full story
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
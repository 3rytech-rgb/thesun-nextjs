// components/home/TopStories.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../types/wordpress';
import { cleanTextContent } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';

interface TopStoriesProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
}

export default function TopStories({ posts, categories }: TopStoriesProps) {
  // Function untuk dapatkan category name dengan betul - AMBIL DARI _embedded JIKA ADA
  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    // 1. Cari category dari _embedded['wp:term'] terlebih dahulu (jika ada)
    if (post._embedded?.['wp:term']?.[0]?.[0]) {
      try {
        const embeddedCategory = post._embedded['wp:term'][0][0];
        if (embeddedCategory && embeddedCategory.name) {
          const cleanedName = cleanTextContent(embeddedCategory.name);
          if (cleanedName && cleanedName !== 'Uncategorized') {
            return cleanedName;
          }
        }
      } catch (error) {
        console.error('Error getting category from _embedded:', error);
      }
    }
    
    // 2. Jika tidak ada di _embedded, cuba dari categories array
    if (!post.categories || post.categories.length === 0) return 'News';
    
    try {
      // Handle jika categories adalah array of numbers
      if (post.categories.length > 0 && typeof post.categories[0] === 'number') {
        const categoryId = post.categories[0] as number;
        const category = allCategories.find(cat => cat.id === categoryId);
        if (category && category.name) {
          const cleanedName = cleanTextContent(category.name);
          return cleanedName || 'News';
        }
      }
      
      // Handle jika categories adalah array of objects
      if (post.categories.length > 0 && typeof post.categories[0] === 'object') {
        const categoryObj = post.categories[0] as any;
        const categoryId = categoryObj.id || categoryObj.term_id;
        
        if (categoryId) {
          const category = allCategories.find(cat => cat.id === categoryId);
          if (category && category.name) {
            const cleanedName = cleanTextContent(category.name);
            return cleanedName || 'News';
          }
        }
        
        // Jika ada name dalam object
        if (categoryObj.name) {
          const cleanedName = cleanTextContent(categoryObj.name);
          return cleanedName || 'News';
        }
      }
      
      return 'News';
    } catch (error) {
      console.error('Error getting category name:', error);
      return 'News';
    }
  };

  // Debug: Tunjukkan data _embedded jika ada
  if (process.env.NODE_ENV === 'development' && posts.length > 0) {
    posts.slice(0, 2).forEach((post, idx) => {
      console.log(`TopStories Post ${idx + 1}:`, {
        id: post.id,
        title: cleanTextContent(post.title.rendered),
        hasEmbedded: !!post._embedded,
        wpTerm: post._embedded?.['wp:term'],
        categories: post.categories,
        categoryFromEmbedded: post._embedded?.['wp:term']?.[0]?.[0]?.name,
        finalCategory: getPostCategoryName(post, categories)
      });
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6 pb-4 border-b-2 border-red-600">
        <h3 className="text-xl font-bold text-gray-900">
          Top Stories
        </h3>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h4 className="text-gray-700 font-medium mb-2">No Top Stories</h4>
          <p className="text-gray-500 text-sm">
            Check back later for trending stories
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => {
            const categoryName = getPostCategoryName(post, categories);
            const cleanTitle = cleanTextContent(post.title.rendered);
            
            return (
              <div key={post.id} className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                <div className="flex items-start space-x-3">
                  {/* Ranking number - api untuk top 3, nombor untuk lain */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    index < 3 
                      ? 'bg-gradient-to-br from-red-600 to-orange-500 shadow-lg' 
                      : 'bg-gradient-to-br from-gray-200 to-gray-300'
                  }`}>
                    {index < 3 ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-gray-700 text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Category and time - ONE ROW */}
                    <div className="flex items-center mb-1">
                      <span className="text-red-600 text-xs font-semibold uppercase tracking-wide mr-2">
                        {categoryName}
                      </span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {formatRelativeTime(post.date)}
                      </span>
                    </div>
                    
                    {/* Title only - no excerpt, no thumbnail */}
                    <Link href={`/posts/${post.slug}`}>
                      <h5 
                        className="font-semibold text-gray-900 text-sm hover:text-red-600 transition-colors cursor-pointer leading-tight line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: cleanTitle }} 
                      />
                    </Link>
                  </div>
                </div>
                
                {/* Simple divider */}
                {index < posts.length - 1 && (
                  <div className="mt-4 border-t border-gray-100"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
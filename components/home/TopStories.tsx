import Link from 'next/link';
import { WPPost, WPCategory } from '../../types/wordpress';
import { cleanTextContent } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';

interface TopStoriesProps {
  posts: WPPost[];
  categories: WPCategory[];
}

export default function TopStories({ posts, categories }: TopStoriesProps) {
  const getPostCategoryName = (post: WPPost, allCategories: WPCategory[]): string => {
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
        Top Stories
      </h3>
      
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post.id} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              index < 3 ? 'bg-red-600' : 
              index < 6 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {index < 3 && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              )}
              {index >= 3 && index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">
                  {formatRelativeTime(post.date)}
                </span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  {getPostCategoryName(post, categories)}
                </span>
              </div>
              
              <Link href={`/posts/${post.slug}`}>
                <h5 
                  className="font-semibold text-gray-900 text-sm hover:text-red-600 transition-colors cursor-pointer leading-tight"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
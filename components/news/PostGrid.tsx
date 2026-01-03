// components/news/PostGrid.tsx
import { WPPostWithMedia } from '../../types/wordpress';
import FeaturedPost from './FeaturedPost';
import PostCard from './PostCard';

interface PostGridProps {
  posts: WPPostWithMedia[];
}

export default function PostGrid({ posts }: PostGridProps) {
  if (!posts || posts.length === 0) {
    return <div className="text-center py-8">No posts available</div>;
  }

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 4); // 3 posts untuk latest
  const topStories = posts.slice(4, 8); // 4 posts untuk top stories

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
      
      {/* Featured Story - Left (2/4) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {featuredPost && (
            <div className="h-full flex flex-col">
              {/* Featured Image dengan fallback */}
              {featuredPost.featured_media_url ? (
                <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
                  <img 
                    src={featuredPost.featured_media_url}
                    alt={featuredPost.featured_media_alt || featuredPost.title.rendered}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      // Fallback jika gambar gagal load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <span className="text-blue-400 text-lg">No Image</span>
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-80 lg:h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span className="text-blue-400 text-lg">Featured Image</span>
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(featuredPost.date).toLocaleDateString('en-MY')}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {featuredPost.title.rendered}
                </h2>
                
                <div 
                  className="text-gray-600 mb-6 leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ 
                    __html: featuredPost.excerpt?.rendered?.length > 150 
                      ? featuredPost.excerpt.rendered.substring(0, 150) + '...' 
                      : featuredPost.excerpt?.rendered || '' 
                  }}
                />
                
                <a 
                  href={`/posts/${featuredPost.slug}`}
                  className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg w-full text-center"
                >
                  Read Full Story
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latest News - Middle (1/4) */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-400">
          Latest News
        </h3>
        
        <div className="space-y-6">
          {latestPosts.map((post, index) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
              {post.featured_media_url && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={post.featured_media_url}
                    alt={post.featured_media_alt || post.title.rendered}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {post.title.rendered}
                </h4>
                
                <span className="text-gray-500 text-xs block mb-2">
                  {new Date(post.date).toLocaleDateString('en-MY')}
                </span>
                
                <div 
                  className="text-gray-600 text-sm line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: post.excerpt?.rendered || '' 
                  }}
                />
                
                <a 
                  href={`/posts/${post.slug}`}
                  className="inline-block mt-3 text-blue-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200"
                >
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Stories - Right (1/4) */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-400">
          Top Stories
        </h3>
        
        <div className="space-y-4">
          {topStories.map((post, index) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                    {post.title.rendered}
                  </h5>
                  <span className="text-gray-500 text-xs">
                    {new Date(post.date).toLocaleDateString('en-MY')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
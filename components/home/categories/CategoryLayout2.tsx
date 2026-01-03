// components/home/categories/CategoryLayout2.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';
import { cleanTextContent } from '../utils/contentCleaner';
import { formatRelativeTime } from '../utils/timeFormatter';
import { useState, useEffect, useCallback } from 'react';

interface CategoryLayout2Props {
  name: string;
  slug: string;
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function CategoryLayout2({ 
  name, 
  slug, 
  posts, 
  categories, 
  isLast = false 
}: CategoryLayout2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const postsPerView = 3;

  if (posts.length === 0) return null;

  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    
    const categoryId = typeof post.categories[0] === 'number' 
      ? post.categories[0] 
      : (post.categories[0] as any).id;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? cleanTextContent(category.name) : 'Uncategorized';
  };

  const totalSlides = Math.ceil(posts.length / postsPerView);
  
  const nextSlide = useCallback(() => {
    setDirection('right');
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  }, [totalSlides]);

  const prevSlide = () => {
    setDirection('left');
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  // Auto play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const visiblePosts = posts.slice(
    currentIndex * postsPerView,
    (currentIndex + 1) * postsPerView
  );

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {name}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Stay updated with the latest</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Auto play toggle */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`p-2 rounded-full ${isAutoPlaying ? 'text-blue-600 bg-blue-50' : 'text-gray-500 bg-gray-100'}`}
              aria-label={isAutoPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
            >
              {isAutoPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <Link 
              href={`/category/${slug}`}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View All →
            </Link>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ 
              width: `${((currentIndex + 1) / totalSlides) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="mb-16 relative">
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300 hover:bg-gray-50 hover:shadow-xl hover:-translate-x-5"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-300 hover:bg-gray-50 hover:shadow-xl hover:translate-x-5"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Content dengan slide animation */}
        <div className="relative overflow-hidden">
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-500 ease-out`}
            style={{
              transform: `translateX(${direction === 'right' ? '10px' : '-10px'})`,
              opacity: 0
            }}
            key={`slide-out-${currentIndex}`}
          />
          
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-out absolute top-0 left-0 w-full`}
            style={{
              transform: direction === 'right' 
                ? 'translateX(100%)' 
                : 'translateX(-100%)'
            }}
            key={`slide-in-${currentIndex}`}
          >
            {visiblePosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300"
              >
                {post.featured_media_url && (
                  <div className="w-full h-56 relative overflow-hidden">
                    <img 
                      src={post.featured_media_url} 
                      alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        {getPostCategoryName(post, categories)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-gray-500 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatRelativeTime(post.date)}
                    </div>
                  </div>
                  
                  <Link href={`/posts/${post.slug}`}>
                    <h4 
                      className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors cursor-pointer leading-tight line-clamp-2 mb-3 flex-1"
                      dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
                    />
                  </Link>
                  
                  {/* Author Info */}
                  <div className="flex items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{post.authors?.[0]?.display_name || 'Sun Media'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-500 ease-out`}
            style={{
              transform: 'translateX(0)',
              opacity: 1
            }}
            key={`slide-active-${currentIndex}`}
          >
            {visiblePosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300"
              >
                {post.featured_media_url && (
                  <div className="w-full h-56 relative overflow-hidden">
                    <img 
                      src={post.featured_media_url} 
                      alt={cleanTextContent(post.featured_media_alt || post.title.rendered)}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        {getPostCategoryName(post, categories)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-gray-500 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatRelativeTime(post.date)}
                    </div>
                  </div>
                  
                  <Link href={`/posts/${post.slug}`}>
                    <h4 
                      className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors cursor-pointer leading-tight line-clamp-2 mb-3 flex-1"
                      dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }} 
                    />
                  </Link>
                  
                  {/* Author Info */}
                  <div className="flex items-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                    <svg className="w-4 h-4 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{post.authors?.[0]?.display_name || 'Sun Media'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                transition-all duration-300 ease-out
                ${index === currentIndex 
                  ? 'w-8 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full' 
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Line break */}
      {!isLast && (
        <div className="border-t border-gray-300 my-12"></div>
      )}
    </div>
  );
}
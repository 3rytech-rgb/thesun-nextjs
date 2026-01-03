// components/home/FeaturedStory.tsx
import Link from 'next/link';
import { WPPostWithMedia, WPCategory, WPAuthor } from '../../types/wordpress';
import { cleanTextContent, getFullParagraphExcerpt } from './utils/contentCleaner';
import { formatRelativeTime } from './utils/timeFormatter';
import NetworkImage from '../common/NetworkImage';
import { useState } from 'react';

interface FeaturedStoryProps {
  exclusivePost: WPPostWithMedia; // Remove nullable, sekarang wajib ada post
  categories: WPCategory[];
  isNewExclusive?: boolean;
}

export default function FeaturedStory({ exclusivePost, categories, isNewExclusive = true }: FeaturedStoryProps) {
  const [imageError, setImageError] = useState(false);
  
  const getPostCategoryName = (post: WPPostWithMedia, allCategories: WPCategory[]): string => {
    if (!post.categories || post.categories.length === 0) return 'Uncategorized';
    
    const categoryId = typeof post.categories[0] === 'number' 
      ? post.categories[0] 
      : (post.categories[0] as any).id;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? cleanTextContent(category.name) : 'Uncategorized';
  };

  const cleanTitle = cleanTextContent(exclusivePost.title.rendered);
  const cleanAlt = cleanTextContent(exclusivePost.featured_media_alt || exclusivePost.title.rendered);
  const categoryName = getPostCategoryName(exclusivePost, categories);

  // Handle author avatar
  const getAuthorAvatarUrl = (author: WPAuthor): string => {
    if (typeof author.avatar_url === 'string') {
      return author.avatar_url;
    }
    if (author.avatar_url && typeof author.avatar_url === 'object' && 'url' in author.avatar_url) {
      return author.avatar_url.url;
    }
    return '';
  };

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Featured Image */}
      <div className="w-full h-80 relative bg-gradient-to-br from-gray-100 to-gray-200">
        {exclusivePost.featured_media_url && !imageError ? (
          <NetworkImage
            src={exclusivePost.featured_media_url}
            alt={cleanAlt}
            fill={true}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
            onError={() => {
              console.warn(`Failed to load image: ${exclusivePost.featured_media_url}`);
              setImageError(true);
            }}
          />
        ) : (
          // Fallback content
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {cleanTitle}
            </h3>
            <p className="text-gray-500 text-sm">
              {categoryName}
            </p>
          </div>
        )}
        
        {/* Badge untuk exclusive atau featured */}
        {isNewExclusive ? (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
              🔥 EXCLUSIVE STORY
            </span>
          </div>
        ) : (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              ⭐ FEATURED STORY
            </span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center">
            {isNewExclusive ? (
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                Exclusive Content
              </span>
            ) : (
              <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                Featured Story
              </span>
            )}
            <span className="text-gray-500 text-sm ml-3">
              {formatRelativeTime(exclusivePost.date)}
            </span>
          </div>
          
          {categoryName && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full font-medium border border-red-100">
                {categoryName}
              </span>
            </div>
          )}
        </div>
        
        <Link href={`/posts/${exclusivePost.slug}`}>
          <h2 
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors cursor-pointer leading-tight"
            dangerouslySetInnerHTML={{ __html: cleanTitle }} 
          />
        </Link>
        
        <div className="text-gray-700 leading-relaxed text-lg mb-6 line-clamp-3">
          {exclusivePost.excerpt?.rendered ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: getFullParagraphExcerpt(
                  exclusivePost.excerpt.rendered
                )
              }} 
            />
          ) : exclusivePost.content?.rendered ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: getFullParagraphExcerpt(
                  exclusivePost.content.rendered.substring(0, 300) + '...'
                )
              }} 
            />
          ) : (
            <p className="text-gray-500 italic">
              No content preview available...
            </p>
          )}
        </div>
        
        {/* Author info */}
        {exclusivePost.authors && exclusivePost.authors.length > 0 && (
          <div className="flex items-center mb-6 pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                {(() => {
                  const avatarUrl = getAuthorAvatarUrl(exclusivePost.authors[0]);
                  return avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={exclusivePost.authors[0].display_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-gray-300');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {exclusivePost.authors[0].display_name.charAt(0)}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{exclusivePost.authors[0].display_name}</p>
                <p className="text-gray-500 text-sm">Author</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link 
            href={`/posts/${exclusivePost.slug}`}
            className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span>{isNewExclusive ? 'Read Exclusive Story' : 'Read Full Story'}</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
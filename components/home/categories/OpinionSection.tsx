// components/home/categories/OpinionSection.tsx
import Link from 'next/link';
import { WPPost, WPCategory } from '../../../types/wordpress';
import { getPostUrl } from '../../../lib/wordpress';
import { cleanTextContent } from '../utils/contentCleaner';
import { formatRelativeTime } from '../utils/timeFormatter';
import { useState, useEffect } from 'react';

interface OpinionSectionProps {
  posts: WPPost[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function OpinionSection({ posts, categories, isLast = false }: OpinionSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (posts.length === 0) return null;

  const formatDateSafe = (dateString: string) => {
    // Always use simple format to avoid hydration mismatch
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % posts.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);

  const post = posts[currentIndex];

  return (
    <div className="w-full bg-gradient-to-br from-white via-gray-50 to-gray-100 p-6 rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-sm">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center tracking-wide">
           Opinion
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mt-2"></div>
      </div>

      {/* Current Opinion Post */}
      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="text-center transition-all duration-500 ease-in-out">
          {/* Profile Picture - Bigger and Centered */}
          {post.authors && post.authors.length > 0 && post.authors[0].avatar_url && (
            <div className="relative mb-4">
              <img
                src={post.authors[0].avatar_url.url}
                alt={post.authors[0].display_name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
          )}
          {/* Author Name */}
          <p className="text-sm text-gray-800 font-semibold mb-3 uppercase tracking-wide">
            {post.authors && post.authors.length > 0 ? post.authors[0].display_name : 'Unknown'}
          </p>
          {/* Title */}
          <Link href={getPostUrl(post)}>
            <h4
              className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors cursor-pointer line-clamp-2 mb-3 leading-tight"
              dangerouslySetInnerHTML={{ __html: cleanTextContent(post.title.rendered) }}
            />
          </Link>
          {/* Excerpt - Limited to 5 lines */}
          {post.excerpt?.rendered && (
            <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-5" dangerouslySetInnerHTML={{ __html: cleanTextContent(post.excerpt.rendered) }} />
          )}
          {/* Date and Time */}
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{formatDateSafe(post.date)}</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prev}
          className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors text-sm"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors text-sm"
        >
          Next →
        </button>
      </div>

      {/* View All Link */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <Link
          href={`/category/opinion`}
          className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
        >
          View all opinion stories
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Line break */}
      {!isLast && (
        <div className="border-t border-gray-300 my-6"></div>
      )}
    </div>
  );
}
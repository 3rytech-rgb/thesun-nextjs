import Link from 'next/link';
import type { BreakingNews as BreakingNewsType } from './types';
import { useEffect, useRef, useState } from 'react';

interface BreakingNewsProps {
  breakingNews: BreakingNewsType[];
  isLoading: boolean;
  isPaused: boolean;
  onHover: (hovering: boolean) => void;
  marqueeRef: React.RefObject<HTMLDivElement>;
}

// Helper function untuk get post link dengan fallback
function getPostLink(news: BreakingNewsType): string {
  // Jika ada slug, gunakan /posts/{slug}
  if (news.slug) {
    return `/posts/${news.slug}`;
  }
  
  // Jika ada link, gunakan link tersebut
  if (news.link) {
    return news.link;
  }
  
  // Fallback ke post id
  return `/posts/${news.id}`;
}

export default function BreakingNews({
  breakingNews,
  isLoading,
  isPaused,
  onHover,
  marqueeRef
}: BreakingNewsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [position, setPosition] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const SPEED = 120;

  useEffect(() => {
    if (breakingNews.length > 0 && contentRef.current) {
      const width = contentRef.current.scrollWidth;
      setContentWidth(width);
      setIsInitialized(true);
    }
  }, [breakingNews]);

  useEffect(() => {
    if (!isInitialized || isPaused || breakingNews.length === 0) return;

    let lastTimestamp: number;
    
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      setPosition(prev => {
        const newPos = prev - (SPEED * deltaTime) / 1000;
        
        if (Math.abs(newPos) >= contentWidth) {
          return 0;
        }
        
        return newPos;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInitialized, isPaused, breakingNews.length, SPEED, contentWidth]);

  useEffect(() => {
    setPosition(0);
  }, [breakingNews]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="bg-gradient-to-r from-red-600 to-red-600 py-3 overflow-hidden relative z-10"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="flex items-center">
        <div className="bg-blue-950 text-white px-4 py-2 font-bold text-sm z-10 flex-shrink-0 border-r border-blue-600">
          BREAKING NEWS
        </div>
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden relative min-h-[28px]"
        >
          {isLoading ? (
            <div className="text-center text-sm font-semibold text-white py-1">
              Loading latest news...
            </div>
          ) : breakingNews.length > 0 ? (
            <>
              <div 
                ref={marqueeRef}
                className="flex whitespace-nowrap absolute top-0 left-0"
                style={{
                  transform: `translateX(${position}px)`,
                  transition: isPaused ? 'transform 0.3s ease-out' : 'none'
                }}
              >
                <div 
                  ref={contentRef}
                  className="flex items-center flex-shrink-0"
                >
                  {breakingNews.map((news, index) => (
                    <div key={news.id} className="inline-flex items-center mx-8 flex-shrink-0">
                      {news.category && (
                        <span className="bg-blue-950/80 text-white px-3 py-1 rounded-full text-xs font-bold mr-3 border border-blue-600 whitespace-nowrap">
                          {news.category.toUpperCase()}
                        </span>
                      )}
                      <Link
                        href={getPostLink(news)}
                        className="text-sm font-bold text-white hover:text-blue-400 transition-colors duration-300 cursor-pointer whitespace-nowrap"
                      >
                        {news.title}
                      </Link>
                      {index < breakingNews.length - 1 && (
                        <span className="mx-4 text-blue-400">|</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center flex-shrink-0">
                  {breakingNews.map((news, index) => (
                    <div key={`${news.id}-dup`} className="inline-flex items-center mx-8 flex-shrink-0">
                      {news.category && (
                        <span className="bg-blue-950/80 text-white px-3 py-1 rounded-full text-xs font-bold mr-3 border border-blue-600 whitespace-nowrap">
                          {news.category.toUpperCase()}
                        </span>
                      )}
                      <Link
                        href={getPostLink(news)}
                        className="text-sm font-bold text-white hover:text-blue-400 transition-colors duration-300 cursor-pointer whitespace-nowrap"
                      >
                        {news.title}
                      </Link>
                      {index < breakingNews.length - 1 && (
                        <span className="mx-4 text-blue-400">|</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center flex-shrink-0">
                  {breakingNews.map((news, index) => (
                    <div key={`${news.id}-dup2`} className="inline-flex items-center mx-8 flex-shrink-0">
                      {news.category && (
                        <span className="bg-blue-950/80 text-white px-3 py-1 rounded-full text-xs font-bold mr-3 border border-blue-600 whitespace-nowrap">
                          {news.category.toUpperCase()}
                        </span>
                      )}
                      <Link
                        href={getPostLink(news)}
                        className="text-sm font-bold text-white hover:text-blue-400 transition-colors duration-300 cursor-pointer whitespace-nowrap"
                      >
                        {news.title}
                      </Link>
                      {index < breakingNews.length - 1 && (
                        <span className="mx-4 text-blue-400">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-sm font-semibold text-white py-1">
              No breaking news available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
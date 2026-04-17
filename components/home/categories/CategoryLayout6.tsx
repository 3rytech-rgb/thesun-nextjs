// components/home/categories/CategoryLayoutVideo.tsx
import Link from 'next/link';
import { WPPost, WPCategory } from '../../../types/wordpress';
import { cleanTextContent } from '../utils/contentCleaner';
import { formatRelativeTime } from '../utils/timeFormatter';
import { useState, useEffect, useRef } from 'react';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { high: { url: string } };
    publishedAt: string;
  };
}

interface CategoryLayout6Props {
  name: string;
  slug: string;
  categories: any[];
  isLast?: boolean;
}

export default function CategoryLayout6({
  name,
  slug,
  categories,
  isLast = false
}: CategoryLayout6Props) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const mockVideos: YouTubeVideo[] = [
    {
      id: { videoId: 'dQw4w9WgXcQ' },
      snippet: {
        title: 'Breaking News: Major Event',
        thumbnails: { high: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' } },
        publishedAt: new Date().toISOString()
      }
    },
    {
      id: { videoId: '9bZkp7q19f0' },
      snippet: {
        title: 'World News Update',
        thumbnails: { high: { url: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg' } },
        publishedAt: new Date().toISOString()
      }
    },
    {
      id: { videoId: 'jNQXAC9IVRw' },
      snippet: {
        title: 'Sports Highlights',
        thumbnails: { high: { url: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg' } },
        publishedAt: new Date().toISOString()
      }
    },
    {
      id: { videoId: 'hTWKbfoikeg' },
      snippet: {
        title: 'Technology News',
        thumbnails: { high: { url: 'https://img.youtube.com/vi/hTWKbfoikeg/maxresdefault.jpg' } },
        publishedAt: new Date().toISOString()
      }
    },
    {
      id: { videoId: 'kJQP7kiw5Fk' },
      snippet: {
        title: 'Entertainment News',
        thumbnails: { high: { url: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg' } },
        publishedAt: new Date().toISOString()
      }
    }
  ];

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = 'AIzaSyCexcmkW5KuyPUttlLqK91-l0yZo-NI6iM';
      const channelId = 'UC4FzPfZ9TQ3w4vK4zQXzMQ'; // The Sun Malaysia channel ID
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=the+sun+malaysia&type=video&part=snippet,id&order=date&maxResults=10`
        );
        const data = await response.json();
        console.log('API data:', data);
        if (data.items) {
          setVideos(data.items);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const itemWidth = 256; // w-64 = 16rem = 256px
      const scrollPosition = index * itemWidth;
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (videos.length === 0) return;
    const nextIndex = (currentIndex + 1) % Math.ceil(videos.length / 2);
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    if (videos.length === 0) return;
    const prevIndex = currentIndex === 0 ? Math.ceil(videos.length / 2) - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const itemWidth = 256;
      const newIndex = Math.round(container.scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };



  if (loading) {
    return (
      <div className="w-full bg-blue-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4"># {name}</h2>
        <p className="text-white">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full bg-blue-900 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4"># {name}</h2>
        <p className="text-white">No videos available.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-blue-900 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white"># {name}</h2>
        
        {/* Navigation Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group"
            aria-label="Previous video"
          >
            <svg 
              className="w-5 h-5 text-white transform group-hover:-translate-x-0.5 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 group"
            aria-label="Next video"
          >
            <svg 
              className="w-5 h-5 text-white transform group-hover:translate-x-0.5 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Carousel Container */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide scroll-smooth"
          onScroll={handleScroll}
        >
          {videos.map((video, index) => (
            <div
              key={video.id.videoId}
              className="flex-shrink-0 w-64"
            >
              <div
                className="relative cursor-pointer group"
                onClick={() => handleVideoClick(video.id.videoId)}
              >
                {/* Portrait Video Thumbnail */}
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl">
                  <img
                    src={video.snippet.thumbnails.high.url}
                    alt={video.snippet.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-sm font-semibold mt-3 line-clamp-2 group-hover:text-blue-200 transition-colors duration-300">{video.snippet.title}</h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-1.5 mt-6">
          {Array.from({ length: Math.ceil(videos.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BreakingNews from './BreakingNews';
import DesktopNav from './DesktopNav';
import MobileSidebar from './MobileSidebar';
import DesktopCanvasModal from './DesktopCanvasModal';
import type { CategoryItem, BreakingNews as BreakingNewsType } from './types';
import type { WPCategory } from '../../../types/wordpress';

interface HeaderProps {
  categories?: WPCategory[];
}

// Helper function untuk dapatkan WordPress API URL secara dynamic
function getWordPressApiUrl(): string {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    
    if (host.startsWith('190.254')) {
      return `${protocol}//${host}/wp-json`;
    }
    
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://sunmedia-local.local/wp-json';
    }
  }
  
  return process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp/v2', '') || 'http://sunmedia-local.local/wp-json';
}

// Helper function untuk generate slug dari title
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function Header({ categories = [] }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Clean category names
  const cleanCategories = categories
    .map(cat => ({
      ...cat,
      name: cat.name
        .replace(/&amp;/g, '&')
        .replace(/&#8217;/g, "'")
        .replace(/&#038;/g, '&')
        .replace(/&#8211;/g, '-')
        .replace(/&#8212;/g, '--')
        .replace(/&#8230;/g, '...')
        .replace(/&[#\w]+;/g, '')
        .trim()
    }))
    .filter(cat => cat.name.toLowerCase() !== 'uncategorized');

 // GANTIKAN SELURUH fungsi fetchBreakingNews dalam useEffect dengan ini:
const fetchBreakingNews = async () => {
  try {
    setIsLoading(true);
    
    // GUNA INI SAHAJA - lebih simple dan efektif
    const apiUrl = 'https://thesun.my/wp-json';
    
    console.log('🌐 [FETCH] API URL:', apiUrl);
    
    // Fetch dengan timeout dan signal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    // Request TIDAK PERLU category details sekarang
    const response = await fetch(
      `${apiUrl}/wp/v2/posts?per_page=5&_fields=id,title,slug,link,_embedded&_embed=wp:term`,
      {
        signal: controller.signal,
        mode: 'cors', // Explicitly request CORS
        credentials: 'omit', // No cookies needed
      }
    );
    
    clearTimeout(timeoutId);
    
    console.log('🌐 [FETCH] Status:', response.status, response.statusText);
    
    if (!response.ok) {
      // Check untuk CORS error
      if (response.status === 0) {
        throw new Error('CORS error or network issue. Check browser console.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const posts = await response.json();
    console.log('✅ [FETCH] Posts received:', posts.length);
    console.log('📄 [FETCH] First post sample:', posts[0]);
    
    if (posts && posts.length > 0) {
      // Process posts dengan cara yang lebih efisien
      const newsItems: BreakingNewsType[] = posts.map((post: any) => {
        // Dapatkan category dari _embedded jika ada
        let categoryName = 'News';
        if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]) {
          const firstCategory = post._embedded['wp:term'][0][0];
          if (firstCategory && firstCategory.name) {
            categoryName = firstCategory.name;
          }
        }
        
        return {
          id: post.id,
          title: cleanHtmlContent(post.title.rendered || post.title),
          slug: post.slug,
          link: post.link || `/posts/${post.slug || post.id}`,
          category: categoryName
        };
      });
      
      console.log('✅ [FETCH] Processed news items:', newsItems);
      setBreakingNews(newsItems);
    } else {
      console.warn('⚠️ No posts returned from API');
      throw new Error('API returned empty posts array');
    }
    
  } catch (error) {
    console.error('❌ [FETCH ERROR] Details:', error);
    
    // Fallback data untuk development
    const fallbackNews: BreakingNewsType[] = [
      { 
        id: 1, 
        title: "Breaking News: TheSun.my Website Updates", 
        slug: "website-updates",
        link: "/posts/website-updates",
        category: "Announcement"
      },
      { 
        id: 2, 
        title: "Latest Stories from The Sun Malaysia", 
        slug: "latest-stories",
        link: "/posts/latest-stories",
        category: "News"
      },
      { 
        id: 3, 
        title: "Stay Tuned for More Updates", 
        slug: "stay-tuned",
        link: "/posts/stay-tuned",
        category: "Updates"
      }
    ];
    
    setBreakingNews(fallbackNews);
    
  } finally {
    setIsLoading(false);
  }
};
// Helper function untuk clean HTML
function cleanHtmlContent(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&[#\w]+;/g, '')
    .trim();
}

  // Auto update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
      
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      };
      const timeString = now.toLocaleTimeString('en-US', timeOptions);
      setCurrentTime(`${timeString} • Malaysia`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Group categories by parent
  const parentCategories = cleanCategories.filter(cat => cat.parent === 0);
  const childCategories = cleanCategories.filter(cat => cat.parent !== 0);

  // Function to get sub-categories for a parent
  const getSubCategories = (parentId: number) => {
    return childCategories.filter(cat => cat.parent === parentId);
  };

  // Helper function untuk mencari category ID berdasarkan nama
  const findCategoryId = (categoryName: string): number => {
    const category = parentCategories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category ? category.id : 0;
  };

  // Define main navbar items dengan sub-categories
  const mainNavItems: CategoryItem[] = [
    { name: 'Home', slug: '/', id: 0, hot: false },
    { 
      name: 'News', 
      slug: 'news', 
      id: 1, 
      hot: true,
      subItems: getSubCategories(findCategoryId('News'))
    },
    { 
      name: 'Berita', 
      slug: 'berita', 
      id: 5, 
      hot: true,
      subItems: getSubCategories(findCategoryId('Berita'))
    },
    { 
      name: 'Business', 
      slug: 'business', 
      id: 2, 
      hot: false,
      subItems: getSubCategories(findCategoryId('Business'))
    },
    { 
      name: 'Going Viral', 
      slug: 'going-viral', 
      id: 7, 
      hot: true,
      subItems: getSubCategories(findCategoryId('Going Viral'))
    },
    { 
      name: 'Lifestyle', 
      slug: 'lifestyle', 
      id: 3, 
      hot: false,
      subItems: getSubCategories(findCategoryId('Lifestyle'))
    },
    { 
      name: 'Sports', 
      slug: 'sports', 
      id: 4, 
      hot: true,
      subItems: getSubCategories(findCategoryId('Sports'))
    },
    { name: 'ipaper', slug: 'https://thesun-ipaper.cld.bz/', id: 13, hot: false, external: true },
    { 
      name: 'More', 
      slug: 'more', 
      id: 9, 
      hot: false,
      subItems: [
        { name: 'Motoring', slug: 'motoring', id: 6 },
        { name: 'Opinion', slug: 'opinion', id: 8 },
        { name: 'Classifieds', slug: 'classifieds', id: 10 },
        { name: 'Spotlight', slug: 'spotlight', id: 11 },
        { name: 'Education', slug: 'education', id: 12 }
      ]
    }
  ];

  // Define categories untuk canvas (2 rows)
  const canvasCategories = {
    row1: [
      { name: 'Home', slug: '/', id: 0, hot: false, subItems: [] },
      { name: 'News', slug: 'news', id: 1, hot: true, subItems: getSubCategories(findCategoryId('News')) },
      { name: 'Business', slug: 'business', id: 2, hot: false, subItems: getSubCategories(findCategoryId('Business')) },
      { name: 'Lifestyle', slug: 'lifestyle', id: 3, hot: false, subItems: getSubCategories(findCategoryId('Lifestyle')) },
      { name: 'Sports', slug: 'sports', id: 4, hot: true, subItems: getSubCategories(findCategoryId('Sports')) }
    ],
    row2: [
      { name: 'Berita', slug: 'berita', id: 5, hot: true, subItems: getSubCategories(findCategoryId('Berita')) },
      { name: 'Motoring', slug: 'motoring', id: 6, hot: false, subItems: getSubCategories(findCategoryId('Motoring')) },
      { name: 'Going Viral', slug: 'going-viral', id: 7, hot: true, subItems: getSubCategories(findCategoryId('Going Viral')) },
      { name: 'Opinion', slug: 'opinion', id: 8, hot: false, subItems: getSubCategories(findCategoryId('Opinion')) },
      { 
        name: 'More', 
        slug: 'more', 
        id: 9, 
        hot: false, 
        subItems: [
          { name: 'Classifieds', slug: 'classifieds', id: 10 },
          { name: 'Spotlight', slug: 'spotlight', id: 11 },
          { name: 'Education', slug: 'education', id: 12 }
        ]
      }
    ]
  };

  const toggleDropdown = (categoryId: number) => {
    setActiveDropdown(activeDropdown === categoryId ? null : categoryId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleBreakingNewsHover = (hovering: boolean) => {
    setIsPaused(hovering);
    
    if (marqueeRef.current) {
      if (hovering) {
        marqueeRef.current.style.animationPlayState = 'paused';
      } else {
        marqueeRef.current.style.animationPlayState = 'running';
      }
    }
  };

  // Snowflake Component
  const Snowflake = ({ id }: { id: number }) => {
    const size = Math.random() * 5 + 3;
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 3 + 5;
    
    return (
      <div
        className="absolute top-0 rounded-full bg-white opacity-80 pointer-events-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animation: `fall ${duration}s linear ${delay}s infinite`,
          filter: 'blur(0.5px)'
        }}
      />
    );
  };

  return (
    <header className="relative z-50 bg-slate-900 text-white">
      {/* Snow Animation */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <Snowflake key={i} id={i} />
        ))}
      </div>
      
      {/* Main Header Content */}
      <div className="relative z-20">
        <BreakingNews
          breakingNews={breakingNews}
          isLoading={isLoading}
          isPaused={isPaused}
          onHover={handleBreakingNewsHover}
          marqueeRef={marqueeRef}
        />
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center mb-4 lg:mb-0">
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-lg hover:bg-slate-800 transition-colors duration-200 group"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isSidebarOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}></span>
                  <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isSidebarOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isSidebarOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}></span>
                </div>
              </button>
              
              <Link href="/" className="inline-block">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/images/thesun-christmas.png"
                    alt="THE SUN MALAYSIA"
                    className="h-24 lg:h-28 w-auto cursor-pointer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-xl">
                      THE SUN
                    </h1>
                    <p className="text-blue-200 text-sm mt-1 text-center">MALAYSIA</p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="text-center lg:text-right mb-4 lg:mb-0">
              <div className="text-lg font-semibold">
                {currentDate || 'Loading...'}
              </div>
              <div className="text-blue-200 text-sm">
                {currentTime || 'Loading...'}
              </div>
            </div>
          </div>
          
          <DesktopNav
            mainNavItems={mainNavItems}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
            setActiveDropdown={setActiveDropdown}
            dropdownContainerRef={dropdownContainerRef}
          />
        </div>
      </div>

      <MobileSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        mainNavItems={mainNavItems}
      />

      <DesktopCanvasModal 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        canvasCategories={canvasCategories}
      />

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
          animation-play-state: running;
        }

        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @media (max-width: 768px) {
          .animate-marquee {
            animation-duration: 20s;
          }
        }
      `}</style>
    </header>
  );
}
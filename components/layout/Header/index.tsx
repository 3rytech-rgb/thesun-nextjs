'use client';

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
      name: cleanHtmlContent(cat.name)
    }))
    .filter(cat => cat.name.toLowerCase() !== 'uncategorized');

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

  // SIMPLE FETCH BREAKING NEWS - DIPERBAIKI UNTUK ROUTING YANG BETUL
  const fetchBreakingNews = async () => {
    try {
      setIsLoading(true);
      
      // URL API
      const apiUrl = 'https://thesun.my/wp-json/wp/v2/posts';
      
      console.log('📡 Fetching breaking news from:', apiUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Fetch data dari WordPress API
      const response = await fetch(
        `${apiUrl}?per_page=10&_embed=wp:term`,
        {
          signal: controller.signal,
          cache: 'no-cache'
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const posts = await response.json();
      console.log('✅ Received posts:', posts?.length || 0);
      
      // Transform data ke format breaking news DENGAN LINK YANG BETUL
      const newsItems: BreakingNewsType[] = posts.map((post: any) => {
        // Dapatkan kategori
        let category = 'News';
        if (post._embedded?.['wp:term']?.[0]?.[0]?.name) {
          category = post._embedded['wp:term'][0][0].name;
        }
        
        // PENTING: Generate link yang match dengan pages/posts/[slug].tsx
        // WordPress biasanya ada format: https://thesun.my/some-slug/
        // Kita perlu convert ke: /posts/some-slug
        let postLink = '';
        
        if (post.slug) {
          // Format: /posts/[slug] - INI YANG MATCH DENGAN pages/posts/[slug].tsx
          postLink = `/posts/${post.slug}`;
        } else if (post.link) {
          // Jika ada WordPress link, extract slug dari link tersebut
          const url = new URL(post.link);
          const slugFromLink = url.pathname.split('/').filter(Boolean).pop();
          postLink = `/posts/${slugFromLink || post.id}`;
        } else {
          // Fallback ke ID
          postLink = `/posts/${post.id}`;
        }
        
        console.log('📝 Post:', {
          id: post.id,
          slug: post.slug,
          link: postLink,
          title: post.title?.rendered?.substring(0, 30)
        });
        
        return {
          id: post.id,
          title: cleanHtmlContent(post.title?.rendered || 'No title'),
          slug: post.slug,
          link: postLink, // PENTING: Link yang betul untuk routing
          category: category
        };
      });
      
      console.log('✅ Processed news items:', newsItems.length);
      console.log('🔗 First item link:', newsItems[0]?.link);
      setBreakingNews(newsItems);
      
    } catch (error) {
      console.error('❌ Error fetching breaking news:', error);
      
      // FALLBACK DATA dengan link yang betul
      const fallbackNews: BreakingNewsType[] = [
        { 
          id: 1, 
          title: "PM Anwar umum cadangan kenaikan gaji minimum", 
          slug: "pm-anwar-umum-cadangan-kenaikan-gaji-minimum",
          link: "/posts/pm-anwar-umum-cadangan-kenaikan-gaji-minimum", // Format betul
          category: "Politik"
        },
        { 
          id: 2, 
          title: "Harga petrol, diesel turun mulai esok", 
          slug: "harga-petrol-diesel-turun-mulai-esok",
          link: "/posts/harga-petrol-diesel-turun-mulai-esok", // Format betul
          category: "Ekonomi"
        },
        { 
          id: 3, 
          title: "Malaysia tuan rumah Piala Asia 2027", 
          slug: "malaysia-tuan-rumah-piala-asia-2027",
          link: "/posts/malaysia-tuan-rumah-piala-asia-2027", // Format betul
          category: "Sukan"
        },
        { 
          id: 4, 
          title: "Pendakian Gunung Kinabalu dibuka semula", 
          slug: "pendakian-gunung-kinabalu-dibuka-semula",
          link: "/posts/pendakian-gunung-kinabalu-dibuka-semula", // Format betul
          category: "Pelancongan"
        },
        { 
          id: 5, 
          title: "AI ubah landskap pendidikan tinggi", 
          slug: "ai-ubah-landskap-pendidikan-tinggi",
          link: "/posts/ai-ubah-landskap-pendidikan-tinggi", // Format betul
          category: "Pendidikan"
        }
      ];
      
      console.log('⚠️ Using fallback data');
      setBreakingNews(fallbackNews);
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading state set to false');
    }
  };

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

  // Fetch breaking news pada mount
  useEffect(() => {
    console.log('🚀 Header mounted, fetching breaking news...');
    console.log('📍 Current route structure expects: /posts/[slug]');
    fetchBreakingNews();
    
    // Refresh setiap 5 minit
    const refreshInterval = setInterval(fetchBreakingNews, 5 * 60 * 1000);
    
    return () => {
      console.log('🧹 Cleaning up header');
      clearInterval(refreshInterval);
    };
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
      `}</style>
    </header>
  );
}
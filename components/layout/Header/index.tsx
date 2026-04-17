'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BreakingNews from './BreakingNews';
import DesktopNav from './DesktopNav';
import MobileSidebar from './MobileSidebar';
import DesktopCanvasModal from './DesktopCanvasModal';
import type { CategoryItem, BreakingNews as BreakingNewsType } from './types';
import type { WPCategory } from '../../../types/wordpress';
import { getPostUrl } from '../../../lib/wordpress';

// Import komponen animasi baru

import RayaAnimation from './rayaanimation'; // Animasi Hari Raya baru

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
  const [showRayaAnimation, setShowRayaAnimation] = useState(true); // State untuk toggle animasi raya
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Clean category names
  function cleanHtmlContent(html: string): string {
    if (!html || typeof html !== 'string') return '';
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

      // Use only the public API - remove internal IP address
      const apiUrl = 'https://thesun.my/wp-json/wp/v2/posts';
      console.log('📡 Fetching breaking news from API:', apiUrl);

      let response;
      try {
        response = await fetch(
          `${apiUrl}?per_page=10&_embed=wp:term`,
          {
            cache: 'no-cache',
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        console.log('✅ API fetch successful');
      } catch (fetchError) {
        console.warn('⚠️ API fetch failed:', fetchError);
        // Return empty array instead of throwing error
        setBreakingNews([]);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        console.warn(`⚠️ API response not OK: ${response.status} ${response.statusText}`);
        // Return empty array instead of throwing error
        setBreakingNews([]);
        setIsLoading(false);
        return;
      }
      
      let posts;
      try {
        posts = await response.json();
        console.log('✅ Received posts:', posts?.length || 0);
      } catch (jsonError) {
        console.warn('⚠️ Failed to parse JSON response:', jsonError);
        setBreakingNews([]);
        setIsLoading(false);
        return;
      }
      
      // Transform data ke format breaking news DENGAN LINK YANG BETUL
      const newsItems: BreakingNewsType[] = posts.map((post: any) => {
        // Dapatkan kategori
        let category = 'News';
        if (post._embedded?.['wp:term']?.[0]?.[0]?.name) {
          category = post._embedded['wp:term'][0][0].name;
        }
        
        // PENTING: Generate link yang match dengan pages/[category]/[slug].tsx
        // Format: /{shortenedCategorySlug}/{postSlug}
        let postLink = '';

        // Use getPostUrl untuk consistency
        postLink = getPostUrl(post);
        
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
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Non-Error object:', error);
      }
      
      // FALLBACK DATA dengan link yang betul
      const fallbackNews: BreakingNewsType[] = [
        {
          id: 1,
          title: "Unable to load breaking news - using cached data",
          slug: "api-unavailable",
          link: "#", // No link for fallback
          category: "System"
        },
        {
          id: 2,
          title: "PM Anwar umum cadangan kenaikan gaji minimum",
          slug: "pm-anwar-umum-cadangan-kenaikan-gaji-minimum",
          link: "/politik/pm-anwar-umum-cadangan-kenaikan-gaji-minimum", // Category-based format
          category: "Politik"
        },
        {
          id: 3,
          title: "Harga petrol, diesel turun mulai esok",
          slug: "harga-petrol-diesel-turun-mulai-esok",
          link: "/ekonomi/harga-petrol-diesel-turun-mulai-esok", // Category-based format
          category: "Ekonomi"
        },
        {
          id: 4,
          title: "Malaysia tuan rumah Piala Asia 2027",
          slug: "malaysia-tuan-rumah-piala-asia-2027",
          link: "/sukan/malaysia-tuan-rumah-piala-asia-2027", // Category-based format
          category: "Sukan"
        },
        {
          id: 5,
          title: "Pendakian Gunung Kinabalu dibuka semula",
          slug: "pendakian-gunung-kinabalu-dibuka-semula",
          link: "/pelancongan/pendakian-gunung-kinabalu-dibuka-semula", // Category-based format
          category: "Pelancongan"
        }
      ];

      console.log('⚠️ API fetch failed, using fallback data');
      setBreakingNews(fallbackNews);
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading state set to false');
    }
  };

   // Auto update date and time - DIKECILKAN
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
      
      const timeOptions: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      };
      const timeString = now.toLocaleTimeString('en-US', timeOptions);
      setCurrentTime(`${timeString} • MY`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch breaking news pada mount
  useEffect(() => {
    console.log('🚀 Header mounted, fetching breaking news...');
    console.log('📍 Current route structure expects: /posts/[slug]');

    // Wrap in try-catch to prevent component crashes
    const safeFetchBreakingNews = async () => {
      try {
        await fetchBreakingNews();
      } catch (error) {
        console.error('💥 Critical error in fetchBreakingNews:', error);
        // Fallback is already handled inside fetchBreakingNews
      }
    };

    safeFetchBreakingNews();

    // Refresh setiap 5 minit
    const refreshInterval = setInterval(() => {
      safeFetchBreakingNews();
    }, 5 * 60 * 1000);

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

  // Process categories to clean HTML entities
  const cleanCategories = categories.map(cat => ({
    ...cat,
    name: cleanHtmlContent(cat.name)
  }));

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

  return (
    <header className="relative z-50 bg-slate-900 text-white">
      {/* Ganti snow animation dengan komponen baru */}
      
      
      {/* Animasi Hari Raya */}
      {showRayaAnimation && <RayaAnimation />}
      
      {/* Main Header Content */}
      <div className="relative z-20">
        <BreakingNews
          breakingNews={breakingNews}
          isLoading={isLoading}
          isPaused={isPaused}
          onHover={handleBreakingNewsHover}
          marqueeRef={marqueeRef}
        />
        
        <div className="w-full py-1">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center mb-1 lg:mb-0">
              <button
                onClick={toggleSidebar}
                className="mr-1 p-1 rounded-lg hover:bg-slate-800 transition-colors duration-200 group"
                aria-label="Toggle menu"
              >
                <div className="w-4 h-4 flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}></span>
                  <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isSidebarOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}></span>
                </div>
              </button>
              
              <Link href="/" className="inline-block">
                <div className="flex items-center space-x-1">
                   <div className="relative">
                    <img 
                      src="/images/thesun-raya.png"
                      alt="THE SUN MALAYSIA"
                      className="h-12 lg:h-14 w-auto cursor-pointer relative z-10 transform hover:scale-105 transition-transform duration-300 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  </div>
                  <div className="hidden">
                    <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-xl">
                      THE SUN
                    </h1>
                    <p className="text-blue-200 text-xs mt-0.5 text-center">MALAYSIA</p>
                  </div>
                </div>
              </Link>

              {/* Raya Animation Toggle Button - Modern */}
              <button
                onClick={() => setShowRayaAnimation(!showRayaAnimation)}
                className="ml-1 p-0.5 rounded-lg hover:bg-slate-800/50 transition-all duration-300 group relative"
                aria-label={showRayaAnimation ? "Disable Raya animation" : "Enable Raya animation"}
                title={showRayaAnimation ? "Disable Hari Raya animation" : "Enable Hari Raya animation"}
              >
                <div className="relative w-3 h-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-sm transition-all duration-500 ${
                      showRayaAnimation 
                        ? 'bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_3px_rgba(52,211,153,0.5)] rotate-45' 
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}></div>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="text-center lg:text-right mb-1 lg:mb-0">
               <div className="text-xs font-medium" suppressHydrationWarning>
                 {currentDate || 'Loading...'}
               </div>
               <div className="text-blue-200 text-xs" suppressHydrationWarning>
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
    </header>
  );
}
import React, { useState } from 'react';
import Head from 'next/head';
import Header from './Header/';
import Sidebar from './Header/Sidebar';
import Footer from './Footer';
import WCPopup from '../common/WCPopup';
import { CountdownBanner } from '../ads/CountdownBanner';
import { WPCategory } from '../../types/wordpress';
import { CategoryItem } from './Header/types';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  categories?: WPCategory[];
  hideContentBackground?: boolean;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'The Sun Malaysia: Latest News, Trending & Viral Stories Today', 
  description = 'Get the latest breaking news, trending stories, and viral content from Malaysia and around the world. The Sun Malaysia brings you trusted news on national, business, sports, and lifestyle.',
  categories = [],
  hideContentBackground = false,
  fullWidth = false
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const mainNavItems: CategoryItem[] = [
    { name: 'Home', slug: '/', id: 0, hot: false },
    { name: 'News', slug: 'news', id: 1, hot: true },
    { name: 'Berita', slug: 'berita', id: 5, hot: true },
    { name: 'Business', slug: 'business', id: 2, hot: false },
    { name: 'Going Viral', slug: 'going-viral', id: 7, hot: true },
    { name: 'Lifestyle', slug: 'lifestyle', id: 3, hot: false },
    { name: 'Sports', slug: 'sports', id: 4, hot: true },
    { name: 'ipaper', slug: 'https://thesun-ipaper.cld.bz/', id: 13, hot: false, external: true },
    { name: 'Our Team', slug: '/our-team', id: 14, hot: false },
    { name: 'World Cup 2026', slug: '/wcpage', id: 15, hot: true },
    { name: 'Motoring', slug: 'motoring', id: 6, hot: false },
    { name: 'Opinion', slug: 'opinion', id: 8, hot: false },
    { name: 'Classifieds', slug: 'https://sunmedia.com.my/', id: 10, hot: false, external: true },
    { name: 'Spotlight', slug: 'spotlight', id: 11, hot: false },
    { name: 'Education', slug: 'education', id: 12, hot: false },
  ];

  const canvasCategories = {
    row1: [
      { name: 'Home', slug: '/', id: 0, hot: false, subItems: [] },
      { name: 'News', slug: 'news', id: 1, hot: true, subItems: [] },
      { name: 'Berita', slug: 'berita', id: 5, hot: true, subItems: [] },
      { name: 'Business', slug: 'business', id: 2, hot: false, subItems: [] },
      { name: 'Going Viral', slug: 'going-viral', id: 7, hot: true, subItems: [] },
    ],
    row2: [
      { name: 'Lifestyle', slug: 'lifestyle', id: 3, hot: false, subItems: [] },
      { name: 'Sports', slug: 'sports', id: 4, hot: true, subItems: [] },
      { name: 'Motoring', slug: 'motoring', id: 6, hot: false, subItems: [] },
      { name: 'Opinion', slug: 'opinion', id: 8, hot: false, subItems: [] },
      { name: 'Our Team', slug: '/our-team', id: 14, hot: false, subItems: [] },
    ],
    row3: [
      { name: 'World Cup 2026', slug: '/wcpage', id: 15, hot: true, subItems: [] },
      { name: 'Classifieds', slug: 'https://sunmedia.com.my/', id: 10, hot: false, external: true, subItems: [] },
      { name: 'Spotlight', slug: 'spotlight', id: 11, hot: false, subItems: [] },
      { name: 'Education', slug: 'education', id: 12, hot: false, subItems: [] },
    ]
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="The Sun Malaysia | News & Trending Stories" />
        <meta name="keywords" content="The Sun Malaysia, Malaysian news, breaking news Malaysia, trending news, viral stories, Malaysia latest news, Berita Malaysia, Malaysia today, national news, world news, business news, sports news Malaysia" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-purple-100">
        <div className="relative z-50">
          <Header categories={categories} isSidebarOpen={isSidebarOpen} onSidebarToggle={toggleSidebar} />
        </div>

        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          mainNavItems={mainNavItems}
        />

        <div className="h-[180px] lg:h-[220px]"></div>

        <div className="max-w-[1200px] mx-auto px-1 sm:px-2">
          <CountdownBanner
            targetDate={new Date('2026-06-11T23:59:59')}
            backgroundImage="/images/banner-wc-cd.png"
            link="https://thesun.my"
          />
        </div>

        <WCPopup />

        <main className={`relative z-10 mt-0 ${!hideContentBackground ? 'py-6 md:py-8' : ''}`}>
          {hideContentBackground ? (
            <div className={`${fullWidth ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8'}`}>
              {children}
            </div>
          ) : (
            <div className="container mx-auto px-1 sm:px-2">
              <div className="bg-gradient-to-br from-white via-white to-blue-50 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl-lg"></div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20">
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr-lg"></div>
                </div>
                <div className="p-2 sm:p-3">
                  {children}
                </div>
                <div className="absolute bottom-0 left-0 w-20 h-20">
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-300 rounded-bl-lg"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20">
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-300 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          )}
        </main>

        <div className="relative z-10 mt-8 md:mt-12">
          <Footer />
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #dc2626, #ef4444); border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #b91c1c, #dc2626); }
        ::selection { background-color: rgba(239, 68, 68, 0.3); color: white; }
        html { scroll-behavior: smooth; }
        @media print { .no-print { display: none !important; } main { box-shadow: none !important; background: white !important; } }
      `}</style>
    </>
  );
};

export default Layout;
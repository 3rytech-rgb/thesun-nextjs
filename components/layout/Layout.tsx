import React from 'react';
import Head from 'next/head';
import Header from './Header/';
import Footer from './Footer';
import { WPCategory } from '../../types/wordpress';

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
  title = 'The Sun Malaysia', 
  description = 'The Sun Malaysia - Latest Breaking News, Sports, Lifestyle, Business and Entertainment',
  categories = [],
  hideContentBackground = false,
  fullWidth = false
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="The Sun Malaysia" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      
      {/* Main layout container */}
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {/* Header */}
        <div className="relative z-50">
          <Header categories={categories} />
        </div>
        
        {/* Main content area */}
        <main className={`relative z-10 mt-0 ${!hideContentBackground ? 'py-6 md:py-8' : ''}`}>
          {hideContentBackground ? (
            // Tanpa background putih
            <div className={`${fullWidth ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8'}`}>
              {children}
            </div>
          ) : (
            // Dengan background putih (default)
            <div className="container mx-auto px-4 sm:px-6">
              {/* REMOVED: Gradient border top - ini yang buat garisan merah */}
              
              <div className="bg-white rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Optional: Decorative corner accents (boleh keep atau buang) */}
                <div className="absolute top-0 left-0 w-20 h-20">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl-lg"></div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20">
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr-lg"></div>
                </div>
                
                {/* Content container */}
                <div className={`p-4 sm:p-6 lg:p-8 ${fullWidth ? '' : 'max-w-7xl mx-auto'}`}>
                  {children}
                </div>
                
                {/* Optional: Decorative bottom corners */}
                <div className="absolute bottom-0 left-0 w-20 h-20">
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-300 rounded-bl-lg"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20">
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-300 rounded-br-lg"></div>
                </div>
              </div>
              
              {/* REMOVED: Shadow effect */}
            </div>
          )}
        </main>
        
        {/* Footer */}
        <div className="relative z-10 mt-8 md:mt-12">
          <Footer />
        </div>
        
        {/* Back to top button (optional) */}
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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #991b1b);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ef4444, #dc2626);
        }
        
        /* Selection color */
        ::selection {
          background-color: rgba(239, 68, 68, 0.3);
          color: white;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
          
          main {
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
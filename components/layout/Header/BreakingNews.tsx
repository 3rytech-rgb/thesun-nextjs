'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { BreakingNews as BreakingNewsType } from './types';
import { cleanHtmlContent } from '../../home/utils/contentCleaner';

interface BreakingNewsProps {
  breakingNews: BreakingNewsType[];
  isLoading: boolean;
  isPaused: boolean;
  onHover: (hovering: boolean) => void;
  marqueeRef: React.RefObject<HTMLDivElement>;
}

export default function BreakingNews({
  breakingNews,
  isLoading,
  isPaused,
  onHover,
  marqueeRef
}: BreakingNewsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const animationRef = useRef<number>();

  const SPEED = 50; // Pixels per second



  // Social media links
  const socialMediaLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/thesun.my/',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'hover:bg-blue-700'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/thesun.my/',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm4.965 10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001zm-4.965 1.696a4.162 4.162 0 1 1-.001-8.324 4.162 4.162 0 0 1 .001 8.324zm0-2.162a2 2 0 1 0-.001-4.001 2 2 0 0 0 .001 4.001z"/>
        </svg>
      ),
      color: 'hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-yellow-500'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/thesuntelegram',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: 'hover:bg-blue-500'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@thesun.my',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      color: 'hover:bg-gray-900'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/thesun.my',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'hover:bg-black'
    },
    {
      name: 'WhatsApp',
      url: 'https://www.whatsapp.com/channel/0029Vb5YWVOAO7REL4UZuD06',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.9 6.994c-.004 5.45-4.436 9.88-9.885 9.88m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.333 .157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
        </svg>
      ),
      color: 'hover:bg-green-600'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/theSunMedia',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: 'hover:bg-red-600'
    }
  ];

  // Update content width
  useEffect(() => {
    if (breakingNews.length > 0 && contentRef.current) {
      // Tunggu sedikit untuk pastikan DOM ready
      setTimeout(() => {
        const width = contentRef.current?.scrollWidth || 0;
        setContentWidth(width);
      }, 100);
    }
  }, [breakingNews]);

  // Animation logic
  useEffect(() => {
    if (isLoading || isPaused || breakingNews.length === 0 || contentWidth === 0) {
      return;
    }

    let lastTime: number;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setPosition(prev => {
        let newPos = prev - (SPEED * deltaTime) / 1000;
        // Reset ketika habis content width
        if (newPos <= -contentWidth) {
          newPos = 0;
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
  }, [isLoading, isPaused, breakingNews.length, contentWidth]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Jika loading berterusan atau error, show fallback
  if (isLoading) {
    return (
      <div className="w-full bg-red-600 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="bg-blue-950 text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wider flex-shrink-0 border-r-2 border-yellow-400">
              BREAKING
            </div>
            <div className="ml-3 flex items-center flex-1">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-white text-sm">Loading breaking news...</span>
            </div>
            
            {/* Social Media Icons - Loading State */}
            <div className="hidden lg:flex items-center space-x-1 ml-4">
              {socialMediaLinks.map((social, index) => (
                <div
                  key={social.name}
                  className="w-7 h-7 rounded-full bg-blue-900/50 flex items-center justify-center opacity-50"
                  title={social.name}
                >
                  <div className="text-white opacity-70">
                    {social.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika tiada data
  if (breakingNews.length === 0) {
    return (
      <div className="w-full bg-red-600 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="bg-blue-950 text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wider flex-shrink-0 border-r-2 border-yellow-400">
              BREAKING
            </div>
            <div className="ml-3 text-white text-sm flex-1">Tiada berita terkini</div>
            
            {/* Social Media Icons - No Data State */}
            <div className="hidden lg:flex items-center space-x-1 ml-4">
              {socialMediaLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center hover:bg-blue-700 transition-all duration-200 group"
                  title={`Follow us on ${social.name}`}
                >
                  <div className="text-white group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-red-600 py-2 overflow-hidden relative"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          {/* Breaking News Label */}
          <div className="bg-blue-950 text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wider flex-shrink-0 border-r-2 border-yellow-400">
            BREAKING
          </div>
          
          {/* Marquee Container */}
          <div className="flex-1 overflow-hidden ml-3 h-6">
            <div 
              ref={marqueeRef}
              className="flex whitespace-nowrap h-full items-center"
              style={{ 
                transform: `translateX(${position}px)`,
                willChange: 'transform'
              }}
            >
              {/* Content */}
              <div 
                ref={contentRef}
                className="flex items-center space-x-8 pr-8"
              >
                 {breakingNews.map((news, index) => (
                   <div key={news.id} className="flex items-center">
                     {news.category && (
                       <span className="bg-blue-900 text-white px-3 py-0.5 rounded text-xs font-bold mr-3 whitespace-nowrap">
                         {cleanHtmlContent(news.category)}
                       </span>
                     )}
                     <Link
                       href={news.link}
                       className="text-white hover:text-yellow-300 text-sm font-medium whitespace-nowrap transition-colors"
                     >
                       {cleanHtmlContent(news.title)}
                     </Link>
                     {index < breakingNews.length - 1 && (
                       <div className="w-8 text-center">
                         <span className="text-yellow-300">•</span>
                       </div>
                     )}
                   </div>
                 ))}
              </div>
              
               {/* Duplicate for seamless loop */}
               <div className="flex items-center space-x-8 pr-8">
                 {breakingNews.map((news, index) => (
                   <div key={`${news.id}-dup`} className="flex items-center">
                     {news.category && (
                       <span className="bg-blue-900 text-white px-3 py-0.5 rounded text-xs font-bold mr-3 whitespace-nowrap">
                         {cleanHtmlContent(news.category)}
                       </span>
                     )}
                     <Link
                       href={news.link}
                       className="text-white hover:text-yellow-300 text-sm font-medium whitespace-nowrap transition-colors"
                     >
                       {cleanHtmlContent(news.title)}
                     </Link>
                     {index < breakingNews.length - 1 && (
                       <div className="w-8 text-center">
                         <span className="text-yellow-300">•</span>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </div>
          
          {/* Social Media Icons Container */}
          <div className="hidden lg:flex items-center space-x-1 ml-4">
            {socialMediaLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center transition-all duration-200 group relative ${social.color}`}
                title={`Follow us on ${social.name}`}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {social.name}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
                
                {/* Icon */}
                <div className="text-white group-hover:scale-110 transition-transform">
                  {social.icon}
                </div>
              </a>
            ))}
          </div>
          
          {/* Mobile Social Media - Simplified */}
          <div className="lg:hidden ml-4">
            <div className="relative group">
              <button className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              
              {/* Mobile Social Media Dropdown */}
              <div className="absolute right-0 top-full mt-2 bg-blue-900 rounded-lg shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-2">
                  {socialMediaLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-700 transition-colors"
                      title={social.name}
                    >
                      <div className="text-white">
                        {social.icon}
                      </div>
                    </a>
                  ))}
                </div>
                <div className="absolute -top-2 right-3 w-4 h-4 bg-blue-900 transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
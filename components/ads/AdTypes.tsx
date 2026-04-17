// components/ads/AdTypes.tsx
// Jenis iklan A-I untuk The Sun Malaysia berdasarkan Rate Card DIGITAL 2025

import React from 'react';
import NetworkImage from '../common/NetworkImage';

export interface AdProps {
  id: string;
  title: string;
  advertiser: string;
  imageUrl: string;
  link: string;
  size: string;
  type: 'full-banner' | 'leaderboard' | 'medium-rectangle' | 'middle-banner' | 'bottom-panel';
  position: string;
  desktopSize: string;
  mobileSize: string;
  category?: string;
  priority?: number;
}

// Iklan A: FULL BANNER (UNDER MENU BAR)
export const AdFullBanner: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px] md:h-[300px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 1400px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan B: LEADERBOARD (5 CHANGES MAX)
export const AdLeaderboard: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px] md:h-[150px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 700px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan C: MEDIUM RECTANGULAR (350x300px)
export const AdMediumRectangular1: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[300px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="350px"
          />
        </div>
      </a>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{ad.title}</h3>
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan D: MEDIUM RECTANGULAR (300x250px)
export const AdMediumRectangular2: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[250px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="300px"
          />
        </div>
      </a>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{ad.title}</h3>
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan E: MIDDLE BANNER (UNDER HEADLINES)
export const AdMiddleBanner1: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm my-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 970px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan F: MIDDLE BANNER (UNDER VIDEOS)
export const AdMiddleBanner2: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm my-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 970px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan G: MIDDLE BANNER
export const AdMiddleBanner3: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm my-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 970px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan H: MIDDLE BANNER
export const AdMiddleBanner4: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm my-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 970px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Iklan I: BOTTOM PANEL
export const AdBottomPanel: React.FC<{ ad: AdProps }> = ({ ad }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm mt-6 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500">ADVERTISEMENT</span>
      </div>
      <a 
        href={ad.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full h-[100px]">
          <NetworkImage
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 320px, 970px"
          />
        </div>
      </a>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">{ad.advertiser}</p>
      </div>
    </div>
  );
};

// Ad Manager Component
export const AdManager: React.FC<{ type: string; ad: AdProps }> = ({ type, ad }) => {
  switch (type) {
    case 'A':
      return <AdFullBanner ad={ad} />;
    case 'B':
      return <AdLeaderboard ad={ad} />;
    case 'C':
      return <AdMediumRectangular1 ad={ad} />;
    case 'D':
      return <AdMediumRectangular2 ad={ad} />;
    case 'E':
      return <AdMiddleBanner1 ad={ad} />;
    case 'F':
      return <AdMiddleBanner2 ad={ad} />;
    case 'G':
      return <AdMiddleBanner3 ad={ad} />;
    case 'H':
      return <AdMiddleBanner4 ad={ad} />;
    case 'I':
      return <AdBottomPanel ad={ad} />;
    default:
      return <AdMediumRectangular1 ad={ad} />;
  }
};

// Sample ads data - contoh iklan untuk development
export const sampleAds: Record<string, AdProps> = {
  A: {
    id: 'ad-full-banner-001',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/1400x300/0066CC/FFFFFF?text=Advertisement+Banner',
    link: '#',
    size: '1400x300px (Desktop), 320x100px (Mobile)',
    type: 'full-banner',
    position: 'UNDER MENU BAR',
    desktopSize: '1400 x 300px',
    mobileSize: '320 x 100px',
    priority: 1
  },
  B: {
    id: 'ad-leaderboard-001',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/700x150/009933/FFFFFF?text=Leaderboard+Ad',
    link: '#',
    size: '700x150px (Desktop), 320x100px (Mobile)',
    type: 'leaderboard',
    position: 'LEADERBOARD',
    desktopSize: '700 x 150px',
    mobileSize: '320 x 100px',
    priority: 2
  },
  C: {
    id: 'ad-medium-rect-001',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/350x300/FF6600/FFFFFF?text=Medium+Rectangle',
    link: '#',
    size: '350x300px',
    type: 'medium-rectangle',
    position: 'SIDEBAR',
    desktopSize: '350 x 300px',
    mobileSize: 'N/A',
    priority: 3
  },
  D: {
    id: 'ad-medium-rect-002',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/300x250/9900CC/FFFFFF?text=Rectangle+Ad',
    link: '#',
    size: '300x250px',
    type: 'medium-rectangle',
    position: 'SIDEBAR',
    desktopSize: '300 x 250px',
    mobileSize: 'N/A',
    priority: 4
  },
  E: {
    id: 'ad-middle-banner-001',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/970x90/CC0000/FFFFFF?text=Middle+Banner+Ad',
    link: '#',
    size: '970x90px (Desktop), 320x100px (Mobile)',
    type: 'middle-banner',
    position: 'UNDER HEADLINES',
    desktopSize: '970 x 90px',
    mobileSize: '320 x 100px',
    priority: 5
  },
  F: {
    id: 'ad-middle-banner-002',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/970x90/009999/FFFFFF?text=Video+Section+Ad',
    link: '#',
    size: '970x90px (Desktop), 320x100px (Mobile)',
    type: 'middle-banner',
    position: 'UNDER VIDEOS',
    desktopSize: '970 x 90px',
    mobileSize: '320 x 100px',
    priority: 6
  },
  G: {
    id: 'ad-middle-banner-003',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/970x90/666699/FFFFFF?text=In-Content+Ad',
    link: '#',
    size: '970x90px (Desktop), 320x100px (Mobile)',
    type: 'middle-banner',
    position: 'IN-CONTENT',
    desktopSize: '970 x 90px',
    mobileSize: '320 x 100px',
    priority: 7
  },
  H: {
    id: 'ad-middle-banner-004',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/970x90/3366FF/FFFFFF?text=Before+Comments+Ad',
    link: '#',
    size: '970x90px (Desktop), 320x100px (Mobile)',
    type: 'middle-banner',
    position: 'BEFORE COMMENTS',
    desktopSize: '970 x 90px',
    mobileSize: '320 x 100px',
    priority: 8
  },
  I: {
    id: 'ad-bottom-panel-001',
    title: 'Advertisement Example',
    advertiser: 'Advertiser Name',
    imageUrl: 'https://via.placeholder.com/970x90/333333/FFFFFF?text=Bottom+Panel+Ad',
    link: '#',
    size: '970x90px (Desktop), 320x100px (Mobile)',
    type: 'bottom-panel',
    position: 'BOTTOM PANEL',
    desktopSize: '970 x 90px',
    mobileSize: '320 x 100px',
    priority: 9
  }
};
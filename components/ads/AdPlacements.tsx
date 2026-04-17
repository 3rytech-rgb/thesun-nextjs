// components/ads/AdPlacements.tsx
// Placement iklan A-I di berbagai posisi website

import React from 'react';
import { AdManager, sampleAds, AdProps } from './AdTypes';

// Placement untuk Header (A: FULL BANNER UNDER MENU BAR)
export const AdHeaderPlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.A;
  return (
    <div className="w-full">
      <AdManager type="A" ad={ad} />
    </div>
  );
};

// Placement untuk Sidebar Top (B: LEADERBOARD)
export const AdSidebarTopPlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.B;
  return (
    <div className="mb-6">
      <AdManager type="B" ad={ad} />
    </div>
  );
};

// Placement untuk Sidebar Middle (C: MEDIUM RECTANGULAR 350x300)
export const AdSidebarMiddlePlacement1: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.C;
  return (
    <div className="mb-6">
      <AdManager type="C" ad={ad} />
    </div>
  );
};

// Placement untuk Sidebar Middle (D: MEDIUM RECTANGULAR 300x250)
export const AdSidebarMiddlePlacement2: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.D;
  return (
    <div className="mb-6">
      <AdManager type="D" ad={ad} />
    </div>
  );
};

// Placement untuk Under Headlines (E: MIDDLE BANNER)
export const AdUnderHeadlinesPlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.E;
  return (
    <div className="my-8">
      <AdManager type="E" ad={ad} />
    </div>
  );
};

// Placement untuk Under Videos (F: MIDDLE BANNER)
export const AdUnderVideosPlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.F;
  return (
    <div className="my-8">
      <AdManager type="F" ad={ad} />
    </div>
  );
};

// Placement untuk In-Content Middle (G: MIDDLE BANNER)
export const AdInContentMiddlePlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.G;
  return (
    <div className="my-8">
      <AdManager type="G" ad={ad} />
    </div>
  );
};

// Placement untuk Before Comments (H: MIDDLE BANNER)
export const AdBeforeCommentsPlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.H;
  return (
    <div className="my-8">
      <AdManager type="H" ad={ad} />
    </div>
  );
};

// Placement untuk Footer (I: BOTTOM PANEL)
export const AdFooterPlacement: React.FC<{ customAd?: AdProps }> = ({ customAd }) => {
  const ad = customAd || sampleAds.I;
  return (
    <div className="mt-8">
      <AdManager type="I" ad={ad} />
    </div>
  );
};

// Container untuk semua placement iklan di halaman artikel
export const ArticleAdPlacements: React.FC = () => {
  return (
    <>
      {/* Iklan A: Full Banner di Header (sudah di handle di Layout) */}
      
      {/* Iklan E: Middle Banner Under Headlines */}
      <AdUnderHeadlinesPlacement />
      
      {/* Iklan F: Middle Banner Under Videos */}
      <AdUnderVideosPlacement />
      
      {/* Iklan G: Middle Banner In-Content */}
      <AdInContentMiddlePlacement />
      
      {/* Iklan H: Middle Banner Before Comments */}
      <AdBeforeCommentsPlacement />
      
      {/* Iklan I: Bottom Panel di Footer */}
      <AdFooterPlacement />
    </>
  );
};

// Container untuk placement iklan di sidebar
export const SidebarAdPlacements: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Iklan B: Leaderboard di Top Sidebar */}
      <AdSidebarTopPlacement />
      
      {/* Iklan C: Medium Rectangular 350x300 */}
      <AdSidebarMiddlePlacement1 />
      
      {/* Iklan D: Medium Rectangular 300x250 */}
      <AdSidebarMiddlePlacement2 />
      
      {/* Sticky ad untuk sidebar */}
      <div className="sticky top-24">
        <AdSidebarMiddlePlacement1 />
      </div>
    </div>
  );
};

// Container untuk home page ads
export const HomePageAdPlacements: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Iklan A: Full Banner */}
      <AdHeaderPlacement />
      
      {/* Grid of ads untuk home page */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdSidebarMiddlePlacement1 />
        <AdSidebarMiddlePlacement2 />
        <AdSidebarMiddlePlacement1 />
      </div>
      
      {/* Iklan E: Middle Banner */}
      <AdUnderHeadlinesPlacement />
      
      {/* Iklan I: Bottom Panel */}
      <AdFooterPlacement />
    </div>
  );
};

// Ad Placement Manager
export const AdPlacementManager: React.FC<{
  position: 'header' | 'sidebar' | 'under-headlines' | 'under-videos' | 'in-content' | 'before-comments' | 'footer' | 'home-page' | 'article-page';
  customAd?: AdProps;
}> = ({ position, customAd }) => {
  switch (position) {
    case 'header':
      return <AdHeaderPlacement customAd={customAd} />;
    case 'sidebar':
      return <SidebarAdPlacements />;
    case 'under-headlines':
      return <AdUnderHeadlinesPlacement customAd={customAd} />;
    case 'under-videos':
      return <AdUnderVideosPlacement customAd={customAd} />;
    case 'in-content':
      return <AdInContentMiddlePlacement customAd={customAd} />;
    case 'before-comments':
      return <AdBeforeCommentsPlacement customAd={customAd} />;
    case 'footer':
      return <AdFooterPlacement customAd={customAd} />;
    case 'home-page':
      return <HomePageAdPlacements />;
    case 'article-page':
      return <ArticleAdPlacements />;
    default:
      return <AdSidebarMiddlePlacement1 customAd={customAd} />;
  }
};
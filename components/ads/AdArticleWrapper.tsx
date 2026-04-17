// components/ads/AdArticleWrapper.tsx
// Wrapper untuk halaman artikel dengan placement iklan A-I

import React from 'react';
import { AdPlacementManager } from './AdPlacements';

interface AdArticleWrapperProps {
  children: React.ReactNode;
  showAds?: boolean;
  adPlacements?: {
    header?: boolean;
    underHeadlines?: boolean;
    underVideos?: boolean;
    inContent?: boolean;
    beforeComments?: boolean;
    footer?: boolean;
    sidebar?: boolean;
  };
}

export const AdArticleWrapper: React.FC<AdArticleWrapperProps> = ({
  children,
  showAds = true,
  adPlacements = {
    header: true,
    underHeadlines: true,
    underVideos: true,
    inContent: true,
    beforeComments: true,
    footer: true,
    sidebar: true
  }
}) => {
  if (!showAds) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Iklan A: Full Banner di Header (akan di handle di Layout) */}
      
      {/* Main content dengan sidebar */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="lg:w-3/4">
            {/* Iklan E: Middle Banner Under Headlines */}
            {adPlacements.underHeadlines && (
              <div className="mb-8">
                <AdPlacementManager position="under-headlines" />
              </div>
            )}
            
            {/* Main article content */}
            {children}
            
            {/* Iklan F: Middle Banner Under Videos */}
            {adPlacements.underVideos && (
              <div className="my-8">
                <AdPlacementManager position="under-videos" />
              </div>
            )}
            
            {/* Iklan G: Middle Banner In-Content */}
            {adPlacements.inContent && (
              <div className="my-8">
                <AdPlacementManager position="in-content" />
              </div>
            )}
            
            {/* Iklan H: Middle Banner Before Comments */}
            {adPlacements.beforeComments && (
              <div className="my-8">
                <AdPlacementManager position="before-comments" />
              </div>
            )}
          </div>
          
          {/* Sidebar dengan iklan */}
          {adPlacements.sidebar && (
            <div className="lg:w-1/4">
              <div className="sticky top-24 space-y-6">
                <AdPlacementManager position="sidebar" />
              </div>
            </div>
          )}
        </div>
        
        {/* Iklan I: Bottom Panel di Footer */}
        {adPlacements.footer && (
          <div className="mt-12">
            <AdPlacementManager position="footer" />
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper untuk home page dengan iklan
export const AdHomeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="space-y-8">
      {/* Iklan A: Full Banner */}
      <AdPlacementManager position="header" />
      
      {/* Main content */}
      {children}
      
      {/* Iklan I: Bottom Panel */}
      <AdPlacementManager position="footer" />
    </div>
  );
};

// Wrapper untuk category page dengan iklan
export const AdCategoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="lg:w-3/4">
          {/* Iklan E: Middle Banner Under Headlines */}
          <div className="mb-8">
            <AdPlacementManager position="under-headlines" />
          </div>
          
          {children}
          
          {/* Iklan G: Middle Banner In-Content */}
          <div className="my-8">
            <AdPlacementManager position="in-content" />
          </div>
        </div>
        
        {/* Sidebar dengan iklan */}
        <div className="lg:w-1/4">
          <div className="sticky top-24 space-y-6">
            <AdPlacementManager position="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { AdPlacementConfig } from './AdConfig';

interface AdSlotProps {
  config: AdPlacementConfig;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ config, className = '' }) => {
  const heightClass = config.type === 'full-banner'
    ? 'h-[100px] md:h-[300px]'
    : config.type === 'leaderboard'
    ? 'h-[100px] md:h-[150px]'
    : config.type === 'medium-rectangle-350'
    ? 'h-[250px] md:h-[300px]'
    : config.type === 'medium-rectangle-300'
    ? 'h-[250px]'
    : config.type === 'middle-banner' || config.type === 'bottom-panel'
    ? 'h-[100px]'
    : 'h-[250px]';

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className={`relative w-full ${heightClass} bg-gray-50 flex items-center justify-center`}>
        <div className="text-center text-gray-300">
          <div className="text-[10px] uppercase tracking-wider">Ad</div>
        </div>
      </div>
    </div>
  );
};

export const AdFullBanner: React.FC<{ className?: string }> = ({ className }) => (
  <AdSlot config={{ id: 'ad-a', type: 'full-banner', desktopSize: '1400x300', mobileSize: '320x100', position: 'under-menu-bar' }} className={className} />
);

export const AdLeaderboard: React.FC<{ className?: string }> = ({ className }) => (
  <AdSlot config={{ id: 'ad-b', type: 'leaderboard', desktopSize: '700x150', mobileSize: '320x100', position: 'leaderboard' }} className={className} />
);

export const AdMediumRect350: React.FC<{ className?: string }> = ({ className }) => (
  <AdSlot config={{ id: 'ad-c', type: 'medium-rectangle-350', desktopSize: '350x300', mobileSize: '300x250', position: 'sidebar-top' }} className={className} />
);

export const AdMediumRect300: React.FC<{ className?: string }> = ({ className }) => (
  <AdSlot config={{ id: 'ad-d', type: 'medium-rectangle-300', desktopSize: '300x250', mobileSize: '300x250', position: 'sidebar-middle' }} className={className} />
);

export const AdMiddleBanner: React.FC<{ className?: string }> = ({ className }) => (
  <AdSlot config={{ id: 'ad-e', type: 'middle-banner', desktopSize: '970x90', mobileSize: '320x100', position: 'under-headlines' }} className={className} />
);

export const AdBottomPanel: React.FC<{ className?: string }> = ({ className }) => (
  <AdSlot config={{ id: 'ad-i', type: 'bottom-panel', desktopSize: '970x90', mobileSize: '320x100', position: 'bottom-panel' }} className={className} />
);

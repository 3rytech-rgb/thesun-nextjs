export interface AdPlacementConfig {
  id: string;
  type:
    | 'full-banner'
    | 'leaderboard'
    | 'medium-rectangle-350'
    | 'medium-rectangle-300'
    | 'middle-banner'
    | 'bottom-panel'
    | 'skyscraper'
    | 'half-page';
  desktopSize: string;
  mobileSize: string;
  position: string;
  fallbackImage?: string;
}

export const adConfigs: Record<string, AdPlacementConfig> = {
  'A': {
    id: 'ad-a',
    type: 'full-banner',
    desktopSize: '1400x300',
    mobileSize: '320x100',
    position: 'under-menu-bar',
  },
  'B': {
    id: 'ad-b',
    type: 'leaderboard',
    desktopSize: '700x150',
    mobileSize: '320x100',
    position: 'leaderboard',
  },
  'C': {
    id: 'ad-c',
    type: 'medium-rectangle-350',
    desktopSize: '350x300',
    mobileSize: '300x250',
    position: 'sidebar-top',
  },
  'D': {
    id: 'ad-d',
    type: 'medium-rectangle-300',
    desktopSize: '300x250',
    mobileSize: '300x250',
    position: 'sidebar-middle',
  },
  'E': {
    id: 'ad-e',
    type: 'middle-banner',
    desktopSize: '970x90',
    mobileSize: '320x100',
    position: 'under-headlines',
  },
  'F': {
    id: 'ad-f',
    type: 'middle-banner',
    desktopSize: '970x90',
    mobileSize: '320x100',
    position: 'under-videos',
  },
  'G': {
    id: 'ad-g',
    type: 'middle-banner',
    desktopSize: '970x90',
    mobileSize: '320x100',
    position: 'in-content',
  },
  'H': {
    id: 'ad-h',
    type: 'middle-banner',
    desktopSize: '970x90',
    mobileSize: '320x100',
    position: 'before-comments',
  },
  'I': {
    id: 'ad-i',
    type: 'bottom-panel',
    desktopSize: '970x90',
    mobileSize: '320x100',
    position: 'bottom-panel',
  },
};

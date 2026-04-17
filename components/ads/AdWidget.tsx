// components/ads/AdWidget.tsx
import { useEffect, useState } from 'react';

interface AdWidgetProps {
  type: 'mgwidget' | 'taboola';
  widgetId?: string;
  containerId?: string;
}

// Track loaded scripts globally
const loadedScripts = new Set<string>();

export function AdWidget({ type, widgetId, containerId }: AdWidgetProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (!isClient) return;

    const loadMGWidget = () => {
      if (typeof window === 'undefined') return;
      
      const scriptKey = `mgwidget-${widgetId}`;
      if (loadedScripts.has(scriptKey)) return;
      
      // Initialize MG queue if not exists
      if (!(window as any)._mgq) {
        (window as any)._mgq = [];
      }
      
      // Push load command
      (window as any)._mgq.push(['_mgc.load']);
      
      // Load MG Widget script if not already loaded
      if (!document.querySelector('script[src*="mgid.com"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://jsc.mgid.com/t/h/thesun.my.1884419.js';
        document.body.appendChild(script);
      }
      
      loadedScripts.add(scriptKey);
    };

    const loadTaboola = () => {
      if (typeof window === 'undefined') return;
      
      const scriptKey = `taboola-${containerId}`;
      if (loadedScripts.has(scriptKey)) return;
      
      // Initialize Taboola if not exists
      if (!(window as any)._taboola) {
        (window as any)._taboola = [];
      }
      
      // Push configuration
      (window as any)._taboola.push({
        mode: 'thumbnails-mid-widget',
        container: containerId,
        placement: 'Mid Article Thumbnails',
        target_type: 'mix'
      });
      
      // Load Taboola script if not already loaded
      if (!document.querySelector('script[src*="taboola.com"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://cdn.taboola.com/libtrc/thesun/my/loader.js';
        document.body.appendChild(script);
      }
      
      loadedScripts.add(scriptKey);
    };

    if (type === 'mgwidget' && widgetId) {
      loadMGWidget();
    }
    
    if (type === 'taboola' && containerId) {
      loadTaboola();
    }
  }, [type, widgetId, containerId, isClient]);

  // Only render on client side
  if (!isClient) {
    return (
      <div className="ad-widget">
        <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  if (type === 'mgwidget' && widgetId) {
    return (
      <div className="ad-widget">
        <div data-type="_mgwidget" data-widget-id={widgetId}></div>
      </div>
    );
  }
  
  if (type === 'taboola' && containerId) {
    return (
      <div className="ad-widget">
        <div id={containerId}></div>
      </div>
    );
  }
  
  return null;
}
// components/common/NetworkImage.tsx - UPDATED WITH FALLBACKSRC
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface NetworkImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: () => void;
  onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
}

const PROFILE_ICON = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"/></svg>`)}`;

export default function NetworkImage({
  src,
  alt,
  fallbackSrc = PROFILE_ICON,
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  onError,
  onLoadingComplete,
  ...props
}: NetworkImageProps) {
  const [hasError, setHasError] = useState(false);

  const isValidUrl = (url: string) => {
    return url && (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'));
  };

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setHasError(true);
    } else if (onError) {
      onError();
    }
  };

  const finalSrc = (!src || !isValidUrl(src) || hasError) ? fallbackSrc : src;

  if ((hasError && !isValidUrl(fallbackSrc)) || !isValidUrl(finalSrc)) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
        style={!fill && width && height ? { width, height } : fill ? {} : undefined}
      >
        <svg className="w-1/2 h-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" strokeWidth="1.5"/>
          <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8" strokeWidth="1.5"/>
        </svg>
      </div>
    );
  }

  try {
    // Clean URL - remove any double slashes
    const cleanSrc = finalSrc.replace(/([^:]\/)\/+/g, "$1");
    
    return (
      <Image
        src={cleanSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`object-cover ${className}`}
        sizes={sizes || (fill ? "100vw" : undefined)}
        priority={priority}
        onError={handleError}
        onLoadingComplete={onLoadingComplete}
        {...props}
      />
    );
  } catch (error) {
    console.error('Image component error:', error);
    return (
      <div 
        className={`bg-gray-200 ${className}`}
        style={!fill && width && height ? { width, height } : fill ? {} : undefined}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500 text-sm">Image Error</span>
        </div>
      </div>
    );
  }
}
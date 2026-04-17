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

export default function NetworkImage({
  src,
  alt,
  fallbackSrc = '/default-image.png',
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
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Periksa jika URL valid
  const isValidUrl = (url: string) => {
    return url && (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'));
  };

  const handleError = () => {
    console.warn(`⚠️ Image failed to load: ${src}`);
    
    // Try fallback image
    if (fallbackSrc && !hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else if (onError) {
      onError();
    }
  };

  // Jika src kosong atau invalid, guna fallback secara langsung
  const finalSrc = !src || !isValidUrl(src) ? fallbackSrc : imgSrc;

  // Jika masih error walaupun dengan fallback, show error state
  if ((hasError && imgSrc === fallbackSrc && !isValidUrl(fallbackSrc)) || !isValidUrl(finalSrc)) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
        style={!fill && width && height ? { width, height } : fill ? {} : undefined}
      >
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-500 text-sm">Image not available</span>
        </div>
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
        unoptimized={process.env.NODE_ENV === 'development'}
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
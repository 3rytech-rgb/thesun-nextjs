// components/common/NetworkImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface NetworkImageProps {
  src: string;
  alt: string;
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
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  onError,
  onLoadingComplete,
}: NetworkImageProps) {
  const [error, setError] = useState(false);

  // Periksa jika URL valid
  const isValidUrl = src && (src.startsWith('http') || src.startsWith('/') || src.startsWith('data:'));

  if (!isValidUrl || error) {
    if (onError) onError?.();
    return (
      <div 
        className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
        style={!fill && width && height ? { width, height } : {}}
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
    const cleanSrc = src.replace(/([^:]\/)\/+/g, "$1");
    
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
        onError={() => {
          setError(true);
          onError?.();
          console.error(`Failed to load image: ${cleanSrc}`);
        }}
        onLoadingComplete={onLoadingComplete}
        unoptimized={process.env.NODE_ENV === 'development'}
      />
    );
  } catch (error) {
    console.error('Image component error:', error);
    return (
      <div className={`bg-gray-200 ${className}`}>
        <span className="text-gray-500">Image Error</span>
      </div>
    );
  }
}
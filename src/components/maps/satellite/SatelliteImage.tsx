
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import MapComponent from '@/components/maps/MapComponent';

interface SatelliteImageProps {
  imageUrl: string | null;
  altText: string;
  loading: boolean;
  error: string | null;
  coordinates: [number, number];
  onImageError: () => void;
  showFallbackMap: boolean;
}

const SatelliteImage = ({
  imageUrl,
  altText,
  loading,
  error,
  coordinates,
  onImageError,
  showFallbackMap
}: SatelliteImageProps) => {
  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center p-4">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        </div>
      )}
      {imageUrl && !showFallbackMap ? (
        <div className="h-[300px] w-full rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={altText} 
            className="w-full h-full object-cover"
            onError={onImageError}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-[300px] w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <MapComponent
            center={coordinates}
            zoom={13}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
};

export default SatelliteImage;

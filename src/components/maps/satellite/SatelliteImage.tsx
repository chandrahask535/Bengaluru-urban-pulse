
import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ZoomIn } from 'lucide-react';
import MapComponent from '@/components/maps/MapComponent';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";

interface SatelliteImageProps {
  imageUrl: string | null;
  altText: string;
  loading: boolean;
  error: string | null;
  coordinates: [number, number];
  onImageError: () => void;
  showFallbackMap: boolean;
  onRetry?: () => void;
  year?: string;
}

const SatelliteImage = ({
  imageUrl,
  altText,
  loading,
  error,
  coordinates,
  onImageError,
  showFallbackMap,
  onRetry,
  year
}: SatelliteImageProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [tryCount, setTryCount] = useState(0);
  
  // Reset image error state when URL changes
  useEffect(() => {
    if (imageUrl) {
      setHasImageError(false);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    console.error(`Failed to load satellite image for ${year || 'unknown'} year`, imageUrl);
    setHasImageError(true);
    onImageError();
  };

  const handleRetry = () => {
    setHasImageError(false);
    setTryCount(prev => prev + 1);
    if (onRetry) onRetry();
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 animate-spin">
            <RefreshCw className="h-10 w-10" />
          </div>
        </div>
      )}
      
      {(error || hasImageError) && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center p-4">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {error || "Failed to load satellite image"}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {imageUrl && !showFallbackMap && !hasImageError ? (
        <div className="h-[300px] w-full rounded-lg overflow-hidden relative group">
          <Dialog>
            <DialogTrigger asChild>
              <div className="cursor-pointer relative">
                <img 
                  src={`${imageUrl}${tryCount > 0 ? `&t=${Date.now()}` : ''}`}
                  alt={altText} 
                  className="w-full h-[300px] object-cover transition-opacity duration-300 group-hover:opacity-90"
                  onError={handleImageError}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                {year && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {year}
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-1 bg-black/90">
              <img 
                src={`${imageUrl}${tryCount > 0 ? `&t=${Date.now()}` : ''}`}
                alt={altText} 
                className="w-full max-h-[80vh] object-contain"
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="h-[300px] w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
          <MapComponent
            center={coordinates}
            zoom={13}
            className="h-full w-full"
          />
          {year && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {year}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SatelliteImage;

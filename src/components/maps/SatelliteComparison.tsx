
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RotateCw, Info } from 'lucide-react';
import SatelliteImage from './satellite/SatelliteImage';
import ChangeAnalysisCard from './satellite/ChangeAnalysisCard';
import { useSatelliteImagery } from './satellite/SatelliteImageryFetcher';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SatelliteComparisonProps {
  lakeName: string;
  coordinates: [number, number];
  historicalYear?: string;
  currentYear?: string;
  onAnalyze?: (changes: any) => void;
}

const SatelliteComparison = ({
  lakeName,
  coordinates,
  historicalYear = '2010',
  currentYear = '2025',
  onAnalyze,
}: SatelliteComparisonProps) => {
  const [showFallbackMaps, setShowFallbackMaps] = useState(false);
  
  const {
    historicalImage,
    currentImage,
    changes,
    loading,
    error,
    handleRetry
  } = useSatelliteImagery(coordinates, historicalYear, currentYear);

  // Call onAnalyze when changes are available
  if (changes && onAnalyze) {
    onAnalyze(changes);
  }

  const handleImageError = (type: 'historical' | 'current') => {
    console.log(`${type} image failed to load, showing fallback map`);
    setShowFallbackMaps(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {historicalYear} Satellite Image
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 p-0">
                      <Info className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-60 text-xs">Historical satellite imagery showing lake boundaries and surrounding areas in {historicalYear}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {error && (
              <Button variant="ghost" size="sm" onClick={handleRetry} className="p-1 h-6">
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </h3>
          <SatelliteImage
            imageUrl={historicalImage}
            altText={`${historicalYear} satellite image of ${lakeName}`}
            loading={loading}
            error={error}
            coordinates={coordinates}
            onImageError={() => handleImageError('historical')}
            showFallbackMap={showFallbackMaps}
            onRetry={handleRetry}
            year={historicalYear}
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {currentYear} Satellite Image
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 p-0">
                      <Info className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-60 text-xs">Current satellite imagery showing present condition of the lake and surrounding development</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {error && (
              <Button variant="ghost" size="sm" onClick={handleRetry} className="p-1 h-6">
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
          </h3>
          <SatelliteImage
            imageUrl={currentImage}
            altText={`${currentYear} satellite image of ${lakeName}`}
            loading={loading}
            error={error}
            coordinates={coordinates}
            onImageError={() => handleImageError('current')}
            showFallbackMap={showFallbackMaps}
            onRetry={handleRetry}
            year={currentYear}
          />
        </Card>
      </div>

      <ChangeAnalysisCard
        changes={changes}
        lakeName={lakeName}
        historicalYear={historicalYear}
        currentYear={currentYear}
        loading={loading}
      />
    </div>
  );
};

export default SatelliteComparison;

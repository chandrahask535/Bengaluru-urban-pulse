import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import SatelliteView from '@/components/ui/map/SatelliteView';
import SatelliteImageryService from '@/services/SatelliteImageryService';

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
  currentYear = '2023',
  onAnalyze,
}: SatelliteComparisonProps) => {
  const [changes, setChanges] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeChanges = async () => {
      try {
        setLoading(true);
        const [lat, lng] = coordinates;
        const waterBodyChanges = await SatelliteImageryService.getWaterBodyChanges(
          lat,
          lng,
          `${historicalYear}-01-01`,
          `${currentYear}-01-01`
        );
        setChanges(waterBodyChanges);
        onAnalyze?.(waterBodyChanges);
      } catch (error) {
        console.error('Error analyzing changes:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeChanges();
  }, [coordinates, historicalYear, currentYear]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedViews, setLoadedViews] = useState(0);

  const handleViewLoad = () => {
    setLoadedViews((prev) => {
      const newCount = prev + 1;
      if (newCount === 2) {
        setIsLoading(false);
      }
      return newCount;
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {historicalYear} Satellite Image
          </h3>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            )}
            <SatelliteView
              center={coordinates}
              year={historicalYear}
              onLoad={handleViewLoad}
              className="h-[300px] w-full rounded-lg"
              imageSource="nasa"
              date={`${historicalYear}-01-01`}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {currentYear} Satellite Image
          </h3>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
            )}
            <SatelliteView
              center={coordinates}
              year={currentYear}
              onLoad={handleViewLoad}
              className="h-[300px] w-full rounded-lg"
              imageSource="bhuvan"
              date={`${currentYear}-01-01`}
            />
          </div>
        </Card>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Historical Analysis: {lakeName}
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Compare satellite imagery from {historicalYear} to {currentYear} to observe changes in lake boundaries,
          encroachment patterns, and surrounding development. Use the map controls to zoom and pan for detailed inspection.
        </p>
      </div>
    </div>
  );
};

export default SatelliteComparison;
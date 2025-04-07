
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface ChangeStats {
  area: {
    historical: number;
    current: number;
    difference: number;
  };
  encroachment: {
    percentage: number;
    hotspots: number;
  };
  waterQuality: {
    historical: string;
    current: string;
    trend: string;
  };
  timestamp: string;
}

interface ChangeAnalysisCardProps {
  changes: ChangeStats | null;
  lakeName: string;
  historicalYear: string;
  currentYear: string;
  loading?: boolean;
}

const ChangeAnalysisCard = ({ 
  changes, 
  lakeName, 
  historicalYear, 
  currentYear,
  loading = false
}: ChangeAnalysisCardProps) => {
  if (loading) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg animate-pulse">
        <div className="h-6 bg-yellow-200/50 dark:bg-yellow-800/50 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-yellow-200/50 dark:bg-yellow-800/50 rounded w-full mb-4"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-md shadow-sm">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!changes) return null;

  const percentChange = changes.area.historical > 0 
    ? Math.round((changes.area.difference / changes.area.historical) * 100) 
    : 0;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
      <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
        Historical Analysis: {lakeName}
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-300">
        Compare satellite imagery from {historicalYear} to {currentYear} to observe changes in lake boundaries,
        encroachment patterns, and surrounding development.
      </p>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Surface Area Change</h4>
          <div className="flex items-center">
            <p className={`text-lg font-bold ${percentChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {percentChange}%
            </p>
            {percentChange < 0 ? (
              <TrendingDown className="h-4 w-4 ml-1 text-red-600 dark:text-red-400" />
            ) : (
              <TrendingUp className="h-4 w-4 ml-1 text-green-600 dark:text-green-400" />
            )}
          </div>
          <p className="text-xs text-gray-500">
            From {changes.area.historical.toLocaleString()} sq m to {changes.area.current.toLocaleString()} sq m
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Encroachment</h4>
          <div className="flex items-center">
            <p className={`text-lg font-bold ${changes.encroachment.percentage > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {changes.encroachment.percentage}%
            </p>
            {changes.encroachment.percentage > 15 && (
              <AlertCircle className="h-4 w-4 ml-1 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <p className="text-xs text-gray-500">
            {changes.encroachment.hotspots} hotspot{changes.encroachment.hotspots !== 1 ? 's' : ''} detected
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Water Quality</h4>
          <p className={`text-lg font-bold ${
            changes.waterQuality.current === 'Good' ? 'text-green-600 dark:text-green-400' :
            changes.waterQuality.current === 'Poor' ? 'text-red-600 dark:text-red-400' :
            'text-blue-600 dark:text-blue-400'
          }`}>
            {changes.waterQuality.current}
          </p>
          <p className="text-xs text-gray-500">
            Trend: {changes.waterQuality.trend}
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs text-right text-gray-500 dark:text-gray-400">
        Last updated: {new Date(changes.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default ChangeAnalysisCard;

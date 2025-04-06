
import { Card } from '@/components/ui/card';

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
}

const ChangeAnalysisCard = ({ changes, lakeName, historicalYear, currentYear }: ChangeAnalysisCardProps) => {
  if (!changes) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
      <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
        Historical Analysis: {lakeName}
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-300">
        Compare satellite imagery from {historicalYear} to {currentYear} to observe changes in lake boundaries,
        encroachment patterns, and surrounding development. Use the map controls to zoom and pan for detailed inspection.
      </p>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Surface Area Change</h4>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {Math.round((changes.area.difference / changes.area.historical) * 100)}%
          </p>
          <p className="text-xs text-gray-500">
            From {changes.area.historical.toLocaleString()} sq m to {changes.area.current.toLocaleString()} sq m
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Encroachment</h4>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {changes.encroachment.percentage}%
          </p>
          <p className="text-xs text-gray-500">
            {changes.encroachment.hotspots} hotspot{changes.encroachment.hotspots !== 1 ? 's' : ''} detected
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Water Quality</h4>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {changes.waterQuality.current}
          </p>
          <p className="text-xs text-gray-500">
            Trend: {changes.waterQuality.trend}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangeAnalysisCard;

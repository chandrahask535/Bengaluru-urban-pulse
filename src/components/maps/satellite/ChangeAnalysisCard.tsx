
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingDown, TrendingUp, Droplet, Building, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Skeleton className="h-6 w-1/3" />
        </div>
        <Skeleton className="h-4 w-full mb-4" />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-5 w-1/4 mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (!changes) return null;

  const percentChange = changes.area.historical > 0 
    ? Math.round((changes.area.difference / changes.area.historical) * 100) 
    : 0;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Good': return 'bg-green-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="p-4 border-t-4 border-t-karnataka-lake-medium">
      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
        <Eye className="w-4 h-4 mr-2 text-karnataka-lake-medium" />
        Historical Analysis: {lakeName}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Compare satellite imagery from {historicalYear} to {currentYear} to observe changes in lake boundaries,
        encroachment patterns, and surrounding development.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="flex items-center mb-2">
            <Droplet className="h-4 w-4 mr-1 text-blue-500" />
            <h4 className="text-xs font-medium text-gray-500 uppercase">Surface Area Change</h4>
          </div>
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
          <p className="text-xs text-gray-500 mt-1">
            From {changes.area.historical.toLocaleString()} sq m to {changes.area.current.toLocaleString()} sq m
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="flex items-center mb-2">
            <Building className="h-4 w-4 mr-1 text-orange-500" />
            <h4 className="text-xs font-medium text-gray-500 uppercase">Encroachment</h4>
          </div>
          <div className="flex items-center">
            <p className={`text-lg font-bold ${changes.encroachment.percentage > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {changes.encroachment.percentage}%
            </p>
            {changes.encroachment.percentage > 15 && (
              <AlertCircle className="h-4 w-4 ml-1 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex items-center mt-1">
            <p className="text-xs text-gray-500">
              {changes.encroachment.hotspots} hotspot{changes.encroachment.hotspots !== 1 ? 's' : ''} detected
            </p>
            {changes.encroachment.percentage > 20 && (
              <Badge variant="destructive" className="ml-2 text-[10px] h-4 px-1">Critical</Badge>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="flex items-center mb-2">
            <div className="h-4 w-4 mr-1 rounded-full" style={{
              backgroundColor: getQualityColor(changes.waterQuality.current)
            }}></div>
            <h4 className="text-xs font-medium text-gray-500 uppercase">Water Quality</h4>
          </div>
          <p className={`text-lg font-bold ${
            changes.waterQuality.current === 'Good' ? 'text-green-600 dark:text-green-400' :
            changes.waterQuality.current === 'Poor' ? 'text-red-600 dark:text-red-400' :
            'text-yellow-600 dark:text-yellow-400'
          }`}>
            {changes.waterQuality.current}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            Trend: {changes.waterQuality.trend}
            {changes.waterQuality.trend === 'Declining' && <TrendingDown className="h-3 w-3 ml-1 text-red-500" />}
            {changes.waterQuality.trend === 'Improving' && <TrendingUp className="h-3 w-3 ml-1 text-green-500" />}
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs text-right text-gray-500 dark:text-gray-400">
        Last updated: {new Date(changes.timestamp).toLocaleString()}
      </div>
    </Card>
  );
};

export default ChangeAnalysisCard;

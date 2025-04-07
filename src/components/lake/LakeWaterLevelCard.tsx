
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WaterLevelData {
  current: number;
  historical: number[];
  capacity: number;
  threshold: {
    low: number;
    critical: number;
  };
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
}

interface LakeWaterLevelCardProps {
  lakeId: string;
  lakeName: string;
  waterLevelData?: WaterLevelData;
}

const LakeWaterLevelCard = ({ lakeId, lakeName, waterLevelData }: LakeWaterLevelCardProps) => {
  // Sample data if none provided
  const data = waterLevelData || {
    current: 72,
    historical: [75, 73, 71, 70, 72],
    capacity: 100,
    threshold: {
      low: 50,
      critical: 30
    },
    trend: 'rising' as const,
    lastUpdated: '2025-04-05T10:30:00'
  };

  const getStatusColor = (level: number) => {
    if (level < data.threshold.critical) return "bg-red-500";
    if (level < data.threshold.low) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const renderWaterLevelBar = (level: number, showLabels = true) => (
    <div className="relative h-48 w-6 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
      <div 
        className={`absolute bottom-0 w-full transition-all duration-500 ${getStatusColor(level)}`} 
        style={{ height: `${level}%` }}
      ></div>
      {showLabels && (
        <>
          <div className="absolute w-full border-t border-dashed border-red-500 dark:border-red-400" style={{ bottom: `${data.threshold.critical}%` }}>
            <span className="absolute text-xs text-red-600 dark:text-red-400 left-8 -translate-y-3">Critical</span>
          </div>
          <div className="absolute w-full border-t border-dashed border-yellow-500 dark:border-yellow-400" style={{ bottom: `${data.threshold.low}%` }}>
            <span className="absolute text-xs text-yellow-600 dark:text-yellow-400 left-8 -translate-y-3">Low</span>
          </div>
        </>
      )}
    </div>
  );
  
  return (
    <Card className="p-4 border-t-4 border-t-karnataka-lake-medium">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
          Water Level: {lakeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              {renderWaterLevelBar(data.current)}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-md rounded-full w-12 h-12 flex items-center justify-center">
                <Droplet className={`h-6 w-6 ${getStatusColor(data.current)}`} />
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold">{data.current}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current Level</div>
              <div className="mt-1 flex items-center justify-center text-sm">
                {data.trend === 'rising' ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    Rising <TrendingUp className="h-4 w-4 ml-1" />
                  </span>
                ) : data.trend === 'falling' ? (
                  <span className="text-red-600 dark:text-red-400 flex items-center">
                    Falling <TrendingDown className="h-4 w-4 ml-1" />
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">Stable</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Historical Levels</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Last 5 Readings</span>
                  <span>Current</span>
                </div>
                <div className="h-24 flex items-end justify-between space-x-1">
                  {data.historical.map((level, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full">
                        <div 
                          className={`w-full rounded-t-sm ${getStatusColor(level)}`}
                          style={{ height: `${level*0.22}px` }}
                        ></div>
                      </div>
                      <span className="text-xs mt-1">{level}%</span>
                    </div>
                  ))}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full">
                      <div 
                        className={`w-full rounded-t-sm ${getStatusColor(data.current)}`}
                        style={{ height: `${data.current*0.22}px` }}
                      ></div>
                    </div>
                    <span className="text-xs mt-1 font-bold">{data.current}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Capacity</h3>
              <Progress 
                value={data.current} 
                className="h-3 bg-gray-200 dark:bg-gray-700" 
                indicatorClassName={getStatusColor(data.current)}
              />
              <div className="flex justify-between mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {formatDate(data.lastUpdated)}
                </div>
                <div className="text-xs font-medium">{data.current}% of {data.capacity}%</div>
              </div>
            </div>
            
            {data.current < data.threshold.low && (
              <div className={`p-3 rounded-lg border flex items-start ${
                data.current < data.threshold.critical
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              }`}>
                <AlertTriangle className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 ${
                  data.current < data.threshold.critical
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`} />
                <div>
                  <p className={`text-xs font-medium ${
                    data.current < data.threshold.critical
                      ? "text-red-800 dark:text-red-200"
                      : "text-yellow-800 dark:text-yellow-200"
                  }`}>
                    {data.current < data.threshold.critical ? "Critical" : "Low"} Water Level
                  </p>
                  <p className={`text-xs mt-1 ${
                    data.current < data.threshold.critical
                      ? "text-red-600 dark:text-red-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {data.current < data.threshold.critical
                      ? "Water level is critically low. Conservation measures needed immediately."
                      : "Water level is below recommended threshold. Monitor closely."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LakeWaterLevelCard;

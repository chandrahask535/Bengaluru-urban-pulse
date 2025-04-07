
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Droplet, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WaterQualityMonitorProps {
  lakeId: string;
  lakeName: string;
  historicalData?: any;
}

const WaterQualityMonitor = ({ lakeId, lakeName, historicalData }: WaterQualityMonitorProps) => {
  const [qualityData, setQualityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setQualityData({
        current: {
          ph: 7.2,
          dissolvedOxygen: 6.5,
          bod: 3.2,
          temperature: 24.5,
          clarity: 85,
          qualityIndex: 78
        },
        historical: {
          ph: [7.1, 7.3, 7.0, 7.2, 7.4],
          dissolvedOxygen: [6.0, 6.2, 6.5, 6.3, 6.5],
          bod: [3.5, 3.3, 3.2, 3.4, 3.2],
          temperature: [24.0, 24.8, 25.1, 24.5, 24.5],
          clarity: [80, 82, 84, 83, 85],
          qualityIndex: [75, 76, 77, 78, 78]
        },
        trend: 'improving'
      });
      setLoading(false);
    }, 1500);
  }, [lakeId]);

  if (loading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-lg">Water Quality Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getQualityColor = (index: number) => {
    if (index > 75) return "bg-green-500";
    if (index > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-4 border-t-4 border-t-karnataka-lake-medium">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
          Water Quality Analysis: {lakeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Quality Index</h4>
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold">{qualityData.current.qualityIndex}</div>
                <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">/ 100</div>
                <div className="ml-auto">
                  <Badge variant="outline" className={
                    qualityData.current.qualityIndex > 75 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" :
                    qualityData.current.qualityIndex > 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" :
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                  }>
                    {qualityData.current.qualityIndex > 75 ? "Good" :
                     qualityData.current.qualityIndex > 50 ? "Moderate" : "Poor"}
                  </Badge>
                </div>
              </div>
              <Progress 
                value={qualityData.current.qualityIndex} 
                className="h-2 bg-gray-200 dark:bg-gray-700" 
                indicatorClassName={getQualityColor(qualityData.current.qualityIndex)}
              />
              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Trend:</span>
                {qualityData.trend === 'improving' ? (
                  <span className="flex items-center text-green-600 dark:text-green-400 ml-1">
                    Improving <TrendingUp className="h-3 w-3 ml-1" />
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400 ml-1">
                    Declining <TrendingDown className="h-3 w-3 ml-1" />
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Key Parameters</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">pH</span>
                  <span className="text-xs font-medium">{qualityData.current.ph}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Dissolved Oxygen</span>
                  <span className="text-xs font-medium">{qualityData.current.dissolvedOxygen} mg/L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">BOD</span>
                  <span className="text-xs font-medium">{qualityData.current.bod} mg/L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Temperature</span>
                  <span className="text-xs font-medium">{qualityData.current.temperature}°C</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <BarChart2 className="h-4 w-4 mr-1 text-karnataka-metro-medium" />
              Water Quality Trends
            </h4>
            <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Water quality trend graph will be displayed here.</p>
            </div>
          </div>
          
          {qualityData.current.qualityIndex < 60 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Water Quality Alert</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This lake has poor water quality readings that require immediate attention.
                    Potential causes include urban runoff, industrial discharge, or sewage leakage.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterQualityMonitor;


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface WaterQualityData {
  ph: number;
  do: number;
  bod: number;
  temperature: number;
  turbidity: number;
  lastUpdated: string;
}

interface LakeWaterQualityCardProps {
  lakeId: string;
  lakeName: string;
  waterQualityData?: WaterQualityData;
}

const LakeWaterQualityCard = ({ lakeId, lakeName, waterQualityData }: LakeWaterQualityCardProps) => {
  // Sample data if none provided
  const data = waterQualityData || {
    ph: 7.2,
    do: 5.8,
    bod: 3.2,
    temperature: 24.5,
    turbidity: 15,
    lastUpdated: '2025-04-05T10:30:00'
  };
  
  // Calculate water quality index based on parameters
  const calculateQualityIndex = (data: WaterQualityData) => {
    // Simple water quality index calculation (can be replaced with more sophisticated models)
    const doScore = Math.min(100, Math.max(0, data.do / 8 * 100)); // Dissolved oxygen (optimal ~8 mg/L)
    const bodScore = Math.min(100, Math.max(0, (10 - data.bod) / 10 * 100)); // BOD (lower is better)
    const phScore = Math.min(100, Math.max(0, 100 - Math.abs(data.ph - 7) * 20)); // pH (optimal ~7)
    const turbidityScore = Math.min(100, Math.max(0, (25 - data.turbidity) / 25 * 100)); // Turbidity (lower is better)
    
    return Math.round((doScore * 0.3) + (bodScore * 0.3) + (phScore * 0.2) + (turbidityScore * 0.2));
  };
  
  const qualityIndex = calculateQualityIndex(data);
  
  const getQualityLevel = (index: number) => {
    if (index >= 80) return 'Good';
    if (index >= 60) return 'Moderate';
    if (index >= 40) return 'Poor';
    return 'Critical';
  };
  
  const getQualityColor = (index: number) => {
    if (index >= 80) return "bg-green-500";
    if (index >= 60) return "bg-yellow-500";
    if (index >= 40) return "bg-orange-500";
    return "bg-red-500";
  };
  
  const qualityLevel = getQualityLevel(qualityIndex);
  const isAlertLevel = qualityIndex < 60;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="p-4 border-t-4 border-t-karnataka-lake-medium">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
          Water Quality: {lakeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Quality Index</h3>
              <Badge variant="outline" className={
                qualityIndex >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" :
                qualityIndex >= 60 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" :
                qualityIndex >= 40 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200" :
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              }>
                {qualityLevel}
              </Badge>
            </div>
            <div className="flex items-center mb-2">
              <span className="text-2xl font-bold">{qualityIndex}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/100</span>
            </div>
            <Progress 
              value={qualityIndex} 
              className="h-2 bg-gray-200 dark:bg-gray-700" 
              indicatorClassName={getQualityColor(qualityIndex)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {formatDate(data.lastUpdated)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="text-xs font-medium mb-1">Dissolved Oxygen</h4>
              <div className="flex items-baseline">
                <span className="text-lg font-semibold">{data.do}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">mg/L</span>
              </div>
              <div className="mt-1 text-xs">
                {data.do >= 5 ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center">
                    Good <TrendingUp className="h-3 w-3 ml-1" />
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center">
                    Low <TrendingDown className="h-3 w-3 ml-1" />
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="text-xs font-medium mb-1">pH Level</h4>
              <div className="flex items-baseline">
                <span className="text-lg font-semibold">{data.ph}</span>
              </div>
              <div className="mt-1 text-xs">
                {data.ph >= 6.5 && data.ph <= 8.5 ? (
                  <span className="text-green-600 dark:text-green-400">Balanced</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">Imbalanced</span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="text-xs font-medium mb-1">BOD</h4>
              <div className="flex items-baseline">
                <span className="text-lg font-semibold">{data.bod}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">mg/L</span>
              </div>
              <div className="mt-1 text-xs">
                {data.bod <= 3 ? (
                  <span className="text-green-600 dark:text-green-400">Low pollution</span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">High pollution</span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h4 className="text-xs font-medium mb-1">Turbidity</h4>
              <div className="flex items-baseline">
                <span className="text-lg font-semibold">{data.turbidity}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">NTU</span>
              </div>
              <div className="mt-1 text-xs">
                {data.turbidity <= 10 ? (
                  <span className="text-green-600 dark:text-green-400">Clear</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">Cloudy</span>
                )}
              </div>
            </div>
          </div>
          
          {isAlertLevel && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 flex items-start">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-800 dark:text-red-200 font-medium">Water Quality Alert</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Water quality parameters indicate pollution issues that need immediate attention. Consider testing for industrial contaminants and reducing inflow from storm drains.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LakeWaterQualityCard;

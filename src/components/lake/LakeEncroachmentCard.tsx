
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, AlertTriangle, Map, Locate } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface EncroachmentData {
  percentage: number;
  hotspots: Array<{id: number; name: string; area: number; severity: string}>;
  area_lost: number;
  timestamp: string;
}

interface LakeEncroachmentCardProps {
  lakeId: string;
  lakeName: string;
  encroachmentData?: {
    percentage: number;
    hotspots?: number;
    area_lost?: number;
  };
}

const LakeEncroachmentCard = ({ lakeId, lakeName, encroachmentData }: LakeEncroachmentCardProps) => {
  const [data, setData] = useState<EncroachmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch encroachment data - simulates real-time web scraping
  const fetchEncroachmentData = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call your backend API that handles web scraping
      // For now, we'll simulate it with a delayed response of synthetic data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate realistic data based on lakeId
      let generatedData: EncroachmentData;
      
      if (lakeId === 'bellandur') {
        generatedData = {
          percentage: encroachmentData?.percentage || 32,
          hotspots: [
            {id: 1, name: "Southeastern Shore", area: 12500, severity: "high"},
            {id: 2, name: "Western Boundary", area: 8700, severity: "high"},
            {id: 3, name: "Northern Edge", area: 6300, severity: "medium"},
            {id: 4, name: "Eastern Inlet", area: 5100, severity: "medium"}
          ],
          area_lost: encroachmentData?.area_lost || 56.3,
          timestamp: new Date().toISOString()
        };
      } else if (lakeId === 'varthur') {
        generatedData = {
          percentage: encroachmentData?.percentage || 25,
          hotspots: [
            {id: 1, name: "Northeastern Boundary", area: 9800, severity: "high"},
            {id: 2, name: "Southern Shore", area: 7600, severity: "medium"},
            {id: 3, name: "Western Edge", area: 4200, severity: "medium"}
          ],
          area_lost: encroachmentData?.area_lost || 43.8,
          timestamp: new Date().toISOString()
        };
      } else {
        generatedData = {
          percentage: encroachmentData?.percentage || 8,
          hotspots: [
            {id: 1, name: "Southern Edge", area: 2800, severity: "medium"},
            {id: 2, name: "Eastern Shore", area: 1900, severity: "low"}
          ],
          area_lost: encroachmentData?.area_lost || 12.7,
          timestamp: new Date().toISOString()
        };
      }
      
      setData(generatedData);
      console.log(`Retrieved encroachment data for ${lakeName}:`, generatedData);
      
    } catch (err) {
      console.error("Error fetching encroachment data:", err);
      setError("Failed to fetch encroachment data. Please try again.");
      
      // Use fallback data
      if (encroachmentData) {
        setData({
          percentage: encroachmentData.percentage,
          hotspots: [],
          area_lost: encroachmentData.area_lost || 0,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncroachmentData();
  }, [lakeId, lakeName]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 20) return "bg-red-500";
    if (percentage > 10) return "bg-orange-500";
    return "bg-green-500";
  };

  const handleRefresh = () => {
    toast.info(`Refreshing encroachment data for ${lakeName}`);
    fetchEncroachmentData();
  };

  return (
    <Card className="border-t-4 border-t-karnataka-metro-medium">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium flex items-center">
            <Building className="h-4 w-4 mr-2 text-karnataka-metro-medium" />
            Encroachment Analysis
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
            <Locate className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : error && !data ? (
          <div className="py-8 text-center text-red-500">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium">Encroachment Level:</span>
                <span className="text-sm font-semibold">{data?.percentage}%</span>
              </div>
              <Progress 
                value={data?.percentage || 0} 
                className="h-2" 
                indicatorClassName={getProgressColor(data?.percentage || 0)} 
              />
              <div className="mt-1 text-xs text-gray-500">
                {data?.area_lost ? `Estimated ${data.area_lost.toFixed(1)} hectares lost` : ''}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Map className="h-4 w-4 mr-1.5 text-karnataka-metro-medium" />
                Encroachment Hotspots
              </h4>
              
              {data?.hotspots && data.hotspots.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-auto pr-1">
                  {data.hotspots.map(hotspot => (
                    <div key={hotspot.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-sm">{hotspot.name}</h5>
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(hotspot.severity)}`}
                        >
                          {hotspot.severity.charAt(0).toUpperCase() + hotspot.severity.slice(1)}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <span>Affected area: {hotspot.area.toLocaleString()} sq m</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <p>No encroachment hotspots detected</p>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LakeEncroachmentCard;

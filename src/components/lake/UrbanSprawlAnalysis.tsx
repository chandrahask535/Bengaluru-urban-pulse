
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, MapPin, Hexagon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UrbanSprawlAnalysisProps {
  lakeId: string;
  lakeName: string;
  coordinates: [number, number];
}

const UrbanSprawlAnalysis = ({ lakeId, lakeName, coordinates }: UrbanSprawlAnalysisProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setData({
        urbanizationRate: 34,
        proximityScore: 78,
        encroachmentZones: [
          { id: 1, name: "Northern Shore", severity: "high", area: 4500 },
          { id: 2, name: "Western Edge", severity: "medium", area: 2800 },
          { id: 3, name: "Eastern Side", severity: "low", area: 1200 }
        ],
        landUseChanges: {
          urban: {
            previous: 22,
            current: 34,
            change: 12
          },
          vegetation: {
            previous: 45,
            current: 33,
            change: -12
          },
          water: {
            previous: 33,
            current: 33,
            change: 0
          }
        },
        timelineData: [
          { year: 2000, urbanization: 15 },
          { year: 2005, urbanization: 18 },
          { year: 2010, urbanization: 24 },
          { year: 2015, urbanization: 28 },
          { year: 2020, urbanization: 31 },
          { year: 2025, urbanization: 34 }
        ]
      });
      setLoading(false);
    }, 1500);
  }, [lakeId]);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  if (loading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-lg">Urban Sprawl Analysis</CardTitle>
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
  
  return (
    <Card className="p-4 border-t-4 border-t-karnataka-metro-medium">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg flex items-center">
          <Building className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
          Urban Sprawl Analysis: {lakeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Urbanization Rate</h4>
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold">{data.urbanizationRate}%</div>
                <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">of surrounding area</div>
                <div className="ml-auto">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <Progress 
                value={data.urbanizationRate} 
                className="h-2 bg-gray-200 dark:bg-gray-700" 
                indicatorClassName="bg-karnataka-metro-medium"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Increased by {data.landUseChanges.urban.change}% in the last 20 years</span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Land Use Changes</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Urban</span>
                    <span className="font-medium">
                      {data.landUseChanges.urban.previous}% → {data.landUseChanges.urban.current}%
                      <span className="text-green-600 dark:text-green-400 ml-1">
                        (+{data.landUseChanges.urban.change}%)
                      </span>
                    </span>
                  </div>
                  <Progress value={data.landUseChanges.urban.current} className="h-1.5" indicatorClassName="bg-karnataka-metro-medium" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Vegetation</span>
                    <span className="font-medium">
                      {data.landUseChanges.vegetation.previous}% → {data.landUseChanges.vegetation.current}%
                      <span className="text-red-600 dark:text-red-400 ml-1">
                        ({data.landUseChanges.vegetation.change}%)
                      </span>
                    </span>
                  </div>
                  <Progress value={data.landUseChanges.vegetation.current} className="h-1.5" indicatorClassName="bg-karnataka-park-medium" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>Water</span>
                    <span className="font-medium">
                      {data.landUseChanges.water.previous}% → {data.landUseChanges.water.current}%
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        (0%)
                      </span>
                    </span>
                  </div>
                  <Progress value={data.landUseChanges.water.current} className="h-1.5" indicatorClassName="bg-karnataka-lake-medium" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-karnataka-metro-medium" />
              Encroachment Zones
            </h4>
            <div className="space-y-3">
              {data.encroachmentZones.map((zone: any) => (
                <div key={zone.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Hexagon className="h-4 w-4 mr-2 text-karnataka-metro-medium" />
                      <h5 className="font-medium">{zone.name}</h5>
                    </div>
                    <Badge className={getSeverityColor(zone.severity)}>
                      {zone.severity.charAt(0).toUpperCase() + zone.severity.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>Affected area: {zone.area.toLocaleString()} sq m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-karnataka-metro-medium" />
              Urbanization Timeline
            </h4>
            <div className="relative h-32 mt-4">
              <div className="absolute left-0 bottom-0 w-full h-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex h-full justify-between relative">
                {data.timelineData.map((item: any, index: number) => (
                  <div key={index} className="flex flex-col items-center justify-end">
                    <div 
                      className="bg-karnataka-metro-medium rounded-t w-4"
                      style={{ height: `${item.urbanization * 2}px` }}
                    ></div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-top-left">
                      {item.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrbanSprawlAnalysis;


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LakeDataService } from '@/services/LakeDataService';
import LakeRealTimeService from '@/services/LakeRealTimeService';
import { AlertTriangle, Clock, BarChart3, Droplet, Filter, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface LakeHistoricalDataProps {
  lakeId: string;
  lakeName: string;
}

const LakeHistoricalData = ({ lakeId, lakeName }: LakeHistoricalDataProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch historical data from LakeDataService
        const response = await LakeDataService.getHistoricalData(lakeId);
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch historical data');
        }
      } catch (err) {
        console.error('Error fetching lake historical data:', err);
        setError('Failed to load historical data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lakeId]);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        // Get lake coordinates
        const lakes = [
          { id: "bellandur", coordinates: [12.9373, 77.6402] as [number, number] },
          { id: "varthur", coordinates: [12.9417, 77.7341] as [number, number] },
          { id: "hebbal", coordinates: [13.0450, 77.5950] as [number, number] },
          { id: "ulsoor", coordinates: [12.9825, 77.6203] as [number, number] },
          { id: "sankey", coordinates: [13.0070, 77.5730] as [number, number] },
          { id: "agara", coordinates: [12.9236, 77.6336] as [number, number] },
        ];
        
        const lakeInfo = lakes.find(lake => lake.id === lakeId);
        
        if (lakeInfo) {
          const rtData = await LakeRealTimeService.getLakeRealTimeData(lakeId, lakeInfo.coordinates);
          setRealTimeData(rtData);
        }
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    };
    
    fetchRealTimeData();
  }, [lakeId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
            <span>Historical Data: {lakeName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-karnataka-lake-medium mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Loading historical data...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
            <span>Historical Data: {lakeName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const formatChartData = (data: any) => {
    if (!data || !data.dates) return [];
    
    return data.dates.map((date: string, i: number) => ({
      date,
      ph: data.ph ? data.ph[i] : 0,
      do: data.do ? data.do[i] : 0,
      encroachment: data.encroachment ? data.encroachment[i] : 0
    }));
  };

  // Format real-time water level data
  const formatWaterLevelData = (data: any) => {
    if (!data || !data.waterLevel) return [];
    
    return data.waterLevel.dates.map((date: string, i: number) => ({
      date,
      level: data.waterLevel.historic[i]
    }));
  };

  const chartData = formatChartData(data);
  const waterLevelData = formatWaterLevelData(realTimeData);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'falling':
        return <ArrowDownRight className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          <span>Historical Data: {lakeName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="water-quality">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="water-quality">Water Quality</TabsTrigger>
            <TabsTrigger value="water-level">Water Level</TabsTrigger>
            <TabsTrigger value="encroachment">Encroachment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="water-quality" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ph" stroke="#3b82f6" name="pH" />
                  <Line type="monotone" dataKey="do" stroke="#10b981" name="Dissolved Oxygen" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {realTimeData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Current pH</h3>
                    <Filter className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold mt-1">{realTimeData.waterQuality.ph.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last updated: {new Date(realTimeData.waterQuality.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Dissolved Oxygen</h3>
                    <Droplet className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold mt-1">{realTimeData.waterQuality.do.toFixed(1)} mg/L</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last updated: {new Date(realTimeData.waterQuality.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">BOD</h3>
                    <Filter className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold mt-1">{realTimeData.waterQuality.bod.toFixed(1)} mg/L</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last updated: {new Date(realTimeData.waterQuality.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="water-level" className="space-y-4">
            {realTimeData ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={waterLevelData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="level" stroke="#0ea5e9" name="Water Level (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">Current Water Level</h3>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Trend:</span>
                      {getTrendIcon(realTimeData.waterLevel.trend)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: `${realTimeData.waterLevel.current}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      Current capacity: {realTimeData.waterLevel.current.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Water level data not available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="encroachment" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="encroachment" stroke="#f59e0b" name="Encroachment (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {realTimeData && (
              <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
                <h3 className="font-medium text-amber-800 dark:text-amber-200">Encroachment Analysis</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                  Current encroachment: {realTimeData.encroachment.percentage}% of total lake area
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Detected hotspots: {realTimeData.encroachment.hotspots.length}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {new Date(realTimeData.encroachment.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {realTimeData && realTimeData.reports && realTimeData.reports.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Lake Reports</h3>
            <div className="space-y-3">
              {realTimeData.reports.map((report: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <h4 className="font-medium text-karnataka-metro-medium">{report.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{report.description}</p>
                  <p className="text-xs text-gray-500">{report.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LakeHistoricalData;

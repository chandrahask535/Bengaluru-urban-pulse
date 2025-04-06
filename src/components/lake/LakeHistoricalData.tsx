
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingDown, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { LakeDataService } from '@/services/LakeDataService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface LakeHistoricalDataProps {
  lakeId: string;
  lakeName: string;
}

const LakeHistoricalData = ({ lakeId, lakeName }: LakeHistoricalDataProps) => {
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await LakeDataService.getHistoricalData(lakeId);
        
        if (response.success && response.data) {
          setHistoricalData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch historical data');
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Could not load historical data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [lakeId]);

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (!values || values.length < 2) return 'neutral';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'rising';
    if (difference < -0.5) return 'falling';
    return 'stable';
  };

  const getTrendIcon = (trend: string, positiveIsGood: boolean = true) => {
    if (trend === 'rising') {
      return positiveIsGood ? 
        <TrendingUp className="h-4 w-4 text-green-500" /> : 
        <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (trend === 'falling') {
      return positiveIsGood ? 
        <TrendingDown className="h-4 w-4 text-red-500" /> : 
        <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return <ChevronUp className="h-4 w-4 text-gray-500 rotate-90" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-karnataka-rain-medium" />
          Historical Data
        </CardTitle>
        <CardDescription>
          Tracking changes over time for {lakeName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-karnataka-lake-medium mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Loading historical data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          </div>
        ) : historicalData ? (
          <Tabs defaultValue="ph">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ph">pH Level</TabsTrigger>
              <TabsTrigger value="do">Dissolved Oxygen</TabsTrigger>
              <TabsTrigger value="encroachment">Encroachment</TabsTrigger>
            </TabsList>
            <TabsContent value="ph" className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    pH Trend: 
                  </span>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(calculateTrend(historicalData.ph), false)}
                    <span className="ml-1 text-sm">
                      {calculateTrend(historicalData.ph) === 'rising' ? 'Increasing' : 
                      calculateTrend(historicalData.ph) === 'falling' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current pH: 
                  </span>
                  <div className="text-lg font-bold">
                    {historicalData.ph[historicalData.ph.length - 1].toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historicalData.dates.map((date: string, index: number) => ({
                      date,
                      pH: historicalData.ph[index]
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 14]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="pH" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="do" className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    DO Trend: 
                  </span>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(calculateTrend(historicalData.do), true)}
                    <span className="ml-1 text-sm">
                      {calculateTrend(historicalData.do) === 'rising' ? 'Increasing' : 
                      calculateTrend(historicalData.do) === 'falling' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current DO: 
                  </span>
                  <div className="text-lg font-bold">
                    {historicalData.do[historicalData.do.length - 1].toFixed(1)} mg/L
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={historicalData.dates.map((date: string, index: number) => ({
                      date,
                      DO: historicalData.do[index]
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="DO" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="encroachment" className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Encroachment Trend: 
                  </span>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(calculateTrend(historicalData.encroachment), false)}
                    <span className="ml-1 text-sm">
                      {calculateTrend(historicalData.encroachment) === 'rising' ? 'Increasing' : 
                      calculateTrend(historicalData.encroachment) === 'falling' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current: 
                  </span>
                  <div className="text-lg font-bold">
                    {historicalData.encroachment[historicalData.encroachment.length - 1].toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={historicalData.dates.map((date: string, index: number) => ({
                      date,
                      encroachment: historicalData.encroachment[index]
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="encroachment" fill="#ff7f0e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">No historical data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LakeHistoricalData;

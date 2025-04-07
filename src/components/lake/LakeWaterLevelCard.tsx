
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Droplet, TrendingUp, TrendingDown, CalendarDays, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface LakeWaterLevelProps {
  lakeId: string;
  lakeName: string;
  waterLevelData?: {
    current: number;
    historic: number[];
    dates: string[];
    trend: 'rising' | 'falling' | 'stable';
    capacity: number;
    lastUpdated: string;
  };
  loading?: boolean;
}

const LakeWaterLevelCard = ({ 
  lakeId, 
  lakeName,
  waterLevelData,
  loading = false 
}: LakeWaterLevelProps) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // If no data provided, use sample data
  const data = waterLevelData || {
    current: 65,
    historic: [45, 48, 52, 58, 62, 65, 68, 72, 75, 70, 68, 65],
    dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    trend: 'stable' as const,
    capacity: 85,
    lastUpdated: '2025-04-06T09:30:00'
  };
  
  // Process data for chart
  const chartData = data.historic.map((level, index) => ({
    name: data.dates[index],
    level: level
  }));

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-red-500';
    if (value < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'rising':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'falling':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getTrendColor = () => {
    switch (data.trend) {
      case 'rising':
        return 'text-green-600 dark:text-green-400';
      case 'falling':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };
  
  const getTrendText = () => {
    switch (data.trend) {
      case 'rising':
        return 'Rising';
      case 'falling':
        return 'Falling';
      default:
        return 'Stable';
    }
  };
  
  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
          Water Level: {lakeName}
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <CalendarDays className="h-4 w-4 mr-1" />
          Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
        </div>
      </div>
      
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="historic">Historic</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500 mb-2">Current Level</h4>
              <div className="text-3xl font-bold mb-2">{data.current}%</div>
              <Progress value={data.current} className="h-2" indicatorClassName={getProgressColor(data.current)} />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Min: 0%</span>
                <span className="text-xs text-gray-500">Max: 100%</span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500 mb-2">Trend</h4>
              <div className="flex items-center">
                {getTrendIcon()}
                <span className={`text-xl font-bold ml-2 ${getTrendColor()}`}>{getTrendText()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {data.trend === 'rising' ? 'Water level is increasing' : 
                 data.trend === 'falling' ? 'Water level is decreasing' :
                 'Water level is stable'}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500 mb-2">Capacity Status</h4>
              <div className="text-3xl font-bold mb-2">{data.capacity}%</div>
              <Progress value={data.capacity} className="h-2" indicatorClassName={getProgressColor(data.capacity)} />
              <p className="text-sm text-gray-500 mt-2">
                {data.capacity > 80 ? 'Lake is near full capacity' : 
                 data.capacity > 50 ? 'Lake is at moderate capacity' :
                 'Lake is at low capacity'}
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="historic">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Historical Water Levels</h4>
              <div className="flex space-x-1">
                <Button 
                  variant={timeRange === 'weekly' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTimeRange('weekly')}
                  className="text-xs"
                >
                  Weekly
                </Button>
                <Button 
                  variant={timeRange === 'monthly' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTimeRange('monthly')}
                  className="text-xs"
                >
                  Monthly
                </Button>
                <Button 
                  variant={timeRange === 'yearly' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTimeRange('yearly')}
                  className="text-xs"
                >
                  Yearly
                </Button>
              </div>
            </div>
            
            <div className="h-72 w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Water Level']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#3b82f6" 
                    fill="url(#colorLevel)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Data shown for {timeRange === 'weekly' ? 'the last week' : timeRange === 'monthly' ? 'the last month' : 'the last year'}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LakeWaterLevelCard;

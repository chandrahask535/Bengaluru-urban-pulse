
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Droplet, Info, AlertTriangle, Waves, Activity } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface WaterQualityParameter {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  icon: React.ReactNode;
  description: string;
  status: 'good' | 'moderate' | 'poor';
}

interface LakeWaterQualityCardProps {
  lakeId: string;
  lakeName: string;
  waterQualityData?: {
    bod: number;
    do: number;
    ph: number;
    conductivity: number;
    turbidity: number;
    temperature: number;
    lastUpdated: string;
  };
  loading?: boolean;
}

const LakeWaterQualityCard = ({ 
  lakeId, 
  lakeName, 
  waterQualityData,
  loading = false 
}: LakeWaterQualityCardProps) => {
  const [activeTab, setActiveTab] = useState('parameters');
  
  // If no data provided, use sample data
  const data = waterQualityData || {
    bod: 15.2,
    do: 6.8,
    ph: 7.4, 
    conductivity: 420,
    turbidity: 7.5,
    temperature: 24.6,
    lastUpdated: '2025-04-06T09:30:00'
  };
  
  // Process parameters to include status information
  const parameters: WaterQualityParameter[] = [
    {
      name: 'Dissolved Oxygen',
      value: data.do,
      unit: 'mg/L',
      threshold: 5,
      icon: <Waves className="h-4 w-4" />,
      description: 'The amount of oxygen dissolved in water. Higher levels support aquatic life.',
      status: data.do >= 6 ? 'good' : data.do >= 4 ? 'moderate' : 'poor'
    },
    {
      name: 'Biochemical Oxygen Demand',
      value: data.bod,
      unit: 'mg/L',
      threshold: 10,
      icon: <Activity className="h-4 w-4" />,
      description: 'Amount of oxygen needed by organisms to break down organic material. Lower is better.',
      status: data.bod <= 5 ? 'good' : data.bod <= 15 ? 'moderate' : 'poor'
    },
    {
      name: 'pH Level',
      value: data.ph,
      unit: '',
      threshold: 7,
      icon: <Droplet className="h-4 w-4" />,
      description: 'Measure of how acidic/basic water is. Ideal range is 6.5-8.5.',
      status: (data.ph >= 6.5 && data.ph <= 8.5) ? 'good' : 
              (data.ph >= 6 && data.ph <= 9) ? 'moderate' : 'poor'
    },
    {
      name: 'Turbidity',
      value: data.turbidity,
      unit: 'NTU',
      threshold: 10,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Cloudiness of water caused by suspended particles. Lower is clearer.',
      status: data.turbidity < 5 ? 'good' : data.turbidity < 10 ? 'moderate' : 'poor'
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getProgressValue = (param: WaterQualityParameter) => {
    // Normalize values to percentages
    if (param.name === 'Dissolved Oxygen') {
      return Math.min(100, (param.value / 10) * 100);
    } else if (param.name === 'Biochemical Oxygen Demand') {
      return Math.min(100, (param.value / 30) * 100);
    } else if (param.name === 'pH Level') {
      return Math.min(100, Math.abs((param.value - 7) / 7) * 100);
    } else if (param.name === 'Turbidity') {
      return Math.min(100, (param.value / 20) * 100); 
    }
    return 50;
  };
  
  const getOverallStatus = () => {
    const poorParams = parameters.filter(p => p.status === 'poor').length;
    const moderateParams = parameters.filter(p => p.status === 'moderate').length;
    
    if (poorParams > 0) return 'Poor';
    if (moderateParams > 1) return 'Moderate';
    return 'Good';
  };
  
  const overallStatus = getOverallStatus();
  
  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
          Water Quality: {lakeName}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-80">
              <p className="text-sm">Water quality is assessed based on key parameters including dissolved oxygen, 
              biochemical oxygen demand (BOD), pH level, and turbidity. These indicators help determine if the 
              lake water is suitable for aquatic life and safe for human activities.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parameters">
          <div className="space-y-4">
            {parameters.map((param, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      param.status === 'good' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                      param.status === 'moderate' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    }`}>
                      {param.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{param.name}</h4>
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${getStatusColor(param.status)}`}>
                          {param.value} {param.unit}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 p-0">
                                <Info className="h-3 w-3 text-gray-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-56">
                              <p className="text-xs">{param.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium capitalize px-2 py-1 rounded-full bg-opacity-20 dark:bg-opacity-20 
                    ${param.status === 'good' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                    param.status === 'moderate' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                    'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}"
                  >
                    {param.status}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={getProgressValue(param)} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(param.status)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="summary">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                ${overallStatus === 'Good' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                overallStatus === 'Moderate' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}`}
              >
                {overallStatus === 'Good' ? 'A' : overallStatus === 'Moderate' ? 'B' : 'C'}
              </div>
            </div>
            
            <h4 className="text-center text-lg font-medium mb-2">
              Overall Water Quality: <span className={
                overallStatus === 'Good' ? 'text-green-600 dark:text-green-400' :
                overallStatus === 'Moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }>{overallStatus}</span>
            </h4>
            
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
              {overallStatus === 'Good' ? 
                'The water quality is good and supports aquatic life. Safe for recreational activities.' :
                overallStatus === 'Moderate' ? 
                'Some parameters need attention. Limited impact on aquatic ecosystem.' :
                'Poor water quality. Requires immediate intervention to improve conditions.'
              }
            </p>
            
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LakeWaterQualityCard;

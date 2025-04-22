
import { Card } from '@/components/ui/card';
import { Building, MapPin, AlertTriangle, Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EncroachmentHotspot {
  id: number;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: number;
  description: string;
  coordinates: [number, number];
}

interface LakeEncroachmentCardProps {
  lakeId: string;
  lakeName: string;
  encroachmentData?: {
    percentage: number;
    totalArea: number;
    hotspots: EncroachmentHotspot[];
    lastUpdated: string;
  };
  loading?: boolean;
}

const LakeEncroachmentCard = ({ 
  lakeId, 
  lakeName, 
  encroachmentData,
  loading = false 
}: LakeEncroachmentCardProps) => {
  // If no data provided, use sample data
  const data = encroachmentData || {
    percentage: 22,
    totalArea: 15600,
    hotspots: [
      {
        id: 1,
        name: "Northeast Shore",
        severity: "high" as const,
        area: 4500,
        description: "Commercial development expanding into protected zone",
        coordinates: [12.958, 77.648]
      },
      {
        id: 2,
        name: "Western Edge",
        severity: "medium" as const,
        area: 2800,
        description: "Informal settlements along lake periphery",
        coordinates: [12.942, 77.632] 
      },
      {
        id: 3,
        name: "Southern Bank",
        severity: "critical" as const,
        area: 6200,
        description: "Industrial waste dumping and construction activity",
        coordinates: [12.936, 77.637]
      },
      {
        id: 4,
        name: "Eastern Inlet",
        severity: "low" as const,
        area: 2100,
        description: "Minor agricultural encroachment affecting water flow",
        coordinates: [12.950, 77.646]
      }
    ],
    lastUpdated: "2025-04-02T14:30:00"
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getEncroachmentLevel = () => {
    if (data.percentage > 30) return "Severe";
    if (data.percentage > 15) return "Significant";
    if (data.percentage > 5) return "Moderate";
    return "Low";
  };

  const getEncroachmentColor = () => {
    if (data.percentage > 30) return "text-red-600 dark:text-red-400";
    if (data.percentage > 15) return "text-orange-600 dark:text-orange-400";
    if (data.percentage > 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };
  
  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
        <div className="flex space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
        <div className="h-[1px] bg-gray-200 dark:bg-gray-700 w-full my-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 border-t-4 border-t-karnataka-metro-medium">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg flex items-center">
          <Building className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
          Encroachment Analysis: {lakeName}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-80">
              <p className="text-sm">Encroachment refers to unauthorized structures or development that reduces lake area or affects water quality.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
          <span className={`text-xl font-bold ${getEncroachmentColor()}`}>{data.percentage}%</span>
          <svg className="absolute inset-0" width="64" height="64" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${data.percentage * 1.76} 176`}
              strokeLinecap="round"
              className={getEncroachmentColor()}
              transform="rotate(-90 32 32)"
            />
          </svg>
        </div>
        <div>
          <div className="flex items-center">
            <h4 className="font-medium">{getEncroachmentLevel()} Encroachment</h4>
            {data.percentage > 15 && (
              <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.percentage}% of lake area affected ({(data.totalArea * data.percentage / 100).toFixed(0)} sq. m)
          </p>
        </div>
      </div>
      
      <div className="h-px bg-gray-200 dark:bg-gray-700 w-full my-4"></div>
      
      <h4 className="text-sm font-medium mb-3">Encroachment Hotspots:</h4>
      <div className="space-y-3">
        {data.hotspots.map(hotspot => (
          <div key={hotspot.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-karnataka-metro-light" />
                  <h5 className="font-medium text-sm">{hotspot.name}</h5>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hotspot.description}</p>
              </div>
              <Badge className={getSeverityColor(hotspot.severity)}>
                {hotspot.severity && typeof hotspot.severity === 'string' 
                  ? hotspot.severity.charAt(0).toUpperCase() + hotspot.severity.slice(1) 
                  : 'Unknown'}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Area: {hotspot.area ? hotspot.area.toLocaleString() : 'Unknown'} sq. m</span>
              <span>
                {hotspot.coordinates && hotspot.coordinates.length >= 2 
                  ? `${hotspot.coordinates[0].toFixed(4)}, ${hotspot.coordinates[1].toFixed(4)}`
                  : 'Unknown location'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LakeEncroachmentCard;

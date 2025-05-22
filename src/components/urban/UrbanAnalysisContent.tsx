
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBar, TrendingUp, Building, CloudRain, ArrowDownToLine, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface UrbanAnalysisContentProps {
  locationId: string | null;
  locationName?: string;
}

const UrbanAnalysisContent = ({ locationId, locationName = 'Selected Location' }: UrbanAnalysisContentProps) => {
  const [loading, setLoading] = useState(false);
  const [urbanizationData, setUrbanizationData] = useState<any[]>([]);
  const [landUseData, setLandUseData] = useState<any[]>([]);
  const [rainfallData, setRainfallData] = useState<any[]>([]);

  useEffect(() => {
    if (!locationId) return;
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate data based on locationId
      const yearRange = [2000, 2005, 2010, 2015, 2020, 2025];
      
      // Urbanization trend data
      const urbanData = yearRange.map(year => {
        // Different growth rates for different locations
        let growthFactor;
        if (locationId === 'location1') growthFactor = 1.2;
        else if (locationId === 'location2') growthFactor = 0.8;
        else growthFactor = 1.0;
        
        // Base growth plus location-specific factor
        const baseUrbanization = 10 + (year - 2000) / 25 * 15;
        return {
          year: year,
          urbanization: Math.round(baseUrbanization * growthFactor),
          population: Math.round((500000 + (year - 2000) * 25000) * growthFactor)
        };
      });
      setUrbanizationData(urbanData);
      
      // Land use data - varies by location
      let landUse;
      if (locationId === 'location1') {
        landUse = [
          { type: 'Commercial', percentage: 60 },
          { type: 'Residential', percentage: 30 },
          { type: 'Parks', percentage: 10 }
        ];
      } else if (locationId === 'location2') {
        landUse = [
          { type: 'Residential', percentage: 70 },
          { type: 'Parks', percentage: 20 },
          { type: 'Commercial', percentage: 10 }
        ];
      } else {
        landUse = [
          { type: 'Industrial', percentage: 80 },
          { type: 'Commercial', percentage: 15 },
          { type: 'Residential', percentage: 5 }
        ];
      }
      setLandUseData(landUse);
      
      // Rainfall data - simulates annual pattern with location variations
      const rainfall = yearRange.map(year => {
        // Different rainfall patterns for different locations
        let rainfallFactor;
        if (locationId === 'location1') rainfallFactor = 1.0;
        else if (locationId === 'location2') rainfallFactor = 1.2;
        else rainfallFactor = 0.9;
        
        return {
          year: year,
          annual: Math.round(900 * rainfallFactor + Math.random() * 200),
          monsoon: Math.round(600 * rainfallFactor + Math.random() * 150),
          flood_events: Math.floor(Math.random() * 3 * rainfallFactor)
        };
      });
      setRainfallData(rainfall);
      
      setLoading(false);
    }, 1000);
    
  }, [locationId]);

  if (!locationId) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Location Selected</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a location from the map to view detailed urban analysis
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-karnataka-metro-medium mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading analysis data...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="urbanization">
        <TabsList>
          <TabsTrigger value="urbanization">
            <Building className="h-4 w-4 mr-2" />
            Urbanization
          </TabsTrigger>
          <TabsTrigger value="landuse">
            <Layers className="h-4 w-4 mr-2" />
            Land Use
          </TabsTrigger>
          <TabsTrigger value="rainfall">
            <CloudRain className="h-4 w-4 mr-2" />
            Rainfall
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="urbanization" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                Urbanization Trend for {locationName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={urbanizationData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="urbanization" 
                      name="Urban Area (%)" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="population" 
                      name="Population" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Urban Growth Rate</div>
                  <div className="text-2xl font-bold">
                    +{Math.round((urbanizationData[urbanizationData.length-1]?.urbanization - urbanizationData[0]?.urbanization) / urbanizationData[0]?.urbanization * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Over 25 years</div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Population Growth</div>
                  <div className="text-2xl font-bold">
                    +{Math.round((urbanizationData[urbanizationData.length-1]?.population - urbanizationData[0]?.population) / 1000)}k
                  </div>
                  <div className="text-xs text-gray-500">Over 25 years</div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Annual Expansion</div>
                  <div className="text-2xl font-bold">
                    {Math.round((urbanizationData[urbanizationData.length-1]?.urbanization - urbanizationData[0]?.urbanization) / 25 * 10) / 10}%
                  </div>
                  <div className="text-xs text-gray-500">Per year</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="landuse" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Layers className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                Land Use Distribution for {locationName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={landUseData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                    <Bar dataKey="percentage" name="Land Use %" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Land Use Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {locationName} shows a predominant {landUseData[0]?.type.toLowerCase()} land use pattern, 
                  which accounts for {landUseData[0]?.percentage}% of the total area. This suggests a 
                  {landUseData[0]?.type === 'Residential' 
                    ? ' residential neighborhood with supporting commercial zones.' 
                    : landUseData[0]?.type === 'Commercial' 
                      ? ' commercial district with mixed-use development.' 
                      : landUseData[0]?.type === 'Industrial' 
                        ? 'n industrial area with limited residential development.' 
                        : ' mixed-use area.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rainfall" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CloudRain className="h-5 w-5 mr-2 text-bengaluru-rain-medium" />
                Rainfall Patterns for {locationName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rainfallData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" unit="mm" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="annual" name="Annual Rainfall (mm)" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="monsoon" name="Monsoon Rainfall (mm)" fill="#60a5fa" />
                    <Bar yAxisId="right" dataKey="flood_events" name="Flood Events" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Annual Rainfall</div>
                  <div className="text-2xl font-bold">
                    {Math.round(rainfallData.reduce((acc, curr) => acc + curr.annual, 0) / rainfallData.length)} mm
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Monsoon Contribution</div>
                  <div className="text-2xl font-bold">
                    {Math.round(rainfallData.reduce((acc, curr) => acc + curr.monsoon, 0) / rainfallData.reduce((acc, curr) => acc + curr.annual, 0) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Of annual rainfall</div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Flood Events</div>
                  <div className="text-2xl font-bold">
                    {rainfallData.reduce((acc, curr) => acc + curr.flood_events, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Over 25 years</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UrbanAnalysisContent;

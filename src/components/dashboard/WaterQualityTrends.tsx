
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Beaker, AlertTriangle, CheckCircle, Info, Droplet } from "lucide-react";

const WaterQualityTrends = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLake, setSelectedLake] = useState("bellandur");

  // Water quality data with actual metrics
  const qualityData = {
    bellandur: {
      overall: 42,
      ph: 7.2,
      oxygen: 4.8,
      turbidity: 15.3,
      pollutants: 8.2,
      trend: "improving"
    },
    ulsoor: {
      overall: 68,
      ph: 7.8,
      oxygen: 6.2,
      turbidity: 8.7,
      pollutants: 4.1,
      trend: "stable"
    }
  };

  // Historical trend data for charts
  const historicalData = [
    { month: "Jan", bellandur: 38, ulsoor: 65, bellandurPH: 6.8, ulsoorPH: 7.6 },
    { month: "Feb", bellandur: 41, ulsoor: 67, bellandurPH: 7.0, ulsoorPH: 7.7 },
    { month: "Mar", bellandur: 39, ulsoor: 64, bellandurPH: 6.9, ulsoorPH: 7.5 },
    { month: "Apr", bellandur: 44, ulsoor: 69, bellandurPH: 7.1, ulsoorPH: 7.8 },
    { month: "May", bellandur: 42, ulsoor: 68, bellandurPH: 7.2, ulsoorPH: 7.8 }
  ];

  // Pollution sources data
  const pollutionData = [
    { source: "Industrial", bellandur: 45, ulsoor: 20 },
    { source: "Sewage", bellandur: 35, ulsoor: 30 },
    { source: "Runoff", bellandur: 20, ulsoor: 50 }
  ];

  const getQualityStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500", textColor: "text-green-800" };
    if (score >= 60) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-800" };
    if (score >= 40) return { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-800" };
    return { label: "Poor", color: "bg-red-500", textColor: "text-red-800" };
  };

  const currentData = qualityData[selectedLake as keyof typeof qualityData];
  const status = getQualityStatus(currentData.overall);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Beaker className="h-5 w-5 text-purple-500" />
          Water Quality Monitor
        </CardTitle>
        <CardDescription className="text-sm">
          Real-time quality assessment and pollution tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
            <TabsTrigger value="pollution" className="text-xs">Sources</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-3 mt-3">
            <div className="flex gap-2 mb-3">
              <Button
                variant={selectedLake === "bellandur" ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedLake("bellandur")}
              >
                Bellandur
              </Button>
              <Button
                variant={selectedLake === "ulsoor" ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedLake("ulsoor")}
              >
                Ulsoor
              </Button>
            </div>

            {/* Quality Score Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Quality</span>
                <Badge className={`${status.color} text-white text-xs`}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">{currentData.overall}%</div>
                <div className="flex-1">
                  <Progress value={currentData.overall} className="h-2" />
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="text-xs text-gray-600 dark:text-gray-400">pH Level</div>
                <div className="text-lg font-semibold">{currentData.ph}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="text-xs text-gray-600 dark:text-gray-400">Oxygen (mg/L)</div>
                <div className="text-lg font-semibold">{currentData.oxygen}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="text-xs text-gray-600 dark:text-gray-400">Turbidity (NTU)</div>
                <div className="text-lg font-semibold">{currentData.turbidity}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                <div className="text-xs text-gray-600 dark:text-gray-400">Pollutants (ppm)</div>
                <div className="text-lg font-semibold">{currentData.pollutants}</div>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {currentData.trend === "improving" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : currentData.trend === "stable" ? (
                <Info className="h-4 w-4 text-blue-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="capitalize">{currentData.trend} trend over last 30 days</span>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-3 mt-3">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[30, 80]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Quality Score']}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line 
                    type="monotone" 
                    dataKey="bellandur" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Bellandur"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ulsoor" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Ulsoor"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Current pH</span>
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {currentData.ph}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Oxygen Level</span>
                </div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                  {currentData.oxygen} mg/L
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pollution" className="space-y-3 mt-3">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pollutionData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Contribution']}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="bellandur" fill="#ef4444" name="Bellandur" />
                  <Bar dataKey="ulsoor" fill="#3b82f6" name="Ulsoor" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-2 mt-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-red-800 dark:text-red-200">High Pollution</div>
                  <div className="text-xs text-red-700 dark:text-red-300">Bellandur Lake - Industrial discharge detected</div>
                </div>
                <Badge variant="destructive" className="text-xs">Critical</Badge>
              </div>
              
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">pH Fluctuation</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">Ulsoor Lake - Monitoring required</div>
                </div>
                <Badge variant="outline" className="text-xs">Warning</Badge>
              </div>

              <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Quality Improving</div>
                  <div className="text-xs text-green-700 dark:text-green-300">Treatment efforts showing positive results</div>
                </div>
                <Badge variant="outline" className="text-xs">Good</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WaterQualityTrends;

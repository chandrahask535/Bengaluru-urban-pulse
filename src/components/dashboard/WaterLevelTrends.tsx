
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, TrendingUp, TrendingDown, Calendar, MapPin } from "lucide-react";

const WaterLevelTrends = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [selectedLake, setSelectedLake] = useState("bellandur");

  // Sample data with proper decimal formatting
  const waterLevelData = {
    bellandur: [
      { date: "2024-01", level: 12.5, capacity: 85, trend: "up" },
      { date: "2024-02", level: 11.9, capacity: 80, trend: "down" },
      { date: "2024-03", level: 13.1, capacity: 91, trend: "up" },
      { date: "2024-04", level: 10.7, capacity: 74, trend: "down" },
      { date: "2024-05", level: 14.2, capacity: 97, trend: "up" },
    ],
    ulsoor: [
      { date: "2024-01", level: 8.3, capacity: 82, trend: "up" },
      { date: "2024-02", level: 7.9, capacity: 79, trend: "down" },
      { date: "2024-03", level: 9.2, capacity: 89, trend: "up" },
      { date: "2024-04", level: 7.4, capacity: 75, trend: "down" },
      { date: "2024-05", level: 10.1, capacity: 94, trend: "up" },
    ]
  };

  const currentLevels = {
    bellandur: { current: 14.2, danger: 16.0, warning: 14.5 },
    ulsoor: { current: 10.1, danger: 12.0, warning: 11.0 }
  };

  const getLevelStatus = (current: number, warning: number, danger: number) => {
    if (current >= danger) return { status: "Critical", color: "bg-red-500" };
    if (current >= warning) return { status: "Warning", color: "bg-orange-500" };
    return { status: "Normal", color: "bg-green-500" };
  };

  const currentLevel = currentLevels[selectedLake as keyof typeof currentLevels];
  const levelStatus = getLevelStatus(currentLevel.current, currentLevel.warning, currentLevel.danger);
  const capacityPercentage = Math.round((currentLevel.current / currentLevel.danger) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Water Level Trends
        </CardTitle>
        <CardDescription>
          Real-time monitoring and historical trends for Karnataka's major water bodies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Status</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedLake === "bellandur" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLake("bellandur")}
              >
                Bellandur Lake
              </Button>
              <Button
                variant={selectedLake === "ulsoor" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLake("ulsoor")}
              >
                Ulsoor Lake
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Level</span>
                  <Badge className={levelStatus.color}>{levelStatus.status}</Badge>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {currentLevel.current}m
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  Capacity: {capacityPercentage}%
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Warning Level</span>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {currentLevel.warning}m
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">
                  {(currentLevel.warning - currentLevel.current).toFixed(1)}m below
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Danger Level</span>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {currentLevel.danger}m
                </div>
                <div className="text-sm text-red-600 dark:text-red-300">
                  {(currentLevel.danger - currentLevel.current).toFixed(1)}m below
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Recent Changes</h4>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>+0.3m increase in last 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waterLevelData[selectedLake as keyof typeof waterLevelData]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value + 'm', 'Water Level']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Water Level (m)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Water Level Rising</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Bellandur Lake approaching warning threshold
                  </div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-green-800 dark:text-green-200">Normal Levels</div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Ulsoor Lake maintaining optimal water levels
                  </div>
                </div>
                <Badge variant="outline">Resolved</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WaterLevelTrends;

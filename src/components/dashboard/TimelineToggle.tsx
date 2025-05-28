
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Layers, Eye, EyeOff } from "lucide-react";

interface LayerConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  color: string;
}

const TimelineToggle = () => {
  const [activeYear, setActiveYear] = useState("2024");
  const [layers, setLayers] = useState<LayerConfig[]>([
    {
      id: "satellite",
      name: "Satellite Imagery",
      description: "High-resolution satellite views",
      enabled: true,
      color: "bg-blue-500"
    },
    {
      id: "flood-zones",
      name: "Flood Risk Zones",
      description: "Historical flood-prone areas",
      enabled: false,
      color: "bg-red-500"
    },
    {
      id: "urban-growth",
      name: "Urban Development",
      description: "City expansion patterns",
      enabled: false,
      color: "bg-green-500"
    },
    {
      id: "water-bodies",
      name: "Water Bodies",
      description: "Lakes, rivers, and reservoirs",
      enabled: true,
      color: "bg-cyan-500"
    },
    {
      id: "vegetation",
      name: "Vegetation Cover",
      description: "Forest and green cover analysis",
      enabled: false,
      color: "bg-emerald-500"
    }
  ]);

  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, enabled: !layer.enabled }
        : layer
    ));
  };

  const enabledLayersCount = layers.filter(layer => layer.enabled).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Timeline & Layer Control
        </CardTitle>
        <CardDescription>
          Control map layers and view historical changes over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="layers">Layers ({enabledLayersCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Select Year</span>
                <Badge variant="outline">{activeYear}</Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant={activeYear === year ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveYear(year)}
                    className="text-sm"
                  >
                    {year}
                  </Button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Viewing: {activeYear} Data
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {activeYear === "2024" && "Latest satellite imagery with real-time updates"}
                  {activeYear === "2023" && "Post-monsoon analysis showing seasonal changes"}
                  {activeYear === "2022" && "Major urban development and infrastructure changes"}
                  {activeYear === "2021" && "COVID-19 impact on urban growth patterns"}
                  {activeYear === "2020" && "Pre-pandemic baseline data for comparison"}
                  {activeYear === "2019" && "Historical reference point for trend analysis"}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layers" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-green-500" />
                <span className="font-medium">Map Layers</span>
                <Badge variant="secondary">{enabledLayersCount} Active</Badge>
              </div>
              
              {layers.map((layer) => (
                <div 
                  key={layer.id}
                  className={`p-3 rounded-lg border transition-all ${
                    layer.enabled 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${layer.color}`}></div>
                      <div>
                        <div className="font-medium text-sm">{layer.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {layer.description}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLayer(layer.id)}
                      className="h-8 w-8 p-0"
                    >
                      {layer.enabled ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium mb-2">Layer Controls</div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setLayers(prev => prev.map(l => ({ ...l, enabled: true })))}
                  >
                    Enable All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setLayers(prev => prev.map(l => ({ ...l, enabled: false })))}
                  >
                    Disable All
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimelineToggle;

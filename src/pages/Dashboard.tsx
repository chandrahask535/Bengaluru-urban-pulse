
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { BarChart3, CloudRain, Droplet, Building, Filter, AlertTriangle, Calendar, MapPin, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import WeatherForecastCard from "@/components/weather/WeatherForecastCard";
import { toast } from "sonner";
import MapBoxComponent from "@/components/maps/MapBoxComponent";
import { generateHeatmapData } from "@/utils/mapUtils";

// Region coordinates map
const regionCoordinates: Record<string, [number, number]> = {
  'bengaluru-urban': [12.9716, 77.5946],
  'bengaluru-rural': [13.2375, 77.7114],
  'east-bengaluru': [12.9968, 77.6603],
  'west-bengaluru': [12.9719, 77.5227],
  'north-bengaluru': [13.0550, 77.5941],
  'south-bengaluru': [12.9226, 77.6174]
};

// Region display names
const regionNames: Record<string, string> = {
  'bengaluru-urban': 'Bengaluru Urban',
  'bengaluru-rural': 'Bengaluru Rural',
  'east-bengaluru': 'East Bengaluru',
  'west-bengaluru': 'West Bengaluru',
  'north-bengaluru': 'North Bengaluru',
  'south-bengaluru': 'South Bengaluru'
};

// Get current date and time
const getCurrentDateTime = (): string => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("bengaluru-urban");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Array<any>>([]);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [floodPredictionMapData, setFloodPredictionMapData] = useState<any>([]);
  const [showFloodHeatmap, setShowFloodHeatmap] = useState(true);
  
  const regions = [
    { id: "bengaluru-urban", name: "Bengaluru Urban" },
    { id: "bengaluru-rural", name: "Bengaluru Rural" },
    { id: "east-bengaluru", name: "East Bengaluru" },
    { id: "west-bengaluru", name: "West Bengaluru" },
    { id: "north-bengaluru", name: "North Bengaluru" },
    { id: "south-bengaluru", name: "South Bengaluru" },
  ];

  // Generate current alerts based on region
  const generateCurrentAlerts = useCallback((regionId: string) => {
    // Generate region-specific alerts
    const regionCoord = regionCoordinates[regionId];
    const baseAlerts = [
      {
        id: 1,
        type: "Flooding",
        area: regionId.includes('east') ? "Whitefield, Bengaluru" : 
              regionId.includes('south') ? "Koramangala, Bengaluru" :
              "HSR Layout, Bengaluru",
        severity: regionId.includes('east') ? "High" : 
                regionId.includes('south') ? "Moderate" : "Low",
        description: `Heavy rainfall ${regionId.includes('east') ? 'causing' : 'may cause'} flash floods. ${regionId.includes('east') ? 'Avoid low-lying areas.' : 'Monitor local conditions.'}`,
        time: "2 hours ago",
      },
      {
        id: 2,
        type: "Lake Encroachment",
        area: regionId.includes('east') ? "Varthur Lake" : 
              regionId.includes('south') ? "Bellandur Lake" : 
              "Hebbal Lake",
        severity: regionId.includes('east') ? "Critical" :
                regionId.includes('south') ? "High" : "Moderate",
        description: `${regionId.includes('east') || regionId.includes('south') ? 'New construction detected in lake buffer zone. Investigation underway.' : 'Potential encroachment detected. Monitoring in progress.'}`,
        time: "Yesterday",
      }
    ];
    
    // Add region-specific alert
    if (regionId === "bengaluru-urban") {
      baseAlerts.push({
        id: 3,
        type: "Water Quality",
        area: "Multiple Lakes",
        severity: "High",
        description: "High levels of pollutants detected in 5 major lakes. Water treatment required urgently.",
        time: "1 day ago",
      });
    } else if (regionId === "bengaluru-rural") {
      baseAlerts.push({
        id: 3,
        type: "Deforestation",
        area: "Bannerghatta Border",
        severity: "Moderate",
        description: "Unauthorized clearing detected in protected green zone. Authorities notified.",
        time: "3 days ago",
      });
    } else if (regionId.includes("east")) {
      baseAlerts.push({
        id: 3,
        type: "Traffic Congestion",
        area: "Outer Ring Road",
        severity: "High",
        description: "Severe water logging causing traffic blockages. Avoid area if possible.",
        time: "4 hours ago",
      });
    } else if (regionId.includes("west")) {
      baseAlerts.push({
        id: 3,
        type: "Drainage Issue",
        area: "Rajajinagar",
        severity: "Moderate",
        description: "Multiple drain blockages reported. Maintenance team dispatched.",
        time: "6 hours ago",
      });
    }
    
    // Always add urban planning alert
    baseAlerts.push({
      id: 4,
      type: "Urban Planning",
      area: regionId.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase()),
      severity: "Low",
      description: "Unplanned development may lead to drainage issues. Planning review recommended.",
      time: "1 week ago",
    });
    
    return baseAlerts;
  }, []);

  // Generate flood prediction map data based on region
  const generateFloodPredictionData = useCallback((regionId: string) => {
    const regionCoord = regionCoordinates[regionId];
    
    // Base locations with different risk levels
    const locations = [
      {
        id: "loc1",
        name: `${regionNames[regionId]} - High Risk Area`,
        coordinates: [regionCoord[0] + 0.02, regionCoord[1] - 0.03] as [number, number],
        details: {
          floodRisk: "High",
          floodRiskValue: 85,
          greenCoverage: 15,
          infrastructureScore: 30,
          landUseTypes: [
            { type: "Urban", percentage: 75 },
            { type: "Green", percentage: 15 },
            { type: "Water", percentage: 10 }
          ],
          issues: ["Poor drainage", "Low elevation", "Dense construction"]
        }
      },
      {
        id: "loc2",
        name: `${regionNames[regionId]} - Moderate Risk Area`,
        coordinates: [regionCoord[0] - 0.01, regionCoord[1] + 0.02] as [number, number],
        details: {
          floodRisk: "Moderate",
          floodRiskValue: 55,
          greenCoverage: 30,
          infrastructureScore: 50,
          landUseTypes: [
            { type: "Urban", percentage: 60 },
            { type: "Green", percentage: 30 },
            { type: "Water", percentage: 10 }
          ],
          issues: ["Partial drainage blockages", "Moderate density housing"]
        }
      },
      {
        id: "loc3",
        name: `${regionNames[regionId]} - Low Risk Area`,
        coordinates: [regionCoord[0] + 0.01, regionCoord[1] + 0.01] as [number, number],
        details: {
          floodRisk: "Low",
          floodRiskValue: 25,
          greenCoverage: 50,
          infrastructureScore: 70,
          landUseTypes: [
            { type: "Urban", percentage: 45 },
            { type: "Green", percentage: 50 },
            { type: "Water", percentage: 5 }
          ],
          issues: ["Some low-lying sections"]
        }
      }
    ];
    
    // Add region-specific high-risk location
    if (regionId === "bengaluru-urban") {
      locations.push({
        id: "loc4",
        name: "Central Business District",
        coordinates: [regionCoord[0], regionCoord[1]] as [number, number],
        details: {
          floodRisk: "Critical",
          floodRiskValue: 95,
          greenCoverage: 5,
          infrastructureScore: 20,
          landUseTypes: [
            { type: "Urban", percentage: 92 },
            { type: "Green", percentage: 5 },
            { type: "Water", percentage: 3 }
          ],
          issues: ["Completely paved surfaces", "Old drainage system", "High building density"]
        }
      });
    } else if (regionId.includes("east")) {
      locations.push({
        id: "loc4",
        name: "Tech Corridor",
        coordinates: [regionCoord[0] - 0.01, regionCoord[1] - 0.01] as [number, number],
        details: {
          floodRisk: "High",
          floodRiskValue: 80,
          greenCoverage: 10,
          infrastructureScore: 35,
          landUseTypes: [
            { type: "Urban", percentage: 85 },
            { type: "Green", percentage: 10 },
            { type: "Water", percentage: 5 }
          ],
          issues: ["Rapid development", "Insufficient drainage capacity", "Former lake beds"]
        }
      });
    }
    
    return locations;
  }, []);

  // Update alerts when region changes
  useEffect(() => {
    setAlerts(generateCurrentAlerts(selectedRegion));
    setFloodPredictionMapData(generateFloodPredictionData(selectedRegion));
  }, [selectedRegion, generateCurrentAlerts, generateFloodPredictionData]);

  // Update current date/time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Handle region change
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    // Reset weather data to trigger a new fetch
    setWeatherData(null);
  };

  // Handle view alert details
  const handleViewDetails = (alertId: number) => {
    // Find the alert
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      toast(`Alert Details: ${alert.type}`, {
        description: `${alert.area} - ${alert.description}`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {}
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Bengaluru Urban Pulse Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comprehensive view of Bengaluru's urban management metrics | {currentDateTime}
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={selectedRegion} onValueChange={handleRegionChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Rainfall Today"
              description={`Average across ${regionNames[selectedRegion]}`}
              icon={CloudRain}
              iconColor="text-bengaluru-rain-medium"
            >
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">
                  {selectedRegion === "bengaluru-urban" ? "32.4" :
                   selectedRegion === "bengaluru-rural" ? "28.6" :
                   selectedRegion === "east-bengaluru" ? "35.2" :
                   selectedRegion === "west-bengaluru" ? "30.1" :
                   selectedRegion === "north-bengaluru" ? "27.8" : "33.5"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">mm</span>
              </div>
              <p className="text-sm text-red-500 mt-1">
                {selectedRegion === "east-bengaluru" ? "85% above average for June" :
                 selectedRegion === "south-bengaluru" ? "70% above average for June" :
                 "65% above average for June"}
              </p>
            </DashboardCard>

            <DashboardCard
              title="Lake Health Index"
              description={`Average across monitored lakes in ${regionNames[selectedRegion]}`}
              icon={Droplet}
              iconColor="text-bengaluru-lake-medium"
            >
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">
                  {selectedRegion === "bengaluru-urban" ? "62" :
                   selectedRegion === "bengaluru-rural" ? "78" :
                   selectedRegion === "east-bengaluru" ? "54" :
                   selectedRegion === "west-bengaluru" ? "67" :
                   selectedRegion === "north-bengaluru" ? "71" : "58"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/100</span>
              </div>
              <p className={`text-sm ${selectedRegion === "bengaluru-rural" || selectedRegion === "north-bengaluru" ? "text-green-500" : "text-yellow-500"} mt-1`}>
                {selectedRegion === "bengaluru-rural" ? "Good health, issues in 2 lakes" :
                 selectedRegion === "north-bengaluru" ? "Good health, issues in 3 lakes" :
                 selectedRegion === "east-bengaluru" ? "Poor health, issues in 12 lakes" :
                 "Moderate health, issues in 8 lakes"}
              </p>
            </DashboardCard>

            <DashboardCard
              title="Green Cover"
              description={`Percentage of urban area in ${regionNames[selectedRegion]}`}
              icon={Building}
              iconColor="text-bengaluru-park-medium"
            >
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">
                  {selectedRegion === "bengaluru-urban" ? "18.2" :
                   selectedRegion === "bengaluru-rural" ? "35.6" :
                   selectedRegion === "east-bengaluru" ? "12.4" :
                   selectedRegion === "west-bengaluru" ? "22.5" :
                   selectedRegion === "north-bengaluru" ? "24.2" : "16.8"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">%</span>
              </div>
              <p className={`text-sm ${selectedRegion === "bengaluru-rural" ? "text-green-500" : "text-red-500"} mt-1`}>
                {selectedRegion === "bengaluru-rural" ? "Above target of 25%" : "Below target of 25%"}
              </p>
            </DashboardCard>

            <DashboardCard
              title="Air Quality Index"
              description={`Average across monitoring stations in ${regionNames[selectedRegion]}`}
              icon={Filter}
              iconColor="text-bengaluru-metro-medium"
            >
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">
                  {selectedRegion === "bengaluru-urban" ? "124" :
                   selectedRegion === "bengaluru-rural" ? "92" :
                   selectedRegion === "east-bengaluru" ? "136" :
                   selectedRegion === "west-bengaluru" ? "118" :
                   selectedRegion === "north-bengaluru" ? "108" : "130"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">AQI</span>
              </div>
              <p className={`text-sm ${
                selectedRegion === "bengaluru-rural" ? "text-yellow-500" :
                selectedRegion === "east-bengaluru" || selectedRegion === "south-bengaluru" ? "text-red-500" :
                "text-orange-500"} mt-1`}>
                {selectedRegion === "bengaluru-rural" ? "Moderate" :
                 selectedRegion === "east-bengaluru" || selectedRegion === "south-bengaluru" ? "Unhealthy" :
                 "Unhealthy for sensitive groups"}
              </p>
            </DashboardCard>
          </div>

          <Tabs defaultValue="alerts" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="flood">Flood Prediction</TabsTrigger>
              <TabsTrigger value="weather">Weather Forecast</TabsTrigger>
              <TabsTrigger value="lakes">Lake Monitoring</TabsTrigger>
              <TabsTrigger value="urban">Urban Planning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts">
              <DashboardCard
                title="Recent Alerts & Notifications"
                description={`Critical updates from across ${regionNames[selectedRegion]}`}
                icon={AlertTriangle}
                iconColor="text-amber-500"
              >
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {alert.type}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {alert.area}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {alert.description}
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.time}
                        </span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0"
                          onClick={() => handleViewDetails(alert.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="flood">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                  title="Flood Prediction Map"
                  description={`Flood risk areas in ${regionNames[selectedRegion]}`}
                  icon={MapPin}
                  iconColor="text-bengaluru-rain-dark"
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                    <div className="relative w-full h-full">
                      <MapBoxComponent
                        center={regionCoordinates[selectedRegion]}
                        zoom={12}
                        markers={floodPredictionMapData.map((loc: any) => ({
                          position: loc.coordinates,
                          popup: `
                            <div class="p-2">
                              <h3 class="font-bold">${loc.name}</h3>
                              <p class="text-sm">Flood Risk: ${loc.details.floodRisk}</p>
                              <p class="text-sm">Green Coverage: ${loc.details.greenCoverage}%</p>
                            </div>
                          `,
                          color: loc.details.floodRisk === 'High' ? '#ef4444' : 
                                 loc.details.floodRisk === 'Moderate' ? '#f59e0b' : 
                                 loc.details.floodRisk === 'Critical' ? '#b91c1c' : '#10b981'
                        }))}
                        showHeatmap={showFloodHeatmap}
                        heatmapData={generateHeatmapData(floodPredictionMapData)}
                        className="h-full w-full"
                        showBuildings={true}
                        showWaterBodies={true}
                      />
                      <div className="absolute bottom-2 right-2">
                        <Button
                          variant={showFloodHeatmap ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowFloodHeatmap(!showFloodHeatmap)}
                        >
                          {showFloodHeatmap ? "Hide Risk Heatmap" : "Show Risk Heatmap"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Rainfall Forecast"
                  description={`Predicted rainfall for next 5 days in ${regionNames[selectedRegion]}`}
                  icon={Calendar}
                  iconColor="text-bengaluru-rain-medium"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Today</span>
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-4 w-4 text-bengaluru-rain-medium" />
                        <span>
                          {selectedRegion === "bengaluru-urban" ? "25-35 mm" :
                           selectedRegion === "bengaluru-rural" ? "20-30 mm" :
                           selectedRegion === "east-bengaluru" ? "30-40 mm" :
                           selectedRegion === "west-bengaluru" ? "25-35 mm" :
                           selectedRegion === "north-bengaluru" ? "20-30 mm" : "30-40 mm"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tomorrow</span>
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-4 w-4 text-bengaluru-rain-medium" />
                        <span>
                          {selectedRegion === "bengaluru-urban" ? "30-40 mm" :
                           selectedRegion === "bengaluru-rural" ? "25-35 mm" :
                           selectedRegion === "east-bengaluru" ? "35-45 mm" :
                           selectedRegion === "west-bengaluru" ? "30-40 mm" :
                           selectedRegion === "north-bengaluru" ? "25-35 mm" : "35-45 mm"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Day 3</span>
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-4 w-4 text-bengaluru-rain-medium" />
                        <span>
                          {selectedRegion === "bengaluru-urban" ? "15-25 mm" :
                           selectedRegion === "bengaluru-rural" ? "10-20 mm" :
                           selectedRegion === "east-bengaluru" ? "20-30 mm" :
                           selectedRegion === "west-bengaluru" ? "15-25 mm" :
                           selectedRegion === "north-bengaluru" ? "10-20 mm" : "20-30 mm"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Day 4</span>
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-4 w-4 text-bengaluru-rain-medium" />
                        <span>
                          {selectedRegion === "bengaluru-urban" ? "10-20 mm" :
                           selectedRegion === "bengaluru-rural" ? "5-15 mm" :
                           selectedRegion === "east-bengaluru" ? "15-25 mm" :
                           selectedRegion === "west-bengaluru" ? "10-20 mm" :
                           selectedRegion === "north-bengaluru" ? "5-15 mm" : "15-25 mm"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Day 5</span>
                      <div className="flex items-center space-x-2">
                        <CloudRain className="h-4 w-4 text-bengaluru-rain-medium" />
                        <span>
                          {selectedRegion === "bengaluru-urban" ? "5-15 mm" :
                           selectedRegion === "bengaluru-rural" ? "3-10 mm" :
                           selectedRegion === "east-bengaluru" ? "10-20 mm" :
                           selectedRegion === "west-bengaluru" ? "5-15 mm" :
                           selectedRegion === "north-bengaluru" ? "3-10 mm" : "10-20 mm"}
                        </span>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </TabsContent>
            
            <TabsContent value="weather">
              <WeatherForecastCard 
                forecastData={weatherData}
                location={regionNames[selectedRegion]}
                coordinates={regionCoordinates[selectedRegion]}
              />
            </TabsContent>
            
            <TabsContent value="lakes">
              <DashboardCard
                title="Lake Health Overview"
                description={`Status of major lakes in ${regionNames[selectedRegion]}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedRegion === "bengaluru-urban" || selectedRegion === "south-bengaluru" ? (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Bellandur Lake</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Water Quality:</span>
                        <span className="text-red-500 font-medium">Poor</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Encroachment:</span>
                        <span className="text-amber-500 font-medium">32%</span>
                      </div>
                    </div>
                  ) : null}
                  
                  {selectedRegion === "bengaluru-urban" || selectedRegion === "east-bengaluru" ? (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Varthur Lake</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Water Quality:</span>
                        <span className="text-red-500 font-medium">Poor</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Encroachment:</span>
                        <span className="text-amber-500 font-medium">25%</span>
                      </div>
                    </div>
                  ) : null}
                  
                  {selectedRegion === "bengaluru-urban" || selectedRegion === "north-bengaluru" ? (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Hebbal Lake</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Water Quality:</span>
                        <span className="text-amber-500 font-medium">Moderate</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Encroachment:</span>
                        <span className="text-green-500 font-medium">8%</span>
                      </div>
                    </div>
                  ) : null}
                  
                  {selectedRegion === "bengaluru-rural" ? (
                    <>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Hesaraghatta Lake</h3>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Water Quality:</span>
                          <span className="text-green-500 font-medium">Good</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Encroachment:</span>
                          <span className="text-green-500 font-medium">5%</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Manchanabele Dam</h3>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Water Quality:</span>
                          <span className="text-green-500 font-medium">Good</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Encroachment:</span>
                          <span className="text-green-500 font-medium">2%</span>
                        </div>
                      </div>
                    </>
                  ) : null}
                  
                  {selectedRegion === "west-bengaluru" ? (
                    <>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Sankey Tank</h3>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Water Quality:</span>
                          <span className="text-amber-500 font-medium">Moderate</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Encroachment:</span>
                          <span className="text-amber-500 font-medium">12%</span>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Lalbagh Lake</h3>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Water Quality:</span>
                          <span className="text-amber-500 font-medium">Moderate</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Encroachment:</span>
                          <span className="text-green-500 font-medium">7%</span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="urban">
              <DashboardCard
                title="Urban Development Metrics"
                description={`Key urban planning and development indicators for ${regionNames[selectedRegion]}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Infrastructure</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Roads:</span>
                      <span>
                        {selectedRegion === "bengaluru-urban" ? "73/100" :
                         selectedRegion === "bengaluru-rural" ? "62/100" :
                         selectedRegion === "east-bengaluru" ? "71/100" :
                         selectedRegion === "west-bengaluru" ? "75/100" :
                         selectedRegion === "north-bengaluru" ? "70/100" : "68/100"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Public Transport:</span>
                      <span>
                        {selectedRegion === "bengaluru-urban" ? "68/100" :
                         selectedRegion === "bengaluru-rural" ? "42/100" :
                         selectedRegion === "east-bengaluru" ? "65/100" :
                         selectedRegion === "west-bengaluru" ? "70/100" :
                         selectedRegion === "north-bengaluru" ? "64/100" : "62/100"}
                      </span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Green Spaces</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Parks:</span>
                      <span>
                        {selectedRegion === "bengaluru-urban" ? "18.2%" :
                         selectedRegion === "bengaluru-rural" ? "35.6%" :
                         selectedRegion === "east-bengaluru" ? "12.4%" :
                         selectedRegion === "west-bengaluru" ? "22.5%" :
                         selectedRegion === "north-bengaluru" ? "24.2%" : "16.8%"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tree Coverage:</span>
                      <span>
                        {selectedRegion === "bengaluru-urban" ? "14.8%" :
                         selectedRegion === "bengaluru-rural" ? "32.1%" :
                         selectedRegion === "east-bengaluru" ? "10.2%" :
                         selectedRegion === "west-bengaluru" ? "18.7%" :
                         selectedRegion === "north-bengaluru" ? "20.1%" : "13.5%"}
                      </span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Water Management</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Drainage:</span>
                      <span className={selectedRegion === "bengaluru-rural" || selectedRegion === "north-bengaluru" ? "text-green-500" : "text-amber-500"}>
                        {selectedRegion === "bengaluru-urban" ? "Moderate" :
                         selectedRegion === "bengaluru-rural" ? "Good" :
                         selectedRegion === "east-bengaluru" ? "Poor" :
                         selectedRegion === "west-bengaluru" ? "Moderate" :
                         selectedRegion === "north-bengaluru" ? "Good" : "Poor"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Water Supply:</span>
                      <span className={selectedRegion === "bengaluru-rural" ? "text-amber-500" : "text-red-500"}>
                        {selectedRegion === "bengaluru-rural" ? "Adequate" : "Strained"}
                      </span>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

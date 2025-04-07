import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, MapPin, TrendingUp, AlertTriangle, Info, Droplet } from "lucide-react";
import UrbanPlanningMap from "@/components/maps/UrbanPlanningMap";
import { UrbanSprawlAnalysis } from "@/components/lake";
import { AdvancedSatelliteViewer } from "@/components/maps/satellite";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  details: {
    floodRisk: string;
    floodRiskValue: number;
    greenCoverage: number;
    infrastructureScore: number;
    landUseTypes: Array<{
      type: string;
      percentage: number;
    }>;
    issues: string[];
  };
}

const mockLocations: Location[] = [
  {
    id: "location1",
    name: "Central Business District",
    coordinates: [12.9716, 77.5946],
    details: {
      floodRisk: "Low",
      floodRiskValue: 25,
      greenCoverage: 15,
      infrastructureScore: 85,
      landUseTypes: [
        { type: "Commercial", percentage: 60 },
        { type: "Residential", percentage: 30 },
        { type: "Parks", percentage: 10 },
      ],
      issues: ["Traffic congestion", "Air pollution"],
    },
  },
  {
    id: "location2",
    name: "Residential Suburb",
    coordinates: [13.0287, 77.5854],
    details: {
      floodRisk: "Moderate",
      floodRiskValue: 55,
      greenCoverage: 40,
      infrastructureScore: 60,
      landUseTypes: [
        { type: "Residential", percentage: 70 },
        { type: "Parks", percentage: 20 },
        { type: "Commercial", percentage: 10 },
      ],
      issues: ["Water scarcity", "Inadequate public transport"],
    },
  },
  {
    id: "location3",
    name: "Industrial Area",
    coordinates: [12.9539, 77.7104],
    details: {
      floodRisk: "High",
      floodRiskValue: 75,
      greenCoverage: 5,
      infrastructureScore: 50,
      landUseTypes: [
        { type: "Industrial", percentage: 80 },
        { type: "Commercial", percentage: 15 },
        { type: "Residential", percentage: 5 },
      ],
      issues: ["Water pollution", "Soil contamination"],
    },
  },
];

const UrbanPlanning = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  const [nearbyLakes, setNearbyLakes] = useState<{
    id: string;
    name: string;
    coordinates: [number, number];
    affectedBy: string[];
  }[]>([]);
  
  const [selectedLake, setSelectedLake] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setLocations(mockLocations);
    }, 500);
  }, []);

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
  };
  
  useEffect(() => {
    if (selectedLocation) {
      setTimeout(() => {
        const location = locations.find(loc => loc.id === selectedLocation);
        if (location) {
          const [lat, lng] = location.coordinates;
          
          setNearbyLakes([
            {
              id: "bellandur",
              name: "Bellandur Lake",
              coordinates: [12.9373, 77.6402],
              affectedBy: ["runoff", "sewage", "encroachment"]
            },
            {
              id: "varthur",
              name: "Varthur Lake",
              coordinates: [12.9417, 77.7341],
              affectedBy: ["runoff", "industrial waste"]
            },
            {
              id: "hebbal",
              name: "Hebbal Lake",
              coordinates: [13.0450, 77.5950],
              affectedBy: ["encroachment"]
            }
          ]);
        }
      }, 1000);
    } else {
      setNearbyLakes([]);
    }
  }, [selectedLocation]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Urban Planning & Development</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Plan sustainable urban development while preserving water bodies
            </p>
          </div>

          <Tabs defaultValue="map" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="map">City Map</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="environment">Environmental Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <UrbanPlanningMap
                locations={locations}
                selectedLocation={selectedLocation || ""}
                onLocationSelect={handleLocationSelect}
              />
              
              {selectedLocation && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                      Location Details
                    </h3>
                    <p>Name: {locations.find((loc) => loc.id === selectedLocation)?.name}</p>
                    <p>Flood Risk: {locations.find((loc) => loc.id === selectedLocation)?.details.floodRisk}</p>
                    <p>Green Coverage: {locations.find((loc) => loc.id === selectedLocation)?.details.greenCoverage}%</p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                      Development Projections
                    </h3>
                    <p>Projected Population Growth: 15% in the next 5 years</p>
                    <p>Infrastructure Investment: $20 million</p>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="col-span-1 md:col-span-2">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                      Urban Growth Pattern
                    </h3>
                    {selectedLocation ? (
                      <div className="h-[400px] relative">
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 dark:text-gray-400">Urban growth visualization for selected location</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">Select a location to view urban growth patterns</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                    Risk Factors
                  </h3>
                  {selectedLocation ? (
                    <div>
                      <ul>
                        {locations.find((loc) => loc.id === selectedLocation)?.details.issues.map((issue, index) => (
                          <li key={index} className="mb-2">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">Select a location to view risk factors</p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="environment">
              <div className="mb-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
                      Nearby Water Bodies
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-80">
                          <p className="text-sm">
                            Water bodies near urban development areas that may be affected by the development.
                            Select a water body to view detailed analysis.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {selectedLocation ? (
                    <div>
                      {nearbyLakes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {nearbyLakes.map(lake => (
                            <div 
                              key={lake.id}
                              className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                                selectedLake === lake.id 
                                  ? 'border-karnataka-lake-medium bg-karnataka-lake-light/20' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-karnataka-lake-light'
                              }`}
                              onClick={() => setSelectedLake(lake.id)}
                            >
                              <div className="flex items-center mb-2">
                                <Droplet className="h-4 w-4 mr-2 text-karnataka-lake-medium" />
                                <h4 className="font-medium">{lake.name}</h4>
                              </div>
                              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <p>Coordinates: {lake.coordinates[0].toFixed(4)}, {lake.coordinates[1].toFixed(4)}</p>
                                <p>Affected by: {lake.affectedBy.join(', ')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">No water bodies found near this location</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">Select a location to view nearby water bodies</p>
                    </div>
                  )}
                </Card>
              </div>
              
              {selectedLake && (
                <div className="space-y-6">
                  <UrbanSprawlAnalysis 
                    lakeId={selectedLake}
                    lakeName={nearbyLakes.find(lake => lake.id === selectedLake)?.name || ""}
                    coordinates={nearbyLakes.find(lake => lake.id === selectedLake)?.coordinates || [12.9716, 77.5946]}
                  />
                  
                  <AdvancedSatelliteViewer
                    lakeName={nearbyLakes.find(lake => lake.id === selectedLake)?.name || ""}
                    coordinates={nearbyLakes.find(lake => lake.id === selectedLake)?.coordinates || [12.9716, 77.5946]}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UrbanPlanning;

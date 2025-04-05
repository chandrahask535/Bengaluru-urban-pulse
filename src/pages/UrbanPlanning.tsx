
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Building, Map, AlertTriangle, CloudRain, Layers, Home } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const UrbanPlanning = () => {
  const [selectedZone, setSelectedZone] = useState("bengaluru-central");
  
  const zones = [
    { id: "bengaluru-central", name: "Bengaluru Central" },
    { id: "bengaluru-east", name: "Bengaluru East" },
    { id: "bengaluru-west", name: "Bengaluru West" },
    { id: "bengaluru-south", name: "Bengaluru South" },
    { id: "bengaluru-north", name: "Bengaluru North" },
  ];

  const zoneDetails = {
    "bengaluru-central": {
      floodRisk: "Moderate",
      floodRiskValue: 45,
      greenCoverage: 12,
      infrastructureScore: 78,
      landUseTypes: [
        { type: "Residential", percentage: 55 },
        { type: "Commercial", percentage: 30 },
        { type: "Industrial", percentage: 5 },
        { type: "Green Space", percentage: 8 },
        { type: "Others", percentage: 2 },
      ],
      issues: [
        "Heavy traffic congestion",
        "Limited green spaces",
        "Aging drainage systems",
      ],
    },
    "bengaluru-east": {
      floodRisk: "High",
      floodRiskValue: 75,
      greenCoverage: 18,
      infrastructureScore: 65,
      landUseTypes: [
        { type: "Residential", percentage: 60 },
        { type: "Commercial", percentage: 20 },
        { type: "Industrial", percentage: 8 },
        { type: "Green Space", percentage: 10 },
        { type: "Others", percentage: 2 },
      ],
      issues: [
        "Frequent flooding in low-lying areas",
        "Rapid development without proper planning",
        "Water scarcity during summer",
      ],
    },
    "bengaluru-west": {
      floodRisk: "Low",
      floodRiskValue: 25,
      greenCoverage: 20,
      infrastructureScore: 70,
      landUseTypes: [
        { type: "Residential", percentage: 50 },
        { type: "Commercial", percentage: 15 },
        { type: "Industrial", percentage: 20 },
        { type: "Green Space", percentage: 12 },
        { type: "Others", percentage: 3 },
      ],
      issues: [
        "Industrial pollution",
        "Inadequate public transportation",
        "Unplanned development in certain pockets",
      ],
    },
    "bengaluru-south": {
      floodRisk: "Moderate",
      floodRiskValue: 55,
      greenCoverage: 15,
      infrastructureScore: 82,
      landUseTypes: [
        { type: "Residential", percentage: 65 },
        { type: "Commercial", percentage: 25 },
        { type: "Industrial", percentage: 2 },
        { type: "Green Space", percentage: 6 },
        { type: "Others", percentage: 2 },
      ],
      issues: [
        "Traffic congestion during peak hours",
        "Encroachment of lake beds",
        "Inadequate waste management",
      ],
    },
    "bengaluru-north": {
      floodRisk: "Low",
      floodRiskValue: 30,
      greenCoverage: 25,
      infrastructureScore: 68,
      landUseTypes: [
        { type: "Residential", percentage: 55 },
        { type: "Commercial", percentage: 15 },
        { type: "Industrial", percentage: 5 },
        { type: "Green Space", percentage: 22 },
        { type: "Others", percentage: 3 },
      ],
      issues: [
        "Rapid urbanization affecting green cover",
        "Water supply issues in certain areas",
        "Need for better connectivity to the city center",
      ],
    },
  };

  const selectedZoneData = zoneDetails[selectedZone as keyof typeof zoneDetails];

  const getFloodRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getProgressBarColor = (value: number, metric: string) => {
    if (metric === "floodRisk") {
      if (value > 60) return "bg-red-500";
      if (value > 30) return "bg-yellow-500";
      return "bg-green-500";
    } else if (metric === "greenCoverage") {
      if (value < 10) return "bg-red-500";
      if (value < 20) return "bg-yellow-500";
      return "bg-green-500";
    } else if (metric === "infrastructureScore") {
      if (value < 60) return "bg-red-500";
      if (value < 75) return "bg-yellow-500";
      return "bg-green-500";
    }
    return "bg-blue-500";
  };

  const getLandUseColor = (type: string) => {
    switch (type) {
      case "Residential":
        return "bg-karnataka-metro-light";
      case "Commercial":
        return "bg-karnataka-lake-light";
      case "Industrial":
        return "bg-karnataka-rain-light";
      case "Green Space":
        return "bg-karnataka-park-light";
      default:
        return "bg-gray-200 dark:bg-gray-700";
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
                Urban Planning Insights
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Analyze zoning maps and identify safe zones for sustainable development
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="zoning" className="mb-8">
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="zoning">Zoning Analysis</TabsTrigger>
              <TabsTrigger value="flood">Flood Risk</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
            </TabsList>
            
            <TabsContent value="zoning" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard
                  title="Land Use Distribution"
                  description="Current zoning allocation"
                  icon={Map}
                  iconColor="text-karnataka-park-medium"
                >
                  <div className="space-y-3 mt-2">
                    {selectedZoneData.landUseTypes.map((item) => (
                      <div key={item.type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.type}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getLandUseColor(item.type)}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Green Coverage"
                  description="Parks, lakes, and open spaces"
                  icon={Layers}
                  iconColor="text-karnataka-park-dark"
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">{selectedZoneData.greenCoverage}%</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        of total area
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressBarColor(selectedZoneData.greenCoverage, "greenCoverage")}`}
                        style={{ width: `${selectedZoneData.greenCoverage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedZoneData.greenCoverage < 15 ? (
                        <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Below recommended minimum (15%)</span>
                        </div>
                      ) : (
                        <span>Target: Maintain or increase current level</span>
                      )}
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Flood Risk Assessment"
                  description="Based on topography and drainage"
                  icon={CloudRain}
                  iconColor="text-karnataka-rain-medium"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">{selectedZoneData.floodRiskValue}%</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getFloodRiskColor(selectedZoneData.floodRisk)}`}>
                        {selectedZoneData.floodRisk} Risk
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressBarColor(selectedZoneData.floodRiskValue, "floodRisk")}`}
                        style={{ width: `${selectedZoneData.floodRiskValue}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedZoneData.floodRisk === "High" && (
                        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Special drainage measures required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard
                title="Urban Planning Challenges"
                description="Key issues identified in this zone"
                icon={Building}
                iconColor="text-karnataka-metro-medium"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Key Issues
                    </h3>
                    <ul className="space-y-2">
                      {selectedZoneData.issues.map((issue, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-karnataka-metro-medium"></div>
                          <span className="text-gray-600 dark:text-gray-400">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Zone Map
                    </h3>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video">
                      <img
                        src="https://via.placeholder.com/600x400?text=Zone+Map"
                        alt="Zone Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="flood">
              <DashboardCard
                title="Detailed Flood Risk Analysis"
                description="Flood risk assessment and predictive modeling"
              >
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    This feature will be available in the next release.
                  </p>
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="infrastructure">
              <DashboardCard
                title="Infrastructure Assessment"
                description="Analysis of current infrastructure"
              >
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    This feature will be available in the next release.
                  </p>
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="development">
              <DashboardCard
                title="Development Recommendations"
                description="Sustainable development guidelines"
              >
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    This feature will be available in the next release.
                  </p>
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

export default UrbanPlanning;

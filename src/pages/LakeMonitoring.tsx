import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Droplet, Calendar, AlertTriangle, MapPin, TrendingUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapComponent from "@/components/maps/MapComponent";
import SatelliteComparison from "@/components/maps/SatelliteComparison";
import { Card } from "@/components/ui/card";
import { LakeDataService } from "@/services/LakeDataService";
import type { WaterQualityData, EncroachmentData } from "@/services/LakeDataService";

// Default values for when API fails
const DEFAULT_WATER_QUALITY: WaterQualityData = {
  ph: 7,
  do: 4,
  bod: 10,
  turbidity: 5,
  temperature: 25
};

const DEFAULT_ENCROACHMENT: EncroachmentData = {
  percentage: 0,
  hotspots: 0,
  area_lost: 0
};
import type { WaterQualityData, EncroachmentData } from "@/services/LakeDataService";

// Default values for when API fails
const DEFAULT_WATER_QUALITY: WaterQualityData = {
  ph: 7,
  do: 4,
  bod: 10,
  turbidity: 5,
  temperature: 25
};

const DEFAULT_ENCROACHMENT: EncroachmentData = {
  percentage: 0,
  hotspots: 0,
  area_lost: 0
};

interface LakeData {
  waterLevel: number;
  encroachment: number;
  waterQuality: "Good" | "Moderate" | "Poor";
  waterQualityScore: number;
  lastUpdated: string;
  encroachmentAlert: boolean;
  waterLevelAlert: boolean;
  qualityAlert: boolean;
  isHealthy: boolean;
}

const LakeMonitoring = () => {
  const [selectedLake, setSelectedLake] = useState("bellandur");
  const [lakeData, setLakeData] = useState<LakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLakeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [waterQualityRes, encroachmentRes, rainfall] = await Promise.all([
          LakeDataService.getWaterQuality(selectedLake),
          LakeDataService.getEncroachmentData(selectedLake),
          LakeDataService.getCurrentRainfall(
            lakes.find(lake => lake.id === selectedLake)?.coordinates[0] || 0,
            lakes.find(lake => lake.id === selectedLake)?.coordinates[1] || 0
          )
        ]);

        const waterQuality = waterQualityRes.data || DEFAULT_WATER_QUALITY;
        const encroachment = encroachmentRes.data || DEFAULT_ENCROACHMENT;

        setLakeData({
          waterLevel: Math.min(100, Math.max(0, Math.round((waterQuality.do / 8) * 100))), // Normalize DO to water level with bounds
          encroachment: Math.min(100, Math.max(0, encroachment.percentage)), // Ensure percentage is within bounds
          waterQuality: waterQuality.bod > 20 ? "Poor" : waterQuality.bod > 10 ? "Moderate" : "Good",
          waterQualityScore: Math.min(100, Math.max(0, Math.round(((8 - waterQuality.bod) / 8) * 100))), // Ensure score is within bounds
          lastUpdated: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          encroachmentAlert: encroachment.percentage > 20,
          waterLevelAlert: waterQuality.do < 4,
          qualityAlert: waterQuality.bod > 20,
          isHealthy: waterQuality.do >= 4 && waterQuality.bod <= 10 && encroachment.percentage <= 20
        });
      } catch (error) {
        console.error("Error fetching lake data:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch lake data');
        // Fallback to sample data if API fails
        setLakeData(lakeHealthData[selectedLake as keyof typeof lakeHealthData]);
      } finally {
        setLoading(false);
      }
    };

    fetchLakeData();
  }, [selectedLake]);

  const lakes = [
    { id: "bellandur", name: "Bellandur Lake", coordinates: [12.9373, 77.6402] },
    { id: "varthur", name: "Varthur Lake", coordinates: [12.9417, 77.7341] },
    { id: "hebbal", name: "Hebbal Lake", coordinates: [13.0450, 77.5950] },
    { id: "ulsoor", name: "Ulsoor Lake", coordinates: [12.9825, 77.6203] },
    { id: "sankey", name: "Sankey Tank", coordinates: [13.0070, 77.5730] },
    { id: "agara", name: "Agara Lake", coordinates: [12.9236, 77.6336] },
  ];

  // Sample lake health data
  const lakeHealthData = {
    bellandur: {
      waterLevel: 65,
      encroachment: 32,
      waterQuality: "Poor",
      waterQualityScore: 35,
      lastUpdated: "June 15, 2023",
      encroachmentAlert: true,
      waterLevelAlert: true,
      qualityAlert: true,
    },
    varthur: {
      waterLevel: 78,
      encroachment: 25,
      waterQuality: "Poor",
      waterQualityScore: 40,
      lastUpdated: "June 14, 2023",
      encroachmentAlert: true,
      waterLevelAlert: false,
      qualityAlert: true,
    },
    hebbal: {
      waterLevel: 82,
      encroachment: 8,
      waterQuality: "Moderate",
      waterQualityScore: 65,
      lastUpdated: "June 15, 2023",
      encroachmentAlert: false,
      waterLevelAlert: false,
      qualityAlert: false,
    },
    ulsoor: {
      waterLevel: 90,
      encroachment: 5,
      waterQuality: "Good",
      waterQualityScore: 75,
      lastUpdated: "June 15, 2023",
      encroachmentAlert: false,
      waterLevelAlert: false,
      qualityAlert: false,
    },
    sankey: {
      waterLevel: 95,
      encroachment: 2,
      waterQuality: "Good",
      waterQualityScore: 85,
      lastUpdated: "June 15, 2023",
      encroachmentAlert: false,
      waterLevelAlert: false,
      qualityAlert: false,
    },
    agara: {
      waterLevel: 72,
      encroachment: 15,
      waterQuality: "Moderate",
      waterQualityScore: 60,
      lastUpdated: "June 14, 2023",
      encroachmentAlert: false,
      waterLevelAlert: false,
      qualityAlert: false,
    },
  };

  const selectedLakeData = loading ? lakeHealthData[selectedLake as keyof typeof lakeHealthData] : (lakeData || lakeHealthData[selectedLake as keyof typeof lakeHealthData]);

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading lake data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getWaterQualityColor = (quality: string) => {
    switch (quality) {
      case "Good":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Poor":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getProgressBarColor = (value: number, isInverted = false) => {
    if (isInverted) {
      if (value > 20) return "bg-red-500";
      if (value > 10) return "bg-yellow-500";
      return "bg-green-500";
    } else {
      if (value < 50) return "bg-red-500";
      if (value < 70) return "bg-yellow-500";
      return "bg-green-500";
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
                Lake Monitoring & Restoration
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track lake health, water levels, and detect encroachments
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={selectedLake} onValueChange={setSelectedLake}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select a lake" />
                </SelectTrigger>
                <SelectContent>
                  {lakes.map((lake) => (
                    <SelectItem key={lake.id} value={lake.id}>
                      {lake.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="satellite">Satellite Data</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                  title="Water Level"
                  description="Current capacity"
                  icon={Droplet}
                  iconColor="text-karnataka-lake-medium"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold">{selectedLakeData.waterLevel}%</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {selectedLakeData.lastUpdated}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressBarColor(selectedLakeData.waterLevel)}`}
                        style={{ width: `${selectedLakeData.waterLevel}%` }}
                      ></div>
                    </div>
                    {selectedLakeData.waterLevelAlert && (
                      <div className="flex items-center space-x-1 text-sm text-yellow-600 dark:text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Level below seasonal average</span>
                      </div>
                    )}
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Encroachment"
                  description="Area impacted"
                  icon={MapPin}
                  iconColor="text-karnataka-metro-medium"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold">{selectedLakeData.encroachment}%</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        of total area
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressBarColor(selectedLakeData.encroachment, true)}`}
                        style={{ width: `${selectedLakeData.encroachment}%` }}
                      ></div>
                    </div>
                    {selectedLakeData.encroachmentAlert && (
                      <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Critical levels of encroachment detected</span>
                      </div>
                    )}
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Water Quality"
                  description="Based on pollution levels"
                  icon={Filter}
                  iconColor="text-karnataka-park-medium"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{selectedLakeData.waterQualityScore}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        out of 100
                      </span>
                      <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${getWaterQualityColor(selectedLakeData.waterQuality)}`}>
                        {selectedLakeData.waterQuality}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressBarColor(selectedLakeData.waterQualityScore)}`}
                        style={{ width: `${selectedLakeData.waterQualityScore}%` }}
                      ></div>
                    </div>
                    {selectedLakeData.qualityAlert && (
                      <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span>High pollution levels detected</span>
                      </div>
                    )}
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard
                title="Lake Overview"
                description="Satellite comparison of current vs. historical data"
                icon={Calendar}
                iconColor="text-karnataka-rain-medium"
              >
                <SatelliteComparison
                  lakeName={lakes.find(lake => lake.id === selectedLake)?.name || ''}
                  coordinates={lakes.find(lake => lake.id === selectedLake)?.coordinates as [number, number] || [12.9716, 77.5946] as [number, number]}
                  historicalYear="2010"
                  currentYear="2025"
                />
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="satellite" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Lake Location</h3>
                  <MapComponent
                    center={lakes.find(lake => lake.id === selectedLake)?.coordinates as [number, number] || [12.9716, 77.5946]}
                    zoom={13}
                    markers={[{
                      position: lakes.find(lake => lake.id === selectedLake)?.coordinates as [number, number],
                      popup: lakes.find(lake => lake.id === selectedLake)?.name
                    }]}
                  />
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Satellite Analysis</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Latest satellite imagery analysis for {lakes.find(lake => lake.id === selectedLake)?.name}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">Surface Area Change</h4>
                        <p className="text-2xl font-bold text-red-600">-12.5%</p>
                        <p className="text-sm text-gray-500">Past 5 years</p>
                      </div>
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium mb-2">Vegetation Index</h4>
                        <p className="text-2xl font-bold text-green-600">0.42</p>
                        <p className="text-sm text-gray-500">NDVI Score</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                  title="2010 Satellite Image"
                  description="Historical satellite view"
                  icon={Calendar}
                  iconColor="text-karnataka-park-medium"
                >
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <MapComponent
                      center={[12.9342, 77.6339]}
                      zoom={13}
                    />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Current Satellite Image"
                  description="Latest satellite view"
                  icon={Calendar}
                  iconColor="text-karnataka-park-medium"
                >
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <MapComponent
                      center={[12.9342, 77.6339]}
                      zoom={13}
                    />
                  </div>
                </DashboardCard>
              </div>
            </TabsContent>
            
            <TabsContent value="trends">
              <DashboardCard
                title="Water Level Trends"
                description="Historical water level data"
              >
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    This feature will be available in the next release.
                  </p>
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="reports">
              <DashboardCard
                title="Reports & Documentation"
                description="Lake health reports and documentation"
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

export default LakeMonitoring;
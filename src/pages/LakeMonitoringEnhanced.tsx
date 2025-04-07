import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Droplet, Calendar, AlertTriangle, MapPin, TrendingUp, Filter, FileText, Building, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapComponent from "@/components/maps/MapComponent";
import SatelliteComparison from "@/components/maps/SatelliteComparison";
import { Card } from "@/components/ui/card";
import { 
  LakeHistoricalData, 
  LakeAnalysisCard, 
  LandCoverStats, 
  LakeReportDetails, 
  LakeWaterQualityCard, 
  LakeWaterLevelCard, 
  LakeEncroachmentCard,
  UrbanSprawlAnalysis,
  AdvancedSatelliteViewer,
  WaterQualityMonitor
} from "@/components/lake";
import LakeRealTimeService from "@/services/LakeRealTimeService";
import { toast } from "sonner";

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

const LakeMonitoringEnhanced = () => {
  const [selectedLake, setSelectedLake] = useState("bellandur");
  const [lakeData, setLakeData] = useState<LakeData | null>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLakeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const selectedLakeInfo = lakes.find(lake => lake.id === selectedLake);
        if (!selectedLakeInfo) {
          throw new Error("Selected lake information not found");
        }

        const realTimeData = await LakeRealTimeService.getLakeRealTimeData(
          selectedLake,
          selectedLakeInfo.coordinates
        );
        
        setRealtimeData(realTimeData);

        const newLakeData: LakeData = {
          waterLevel: Math.min(100, Math.max(0, Math.round(realTimeData.waterLevel.current))),
          encroachment: Math.min(100, Math.max(0, realTimeData.encroachment.percentage)),
          waterQuality: realTimeData.waterQuality.bod > 20 ? "Poor" : 
                        realTimeData.waterQuality.bod > 10 ? "Moderate" : "Good",
          waterQualityScore: Math.min(100, Math.max(0, Math.round(((8 - realTimeData.waterQuality.bod) / 8) * 100))),
          lastUpdated: new Date(realTimeData.waterQuality.lastUpdated).toLocaleDateString("en-US", { 
            month: "long", day: "numeric", year: "numeric" 
          }),
          encroachmentAlert: realTimeData.encroachment.percentage > 20,
          waterLevelAlert: realTimeData.waterQuality.do < 4,
          qualityAlert: realTimeData.waterQuality.bod > 20,
          isHealthy: realTimeData.waterQuality.do >= 4 && 
                    realTimeData.waterQuality.bod <= 10 && 
                    realTimeData.encroachment.percentage <= 20
        };
        
        setLakeData(newLakeData);
      } catch (error) {
        console.error("Error fetching lake data:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch lake data');
        
        const fallbackData = lakeHealthData[selectedLake as keyof typeof lakeHealthData] as LakeData;
        setLakeData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchLakeData();
  }, [selectedLake]);

  const lakes = [
    { id: "bellandur", name: "Bellandur Lake", coordinates: [12.9373, 77.6402] as [number, number] },
    { id: "varthur", name: "Varthur Lake", coordinates: [12.9417, 77.7341] as [number, number] },
    { id: "hebbal", name: "Hebbal Lake", coordinates: [13.0450, 77.5950] as [number, number] },
    { id: "ulsoor", name: "Ulsoor Lake", coordinates: [12.9825, 77.6203] as [number, number] },
    { id: "sankey", name: "Sankey Tank", coordinates: [13.0070, 77.5730] as [number, number] },
    { id: "agara", name: "Agara Lake", coordinates: [12.9236, 77.6336] as [number, number] },
  ];

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
      isHealthy: false
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
      isHealthy: false
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
      isHealthy: true
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
      isHealthy: true
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
      isHealthy: true
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
      isHealthy: true
    },
  };

  const selectedLakeData = loading ? lakeHealthData[selectedLake as keyof typeof lakeHealthData] : (lakeData || lakeHealthData[selectedLake as keyof typeof lakeHealthData]);
  const selectedLakeInfo = lakes.find(lake => lake.id === selectedLake);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-karnataka-lake-medium mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading lake data...</p>
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
              <TabsTrigger value="water-quality">Water Quality</TabsTrigger>
              <TabsTrigger value="urban-impact">Urban Impact</TabsTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                  title="Lake Overview"
                  description="Satellite comparison of current vs. historical data"
                  icon={Calendar}
                  iconColor="text-karnataka-rain-medium"
                >
                  {selectedLakeInfo && (
                    <AdvancedSatelliteViewer
                      lakeName={selectedLakeInfo?.name || ''}
                      coordinates={selectedLakeInfo?.coordinates as [number, number]}
                      years={['2005', '2010', '2015', '2020', '2025']}
                      onAnalysisComplete={(changes) => {
                        console.log("Analysis results:", changes);
                        if (changes.area && changes.area.difference < -100) {
                          toast.warning(`Significant reduction in ${selectedLakeInfo?.name || 'lake'} surface area detected`, {
                            description: "Historical analysis shows encroachment may be affecting water capacity"
                          });
                        }
                      }}
                    />
                  )}
                </DashboardCard>
                
                {selectedLakeInfo && (
                  <LakeAnalysisCard 
                    lakeId={selectedLake}
                    lakeName={selectedLakeInfo.name}
                    coordinates={selectedLakeInfo.coordinates}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="satellite" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-karnataka-metro-medium" />
                    Lake Location
                  </h3>
                  <MapComponent
                    center={selectedLakeInfo?.coordinates as [number, number] || [12.9716, 77.5946]}
                    zoom={13}
                    markers={[{
                      position: selectedLakeInfo?.coordinates as [number, number],
                      popup: selectedLakeInfo?.name
                    }]}
                  />
                </Card>
                
                {selectedLakeInfo && (
                  <LandCoverStats 
                    coordinates={selectedLakeInfo.coordinates}
                    lakeId={selectedLake}
                  />
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
                  Historical Comparison
                </h3>
                
                {selectedLakeInfo && (
                  <SatelliteComparison
                    lakeName={selectedLakeInfo?.name || ''}
                    coordinates={selectedLakeInfo?.coordinates as [number, number] || [12.9716, 77.5946] as [number, number]}
                    historicalYear="2010"
                    currentYear="2025"
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              {selectedLakeInfo && (
                <LakeHistoricalData 
                  lakeId={selectedLake}
                  lakeName={selectedLakeInfo.name}
                />
              )}
              
              {selectedLakeInfo && realtimeData && realtimeData.waterLevel && (
                <LakeWaterLevelCard
                  lakeId={selectedLake}
                  lakeName={selectedLakeInfo.name}
                  waterLevelData={realtimeData.waterLevel}
                />
              )}
            </TabsContent>

            <TabsContent value="water-quality" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedLakeInfo && realtimeData && realtimeData.waterQuality && (
                  <LakeWaterQualityCard
                    lakeId={selectedLake}
                    lakeName={selectedLakeInfo.name}
                    waterQualityData={realtimeData.waterQuality}
                  />
                )}

                {selectedLakeInfo && realtimeData && realtimeData.encroachment && (
                  <LakeEncroachmentCard
                    lakeId={selectedLake}
                    lakeName={selectedLakeInfo.name}
                    encroachmentData={realtimeData.encroachment}
                  />
                )}
              </div>
              
              {selectedLakeInfo && (
                <WaterQualityMonitor
                  lakeId={selectedLake}
                  lakeName={selectedLakeInfo.name}
                />
              )}
            </TabsContent>
            
            <TabsContent value="urban-impact" className="space-y-6">
              {selectedLakeInfo && (
                <UrbanSprawlAnalysis
                  lakeId={selectedLake}
                  lakeName={selectedLakeInfo.name}
                  coordinates={selectedLakeInfo.coordinates}
                />
              )}
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-6">
              {selectedLakeInfo && realtimeData && realtimeData.reports && (
                <LakeReportDetails
                  lakeId={selectedLake}
                  lakeName={selectedLakeInfo.name}
                  reports={realtimeData.reports}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LakeMonitoringEnhanced;

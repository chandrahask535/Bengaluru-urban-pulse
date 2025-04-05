
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Droplet, Calendar, AlertTriangle, MapPin, TrendingUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LakeMonitoring = () => {
  const [selectedLake, setSelectedLake] = useState("bellandur");
  
  const lakes = [
    { id: "bellandur", name: "Bellandur Lake" },
    { id: "varthur", name: "Varthur Lake" },
    { id: "hebbal", name: "Hebbal Lake" },
    { id: "ulsoor", name: "Ulsoor Lake" },
    { id: "sankey", name: "Sankey Tank" },
    { id: "agara", name: "Agara Lake" },
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

  const selectedLakeData = lakeHealthData[selectedLake as keyof typeof lakeHealthData];

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      2010 Satellite Image
                    </h3>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                      <img
                        src="https://via.placeholder.com/600x400?text=2010+Satellite+Image"
                        alt="2010 Satellite View"
                        className="rounded-lg max-h-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Current Satellite Image
                    </h3>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                      <img
                        src="https://via.placeholder.com/600x400?text=Current+Satellite+Image"
                        alt="Current Satellite View"
                        className="rounded-lg max-h-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="font-medium text-yellow-600 dark:text-yellow-400">
                      Changes Detected
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Analysis shows a significant {selectedLakeData.encroachment}% reduction in lake area over the last 10 years, 
                    primarily on the eastern and southern shores.
                  </p>
                </div>
              </DashboardCard>
            </TabsContent>
            
            <TabsContent value="satellite">
              <DashboardCard
                title="Satellite Data Analysis"
                description="Historical satellite data comparison"
              >
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    This feature will be available in the next release.
                  </p>
                </div>
              </DashboardCard>
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

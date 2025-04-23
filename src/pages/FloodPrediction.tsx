import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { CloudRain, Droplet, AlertTriangle, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloodPredictionCard from "@/components/prediction/FloodPredictionCard";
import { useRecentFloodPredictions } from "@/hooks/usePredictionData";
import { LakeDataService } from "@/services/LakeDataService";

const AlertHistory = () => {
  const alerts = [
    {
      month: "September 2024 Alert",
      description: "Heavy rainfall prediction led to accurate flood warnings in Koramangala area.",
      status: "Accurate",
      statusColor: "bg-green-100 text-green-700",
      level: "High",
      date: "12 Sep 2024",
    },
    {
      month: "August 2024 Alert",
      description: "Predicted flooding in Whitefield was less severe than forecasted.",
      status: "Partially Accurate",
      statusColor: "bg-yellow-100 text-yellow-800",
      level: "Medium",
      date: "23 Aug 2024",
    },
    {
      month: "July 2024 Alert",
      description: "Predicted downpour didn't materialize, resulting in unnecessary evacuations.",
      status: "False Alarm",
      statusColor: "bg-red-100 text-red-700",
      level: "High",
      date: "5 Jul 2024",
    },
    {
      month: "June 2024 Alert",
      description: "Timely warning about flooding in HSR Layout prevented major damage.",
      status: "Accurate",
      statusColor: "bg-green-100 text-green-700",
      level: "High",
      date: "1 Jun 2024",
    },
  ];

  return (
    <DashboardCard title="Alert History" className="p-6 h-full overflow-auto">
      <div className="mb-4 text-gray-700 dark:text-gray-300 text-sm">
        Historical record of flood alerts and their accuracy over the past 12 months.
      </div>
      <div className="space-y-4 max-h-[320px] overflow-y-auto">
        {alerts.map((alert, idx) => (
          <div key={idx} className="border rounded p-3 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{alert.month}</h3>
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${alert.statusColor}`}
              >
                {alert.status}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{alert.description}</p>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Alert level: {alert.level}
            </div>
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {alert.date}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

const AlertPerformance = () => {
  return (
    <DashboardCard title="Alert System Performance" className="p-6 h-full">
      <p className="mb-6 text-gray-700 dark:text-gray-300 text-sm">
        Metrics showing the effectiveness of the flood prediction and alert system.
      </p>
      <div className="grid grid-cols-2 gap-6 mb-4 text-center text-karnataka-lake-medium">
        <div>
          <p className="text-2xl font-bold">87%</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Alert Accuracy</p>
        </div>
        <div>
          <p className="text-2xl font-bold">23</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Alerts Issued (12 mo)</p>
        </div>
        <div>
          <p className="text-2xl font-bold">42</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Areas Monitored</p>
        </div>
        <div>
          <p className="text-2xl font-bold">9.2</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">Avg. Warning Hours</p>
        </div>
      </div>
      <div className="bg-blue-100 p-4 rounded text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-300">
        <p>
          <strong>System Improvements</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Integration with BBMP emergency response in March 2024 reduced response time by 46%</li>
          <li>Machine learning model accuracy improved from 72% to 87% with historical data integration</li>
          <li>Alert distribution now reaches 98% of affected residents through SMS, app notifications, and local announcements</li>
        </ul>
      </div>
    </DashboardCard>
  );
};

const FloodPrediction = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [currentRainfall, setCurrentRainfall] = useState<number>(0);
  const [rainfallForecast, setRainfallForecast] = useState<number>(0);
  const [floodRisk, setFloodRisk] = useState<{ risk_level: string; probability: number } | null>(null);
  const { data: recentPredictions, isLoading } = useRecentFloodPredictions(10);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Using Bengaluru coordinates
        const lat = 12.9716;
        const lon = 77.5946;

        // Use LakeDataService to get rainfall and flood risk
        const rainfall = await LakeDataService.getCurrentRainfall(lat, lon);
        const risk = await LakeDataService.getFloodRiskPrediction(lat, lon);
        const forecast = await LakeDataService.getRainfallForecast(lat, lon); // assuming this method exists or create a fallback method

        setCurrentRainfall(rainfall);
        setFloodRisk(risk);
        setRainfallForecast(forecast);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
    // Refresh data every 15 minutes
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "bg-red-500";
      case "High": return "bg-red-500";
      case "Moderate": return "bg-orange-500";
      case "Low": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Moderate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const floodAreas = isLoading || !recentPredictions
    ? [
        { id: 1, area: "Koramangala", risk: 85, status: "High" },
        { id: 2, area: "Bellandur", risk: 78, status: "High" },
        { id: 3, area: "Varthur", risk: 72, status: "Moderate" },
        { id: 4, area: "HSR Layout", risk: 65, status: "Moderate" },
        { id: 5, area: "Indiranagar", risk: 45, status: "Low" },
        { id: 6, area: "Whitefield", risk: 40, status: "Low" },
      ]
    : recentPredictions.map((pred, index) => ({
        id: index + 1,
        area: pred.area_name,
        risk: pred.risk_level === "Critical" ? 90 :
              pred.risk_level === "High" ? 75 :
              pred.risk_level === "Moderate" ? 50 : 25,
        status: pred.risk_level,
      }));

  // Show rain alert only if forecast rainfall is above threshold (e.g., 20mm)
  const showRainAlert = rainfallForecast > 20;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Flood Prediction & Alerts
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Real-time flood risk analysis and predictions for Karnataka
              </p>
            </div>
            {showRainAlert && (
              <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Rain Alert: Heavy rainfall expected in next 24 hours</span>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="current">Current Conditions</TabsTrigger>
              <TabsTrigger value="prediction">Make Prediction</TabsTrigger>
              <TabsTrigger value="history">Historical Data</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <DashboardCard
                  title="Current Rainfall"
                  description="Last updated: 10 minutes ago"
                  icon={CloudRain}
                  iconColor="text-karnataka-rain-medium"
                >
                  <div className="flex items-end space-x-2">
                    <span className="text-3xl font-bold">{currentRainfall.toFixed(1)}</span>
                    <span className="text-gray-500 dark:text-gray-400 mb-1">mm/hr</span>
                  </div>
                  {currentRainfall > 10 && (
                    <p className="text-sm text-red-500 mt-1">
                      Heavy rainfall detected
                    </p>
                  )}
                </DashboardCard>

                <DashboardCard
                  title="Water Level"
                  description="Bellandur Lake"
                  icon={Droplet}
                  iconColor="text-karnataka-lake-medium"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: 12.8m</span>
                      <span className="font-medium">Danger: 14m</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-orange-500">
                      Warning: Rising 0.5m per hour
                    </p>
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Flood Risk Index"
                  description="Bengaluru Urban District"
                  icon={AlertTriangle}
                  iconColor="text-karnataka-metro-medium"
                >
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${floodRisk ? getStatusColor(floodRisk.risk_level) : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                      <span className="text-xl font-bold">{floodRisk?.risk_level || 'LOW'}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Probability: {floodRisk?.probability || 0}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Based on real-time weather data and ML predictions
                    </p>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <DashboardCard
                  title="Flood Risk Areas"
                  description="Areas with high probability of flooding"
                  icon={MapPin}
                  iconColor="text-karnataka-park-medium"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-2">Area</th>
                          <th className="px-4 py-2">Risk Level</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {floodAreas.map((area) => (
                          <tr key={area.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {area.area}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                                  <div
                                    className={`h-2.5 rounded-full ${getRiskColor(area.status)}`}
                                    style={{ width: `${area.risk}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {area.risk}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  area.status
                                )}`}
                              >
                                {area.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DashboardCard>
              </div>
            </TabsContent>
            
            <TabsContent value="prediction" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <FloodPredictionCard />
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <DashboardCard
                title="Historical Flood Data"
                description="Analysis of past flooding events in Karnataka"
              >
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Historical flood data analysis will be displayed here.
                  </p>
                </div>
              </DashboardCard>
            </TabsContent>

            <TabsContent value="alerts" className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertHistory />
              <AlertPerformance />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FloodPrediction;

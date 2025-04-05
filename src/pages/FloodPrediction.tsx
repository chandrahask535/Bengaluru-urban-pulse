
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { CloudRain, Droplet, AlertTriangle, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const FloodPrediction = () => {
  const floodAreas = [
    { id: 1, area: "Koramangala", risk: 85, status: "High Alert" },
    { id: 2, area: "Bellandur", risk: 78, status: "High Alert" },
    { id: 3, area: "Varthur", risk: 72, status: "Warning" },
    { id: 4, area: "HSR Layout", risk: 65, status: "Warning" },
    { id: 5, area: "Indiranagar", risk: 45, status: "Moderate" },
    { id: 6, area: "Whitefield", risk: 40, status: "Moderate" },
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "bg-red-500";
    if (risk >= 50) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "High Alert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Warning":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

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
            <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Rain Alert: Heavy rainfall expected in next 24 hours</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard
              title="Current Rainfall"
              description="Last updated: 10 minutes ago"
              icon={CloudRain}
              iconColor="text-karnataka-rain-medium"
            >
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold">28.4</span>
                <span className="text-gray-500 dark:text-gray-400 mb-1">mm/hr</span>
              </div>
              <p className="text-sm text-red-500 mt-1">
                86% above average for June
              </p>
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
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <span className="text-xl font-bold">HIGH</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Based on current weather conditions and drainage capacity
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
                                className={`h-2.5 rounded-full ${getRiskColor(area.risk)}`}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FloodPrediction;

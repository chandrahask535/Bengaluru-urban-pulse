
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

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
    <Card className="p-6">
      <h2 className="text-lg font-semibold flex items-center mb-4">
        <AlertTriangle className="w-5 h-5 mr-2 text-karnataka-metro-medium" />
        Alert History
      </h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300 text-sm">
        Historical record of flood alerts and their accuracy over the past 12 months.
      </p>
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
    </Card>
  );
};

const AlertPerformance = () => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-karnataka-metro-medium" />
        Alert System Performance
      </h2>
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
    </Card>
  );
};

const Alerts = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flood Alerts & System Performance</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertHistory />
            <AlertPerformance />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Alerts;



import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Cloud, Droplet, FileText } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      name: "Active Users",
      value: "6,000+",
      description: "Citizens engaged across Karnataka",
      icon: Users,
      trend: "+12% from last month",
      iconColor: "text-karnataka-metro-medium",
    },
    {
      name: "Weather Stations",
      value: "120",
      description: "Real-time data collection points",
      icon: Cloud,
      trend: "+5 added this quarter",
      iconColor: "text-karnataka-rain-medium",
    },
    {
      name: "Lakes Monitored",
      value: "210",
      description: "Lakes under active surveillance",
      icon: Droplet,
      trend: "98% coverage achieved",
      iconColor: "text-karnataka-lake-medium",
    },
    {
      name: "Reports Generated",
      value: "1,240",
      description: "Environmental insights shared",
      icon: FileText,
      trend: "+18% from last quarter",
      iconColor: "text-karnataka-park-medium",
    },
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Real-time Karnataka Urban Metrics
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Live data powering informed decisions for urban management
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
                <p className="text-xs text-green-500 mt-2">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

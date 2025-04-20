import { CloudRain, Droplet, Building, BarChart3, Upload, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      name: "Flood Prediction",
      description:
        "ML-based prediction using rainfall and drainage data with real-time alerts.",
      icon: CloudRain,
      color: "bg-karnataka-rain-light text-karnataka-rain-dark",
    },
    {
      name: "Lake Monitoring",
      description:
        "Track lake health, water levels, and detect encroachments using GIS data.",
      icon: Droplet,
      color: "bg-karnataka-lake-light text-karnataka-lake-dark",
    },
    {
      name: "Urban Planning",
      description:
        "Analyze zoning maps and identify safe zones for sustainable development.",
      icon: Building,
      color: "bg-karnataka-park-light text-karnataka-park-dark",
    },
    {
      name: "Data Dashboard",
      description:
        "Comprehensive visualization of environmental metrics for informed decision-making.",
      icon: BarChart3,
      color: "bg-karnataka-metro-light text-karnataka-metro-dark",
    },
    {
      name: "Citizen Reporting",
      description:
        "Upload photos and report issues to help authorities track urban challenges.",
      icon: Upload,
      color: "bg-karnataka-rain-light text-karnataka-rain-dark",
    },
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-karnataka-metro-medium font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            A comprehensive urban management system
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Our platform combines data analytics, GIS mapping, and machine learning to address Karnataka's urban challenges.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="border border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <div className={`p-3 rounded-full inline-flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{feature.name}</CardTitle>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

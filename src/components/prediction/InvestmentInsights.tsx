
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Map, ArrowRight, ChartBar, Calculator } from "lucide-react";
import React, { useState } from "react";
import InvestmentTrends from "./InvestmentTrends";
import ROICalculator from "./ROICalculator";
import DevelopmentZones from "./DevelopmentZones";
import LandPriceCalculator from "./LandPriceCalculator";

interface TrendData {
  area: string;
  growth: string;
  description: string;
  type: "positive" | "neutral" | "negative";
}

const investmentTrends: TrendData[] = [
  {
    area: "Whitefield Growth Corridor",
    growth: "28% value increase projected",
    description: "Metro expansion is driving rapid property appreciation in this eastern corridor, with commercial development accelerating.",
    type: "positive"
  },
  {
    area: "Peripheral Ring Road Impact",
    growth: "35% growth potential",
    description: "Significant appreciation expected in northern areas intersecting with the upcoming Peripheral Ring Road development.",
    type: "positive"
  },
  {
    area: "Water Infrastructure Zones",
    growth: "15% increase in livability index",
    description: "Areas benefiting from the Cauvery Water Project will see significant improvement in livability scores and residential demand.",
    type: "positive"
  },
  {
    area: "Long-term Investment Outlook",
    growth: "Steady 12-18% annual growth",
    description: "5-year projection shows consistent growth across the eastern and northern development corridors.",
    type: "positive"
  }
];

type ViewType = 'main' | 'trends' | 'roi' | 'zones' | 'price';

const InvestmentInsights = () => {
  const [activeView, setActiveView] = useState<ViewType>('main');

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  const getGrowthColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600 dark:text-green-400";
      case "neutral":
        return "text-yellow-600 dark:text-yellow-400";
      case "negative":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (activeView === 'trends') {
    return <InvestmentTrends onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'roi') {
    return <ROICalculator onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'zones') {
    return <DevelopmentZones onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'price') {
    return <LandPriceCalculator onBack={() => setActiveView('main')} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center">
          <Target className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          Premium Investment Insights
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-karnataka-metro-medium" />
              <h3 className="font-semibold">Investment Trends</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyze market trends and growth potential
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Get detailed analysis of property value trends and investment opportunities in developing areas.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full flex items-center justify-center space-x-2"
            onClick={() => handleViewChange('trends')}
          >
            <span>View Trends</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-karnataka-lake-medium" />
              <h3 className="font-semibold">ROI Predictions</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate potential returns based on development projects
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Calculate potential returns based on development projects and market analysis.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full flex items-center justify-center space-x-2"
            onClick={() => handleViewChange('roi')}
          >
            <span>Calculate ROI</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Map className="w-5 h-5 text-karnataka-park-medium" />
              <h3 className="font-semibold">Development Zones</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify prime locations for development
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Identify prime locations for development based on infrastructure projects.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full flex items-center justify-center space-x-2"
            onClick={() => handleViewChange('zones')}
          >
            <span>Explore Zones</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ChartBar className="w-5 h-5 text-karnataka-rain-medium" />
              <h3 className="font-semibold">Land Price Prediction</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Predict land prices based on location
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Calculate estimated land values based on location, amenities, and market trends.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full flex items-center justify-center space-x-2"
            onClick={() => handleViewChange('price')}
          >
            <span>Predict Price</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Trend Analysis</h3>
        <div className="space-y-6">
          {investmentTrends.map((trend, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{trend.area}</h4>
                <span className={`font-semibold ${getGrowthColor(trend.type)}`}>
                  {trend.growth}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {trend.description}
              </p>
              {index < investmentTrends.length - 1 && (
                <hr className="border-gray-200 dark:border-gray-700 mt-4" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InvestmentInsights;

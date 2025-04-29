
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, ChartLine, Landmark, MapPin } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";

interface InvestmentTrendsProps {
  onBack: () => void;
}

interface TrendData {
  area: string;
  growth: string;
  growthValue: number;
  description: string;
  type: "positive" | "neutral" | "negative";
}

const investmentTrends: TrendData[] = [
  {
    area: "Whitefield Growth Corridor",
    growth: "28% value increase projected",
    growthValue: 28,
    description: "Metro expansion is driving rapid property appreciation in this eastern corridor, with commercial development accelerating.",
    type: "positive"
  },
  {
    area: "Peripheral Ring Road Impact",
    growth: "35% growth potential",
    growthValue: 35,
    description: "Significant appreciation expected in northern areas intersecting with the upcoming Peripheral Ring Road development.",
    type: "positive"
  },
  {
    area: "Water Infrastructure Zones",
    growth: "15% increase in livability index",
    growthValue: 15,
    description: "Areas benefiting from the Cauvery Water Project will see significant improvement in livability scores and residential demand.",
    type: "positive"
  },
  {
    area: "Long-term Investment Outlook",
    growth: "Steady 12-18% annual growth",
    growthValue: 15,
    description: "5-year projection shows consistent growth across the eastern and northern development corridors.",
    type: "positive"
  }
];

const yearlyGrowthData = [
  { year: '2020', residential: 8, commercial: 5, industrial: 3 },
  { year: '2021', residential: 12, commercial: 10, industrial: 7 },
  { year: '2022', residential: 18, commercial: 16, industrial: 12 },
  { year: '2023', residential: 15, commercial: 22, industrial: 14 },
  { year: '2024', residential: 22, commercial: 25, industrial: 18 },
  { year: '2025', residential: 25, commercial: 28, industrial: 20 },
];

const areaComparisonData = [
  { name: 'Whitefield', value: 28 },
  { name: 'N. Bangalore', value: 35 },
  { name: 'HSR Layout', value: 24 },
  { name: 'Koramangala', value: 22 },
  { name: 'Electronic City', value: 18 },
  { name: 'Indiranagar', value: 20 },
  { name: 'Bellandur', value: 27 },
];

const InvestmentTrends = ({ onBack }: InvestmentTrendsProps) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          Investment Trends Analysis
        </h3>
        <Button variant="outline" onClick={onBack}>
          Back to Investment Insights
        </Button>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-6 flex items-center">
          <ChartLine className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          Property Value Growth Trends (2020-2025)
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="residential" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Residential"
              />
              <Line 
                type="monotone" 
                dataKey="commercial" 
                stroke="#82ca9d" 
                strokeWidth={2} 
                name="Commercial"
              />
              <Line 
                type="monotone" 
                dataKey="industrial" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="Industrial"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <h4 className="text-lg font-semibold mb-6 flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
            Growth Comparison by Area
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Projected Growth %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  name="Growth Potential"
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Landmark className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
            Key Investment Factors
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 p-1 rounded mr-2 mt-0.5">
                <Landmark className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-medium text-sm">Infrastructure Development</h5>
                <p className="text-xs text-gray-600">Metro connectivity, ring roads</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-green-100 text-green-600 p-1 rounded mr-2 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-medium text-sm">IT Corridor Proximity</h5>
                <p className="text-xs text-gray-600">Tech parks, employment centers</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-purple-100 text-purple-600 p-1 rounded mr-2 mt-0.5">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-medium text-sm">Commercial Development</h5>
                <p className="text-xs text-gray-600">Retail spaces, office complexes</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Investment Trend Analysis</h4>
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

export default InvestmentTrends;

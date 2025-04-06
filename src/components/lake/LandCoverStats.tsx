import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLandCoverData } from '@/hooks/useLandCoverData';
import { Trees, Building2, Droplets, Mountain } from 'lucide-react';

interface LandCoverStatsProps {
  coordinates: [number, number];
  lakeId: string;
}

const LandCoverStats = ({ coordinates, lakeId }: LandCoverStatsProps) => {
  const { data: landCoverData, isLoading, error } = useLandCoverData(coordinates);
  const [chartData, setChartData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    if (landCoverData) {
      setChartData([
        { name: 'Water', value: landCoverData.water, color: '#2563eb' },
        { name: 'Vegetation', value: landCoverData.vegetation, color: '#16a34a' },
        { name: 'Urban', value: landCoverData.urban, color: '#9f1239' },
        { name: 'Barren', value: landCoverData.barren, color: '#ca8a04' }
      ]);
    } else {
      setChartData([
        { name: 'Water', value: lakeId === 'bellandur' ? 18 : lakeId === 'varthur' ? 15 : 25, color: '#2563eb' },
        { name: 'Vegetation', value: lakeId === 'bellandur' ? 22 : lakeId === 'varthur' ? 20 : 40, color: '#16a34a' },
        { name: 'Urban', value: lakeId === 'bellandur' ? 45 : lakeId === 'varthur' ? 50 : 25, color: '#9f1239' },
        { name: 'Barren', value: lakeId === 'bellandur' ? 15 : lakeId === 'varthur' ? 15 : 10, color: '#ca8a04' }
      ]);
    }
  }, [landCoverData, lakeId]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Land Cover Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[220px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-karnataka-lake-medium"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 h-[220px] flex items-center justify-center">
            <p>Error loading land cover data</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <Droplets className="h-4 w-4 text-blue-600 mr-2" />
                <span>Water: {chartData.find(d => d.name === 'Water')?.value || 0}%</span>
              </div>
              <div className="flex items-center">
                <Trees className="h-4 w-4 text-green-600 mr-2" />
                <span>Vegetation: {chartData.find(d => d.name === 'Vegetation')?.value || 0}%</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-red-600 mr-2" />
                <span>Urban: {chartData.find(d => d.name === 'Urban')?.value || 0}%</span>
              </div>
              <div className="flex items-center">
                <Mountain className="h-4 w-4 text-yellow-600 mr-2" />
                <span>Barren: {chartData.find(d => d.name === 'Barren')?.value || 0}%</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {landCoverData?.timestamp ? new Date(landCoverData.timestamp).toLocaleString() : 'N/A'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LandCoverStats;

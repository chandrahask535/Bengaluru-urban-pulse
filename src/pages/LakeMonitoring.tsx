
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Droplet, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import LakeDataService, { WaterQualityData, EncroachmentData } from '@/services/LakeDataService';
import LakeHistoricalData from '@/components/lake/LakeHistoricalData';

const LakeMonitoring = () => {
  const [selectedLake, setSelectedLake] = useState('bellandur');
  const [waterQuality, setWaterQuality] = useState<WaterQualityData | null>(null);
  const [encroachment, setEncroachment] = useState<EncroachmentData | null>(null);
  const [rainfall, setRainfall] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const lakes = [
    { id: 'bellandur', name: 'Bellandur Lake', status: 'Critical' },
    { id: 'varthur', name: 'Varthur Lake', status: 'Moderate' },
    { id: 'hebbal', name: 'Hebbal Lake', status: 'Good' },
    { id: 'ulsoor', name: 'Ulsoor Lake', status: 'Good' },
    { id: 'sankey', name: 'Sankey Tank', status: 'Excellent' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const wq = LakeDataService.getWaterQuality(selectedLake);
        const enc = LakeDataService.getEncroachmentData(selectedLake);
        const rain = LakeDataService.getCurrentRainfall(selectedLake);
        
        setWaterQuality(wq);
        setEncroachment(enc);
        setRainfall(rain);
      } catch (error) {
        console.error('Error fetching lake data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLake]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'moderate': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedLakeData = lakes.find(lake => lake.id === selectedLake);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-karnataka-metro-dark dark:text-white">
          Lake Monitoring System
        </h1>
        <Badge variant="outline" className="text-sm">
          Real-time Data
        </Badge>
      </div>

      {/* Lake Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
            Select Lake
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {lakes.map((lake) => (
              <button
                key={lake.id}
                onClick={() => setSelectedLake(lake.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedLake === lake.id
                    ? 'border-karnataka-metro-medium bg-karnataka-metro-light'
                    : 'border-gray-200 dark:border-gray-700 hover:border-karnataka-metro-light'
                }`}
              >
                <div className="text-sm font-medium">{lake.name}</div>
                <div className="flex items-center justify-center mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(lake.status)}`}
                  >
                    {lake.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedLakeData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Water Quality Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplet className="mr-2 h-5 w-5 text-blue-500" />
                Water Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : waterQuality ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">pH Level</span>
                    <span className="font-medium">{waterQuality.ph.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Dissolved Oxygen</span>
                    <span className="font-medium">{waterQuality.dissolvedOxygen.toFixed(1)} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
                    <span className="font-medium">{waterQuality.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Turbidity</span>
                    <span className="font-medium">{waterQuality.turbidity.toFixed(1)} NTU</span>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Pollution Level: {waterQuality.pollutionLevel}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Encroachment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                Encroachment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : encroachment ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Encroached Area</span>
                    <span className="font-medium">{encroachment.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Affected Area</span>
                    <span className="font-medium">{encroachment.affectedArea.toFixed(1)} hectares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hotspots</span>
                    <span className="font-medium">{encroachment.hotspots}</span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-orange-500"
                        style={{ width: `${encroachment.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Last Survey: {new Date(encroachment.lastSurvey).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Rainfall Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                Current Rainfall
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-karnataka-metro-medium">
                    {rainfall.toFixed(1)} mm/hr
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Real-time precipitation data
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {rainfall > 5 ? 'Heavy rainfall detected' : rainfall > 1 ? 'Moderate rainfall' : 'Light or no rainfall'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historical Data */}
      {selectedLakeData && (
        <LakeHistoricalData
          lakeId={selectedLake}
          lakeName={selectedLakeData.name}
        />
      )}
    </div>
  );
};

export default LakeMonitoring;

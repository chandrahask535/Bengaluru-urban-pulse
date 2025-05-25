
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Sun, CloudSun, CloudLightning, CloudSnow, CloudFog, Cloud, Loader2, AlertTriangle } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import RealTimeWeatherService from '@/services/RealTimeWeatherService';
import { toast } from 'sonner';

interface WeatherForecastProps {
  forecastData?: any;
  location?: string;
  coordinates?: [number, number];
}

const WeatherForecastCard: React.FC<WeatherForecastProps> = ({ 
  forecastData: initialForecastData, 
  location, 
  coordinates 
}) => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates for Bengaluru if none provided
  const defaultCoordinates: [number, number] = [12.9716, 77.5946];
  const actualCoordinates = coordinates || defaultCoordinates;
  
  // Fetch real-time weather data when component mounts or coordinates change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching real-time weather data...');
        const weatherData = await RealTimeWeatherService.getCurrentWeather(
          actualCoordinates[0], 
          actualCoordinates[1]
        );
        
        console.log('Weather data received:', weatherData);
        setCurrentWeather(weatherData);
        
        toast.success('Weather data updated', {
          description: `Live data for ${location || 'Bengaluru'}`
        });
        
      } catch (error: any) {
        console.error("Error fetching weather data:", error);
        setError(error.message);
        toast.error("Failed to fetch live weather data", {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up automatic refresh every 10 minutes for real-time data
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [actualCoordinates[0], actualCoordinates[1], location]);

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear')) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (conditionLower.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (conditionLower.includes('thunderstorm')) return <CloudLightning className="h-6 w-6 text-purple-500" />;
    if (conditionLower.includes('snow')) return <CloudSnow className="h-6 w-6 text-blue-200" />;
    if (conditionLower.includes('mist') || conditionLower.includes('fog')) return <CloudFog className="h-6 w-6 text-gray-400" />;
    return <CloudSun className="h-6 w-6 text-gray-500" />;
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardCard
          title="Current Weather"
          description={`${location || 'Bengaluru'} - Loading live weather data...`}
          icon={CloudRain}
          iconColor="text-bengaluru-rain-medium"
        >
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-bengaluru-rain-medium mx-auto mb-2" />
              <p className="text-sm text-gray-600">Fetching live weather data...</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="space-y-6">
        <DashboardCard
          title="Weather Service Error"
          description={`${location || 'Bengaluru'} - Unable to fetch live data`}
          icon={AlertTriangle}
          iconColor="text-red-500"
        >
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">Failed to load live weather data</p>
              <p className="text-xs text-gray-500">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="space-y-6">
        <DashboardCard
          title="Weather Data"
          description={`${location || 'Bengaluru'} - No data available`}
          icon={CloudRain}
          iconColor="text-gray-500"
        >
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">No weather data available</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Live Weather Data"
        description={`${location || 'Bengaluru'} - ${new Date(currentWeather.timestamp).toLocaleString()} (Live)`}
        icon={CloudRain}
        iconColor="text-bengaluru-rain-medium"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{currentWeather.current.temperature.toFixed(1)}°C</div>
            <div className="flex items-center mt-1">
              {getWeatherIcon(currentWeather.current.description)}
              <span className="ml-1 capitalize">{currentWeather.current.description}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Humidity:</span>
              <span>{currentWeather.current.humidity}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pressure:</span>
              <span>{currentWeather.current.pressure} hPa</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wind Speed:</span>
              <span>{currentWeather.current.windSpeed.toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current Rainfall:</span>
              <span className="font-medium text-blue-600">{currentWeather.current.rainfall.toFixed(1)} mm/h</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Visibility:</span>
              <span>{currentWeather.current.visibility.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cloud Cover:</span>
              <span>{currentWeather.current.cloudCover}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Wind Direction:</span>
              <span>{currentWeather.current.windDirection}°</span>
            </div>
          </div>
        </div>

        {/* Rainfall Forecast */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Rainfall Forecast</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{currentWeather.forecast.next6Hours.toFixed(1)} mm</div>
              <div className="text-gray-500">Next 6 hours</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{currentWeather.forecast.next12Hours.toFixed(1)} mm</div>
              <div className="text-gray-500">Next 12 hours</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{currentWeather.forecast.next24Hours.toFixed(1)} mm</div>
              <div className="text-gray-500">Next 24 hours</div>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        {currentWeather.alerts && currentWeather.alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2 text-red-600">⚠️ Active Weather Alerts</h4>
            <div className="space-y-2">
              {currentWeather.alerts.map((alert: any, index: number) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                  <div className="font-medium text-red-800">{alert.event}</div>
                  <div className="text-red-600">{alert.description}</div>
                  <div className="text-xs text-red-500 mt-1">
                    Severity: {alert.severity} | 
                    Until: {new Date(alert.end).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-2 border-t text-xs text-gray-500">
          <div className="flex justify-between">
            <span>🔄 Auto-refresh: Every 10 minutes</span>
            <span>📡 Source: OpenWeatherMap Live API</span>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default WeatherForecastCard;

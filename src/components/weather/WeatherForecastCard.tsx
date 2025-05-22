
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Sun, CloudSun, CloudLightning, CloudSnow, CloudFog, Cloud, Loader2 } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { fetchRealTimeWeather, fetchWeatherForecast } from '@/utils/mapUtils';
import { toast } from 'sonner';

interface WeatherForecastProps {
  forecastData?: any;
  location?: string;
  coordinates?: [number, number];
}

const WeatherForecastCard: React.FC<WeatherForecastProps> = ({ forecastData: initialForecastData, location, coordinates }) => {
  const [forecastData, setForecastData] = useState<any>(initialForecastData);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default coordinates for Bengaluru if none provided
  const defaultCoordinates: [number, number] = [12.9716, 77.5946];
  const actualCoordinates = coordinates || defaultCoordinates;
  
  // Fetch real-time weather data when component mounts or coordinates change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch current weather
        const weatherData = await fetchRealTimeWeather(actualCoordinates[0], actualCoordinates[1]);
        setCurrentWeather(weatherData);
        
        // Fetch forecast data
        const forecast = await fetchWeatherForecast(actualCoordinates[0], actualCoordinates[1]);
        setForecastData(forecast);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        toast.error("Could not fetch weather data", {
          description: "Using fallback data instead"
        });
        
        // Use the initial data as fallback
        if (initialForecastData) {
          setForecastData(initialForecastData);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [actualCoordinates]);

  // Group forecast data by day
  const groupedByDay = forecastData?.list?.reduce((days: any, item: any) => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toDateString();
    
    if (!days[dateStr]) {
      days[dateStr] = [];
    }
    
    days[dateStr].push(item);
    return days;
  }, {}) || {};

  // Get daily summaries (average temp, predominant weather)
  const dailySummaries = Object.entries(groupedByDay || {}).map(([dateStr, items]: [string, any]) => {
    const temps = items.map((item: any) => item.main.temp);
    const avgTemp = temps.reduce((sum: number, temp: number) => sum + temp, 0) / temps.length;
    
    // Get the most common weather condition
    const weatherCounts: Record<string, number> = {};
    items.forEach((item: any) => {
      const condition = item.weather[0].main;
      weatherCounts[condition] = (weatherCounts[condition] || 0) + 1;
    });
    
    let predominantWeather = '';
    let maxCount = 0;
    
    Object.entries(weatherCounts).forEach(([weather, count]) => {
      if (count > maxCount) {
        maxCount = count;
        predominantWeather = weather;
      }
    });
    
    // Get precipitation sum
    const precipitation = items.reduce((sum: number, item: any) => {
      return sum + (item.rain?.['3h'] || 0);
    }, 0);
    
    return {
      date: new Date(dateStr),
      avgTemp: Math.round(avgTemp),
      minTemp: Math.round(Math.min(...temps)),
      maxTemp: Math.round(Math.max(...temps)),
      predominantWeather,
      precipitation
    };
  });

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch(condition.toLowerCase()) {
      case 'clear': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'clouds': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'drizzle': return <CloudRain className="h-6 w-6 text-blue-300" />;
      case 'thunderstorm': return <CloudLightning className="h-6 w-6 text-purple-500" />;
      case 'snow': return <CloudSnow className="h-6 w-6 text-blue-200" />;
      case 'mist':
      case 'fog': 
        return <CloudFog className="h-6 w-6 text-gray-400" />;
      default: return <CloudSun className="h-6 w-6 text-gray-500" />;
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardCard
          title="Current Weather"
          description={`${location || 'Bengaluru'} - Loading current weather...`}
          icon={CloudRain}
          iconColor="text-bengaluru-rain-medium"
        >
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-bengaluru-rain-medium" />
          </div>
        </DashboardCard>
      </div>
    );
  }

  // Get current weather from API response or from first item in the forecast list
  const weatherData = currentWeather || forecastData?.list?.[0];

  return (
    <div className="space-y-6">
      {weatherData && (
        <DashboardCard
          title="Current Weather"
          description={`${location || 'Bengaluru'} - ${new Date(weatherData.dt * 1000).toLocaleString()}`}
          icon={CloudRain}
          iconColor="text-bengaluru-rain-medium"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold">{Math.round(weatherData.main.temp)}°C</div>
              <div className="flex items-center mt-1">
                {getWeatherIcon(weatherData.weather[0].main)}
                <span className="ml-1">{weatherData.weather[0].main}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Feels Like:</span>
                <span>{Math.round(weatherData.main.feels_like)}°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Humidity:</span>
                <span>{weatherData.main.humidity}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Wind Speed:</span>
                <span>{weatherData.wind.speed} m/s</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pressure:</span>
                <span>{weatherData.main.pressure} hPa</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Visibility:</span>
                <span>{(weatherData.visibility / 1000).toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Probability of Rain:</span>
                <span>{Math.round((weatherData.pop || 0) * 100)}%</span>
              </div>
            </div>
          </div>
        </DashboardCard>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5-Day Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {dailySummaries.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">No forecast data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {dailySummaries.slice(0, 5).map((day, index) => (
                <div key={index} className="border rounded-lg p-4 flex flex-col items-center">
                  <div className="font-medium">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-sm text-gray-500">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="my-2">
                    {getWeatherIcon(day.predominantWeather)}
                  </div>
                  <div className="font-bold text-lg">{day.avgTemp}°C</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {day.minTemp}° / {day.maxTemp}°
                  </div>
                  <div className="mt-2 flex items-center">
                    <CloudRain className="h-3 w-3 text-bengaluru-rain-medium mr-1" />
                    <span className="text-xs">{day.precipitation.toFixed(1)} mm</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherForecastCard;

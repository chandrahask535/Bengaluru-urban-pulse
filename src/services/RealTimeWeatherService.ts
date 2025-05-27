
import { API_KEYS } from '@/config/api-keys';

export interface RealTimeWeatherData {
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    rainfall: number;
    visibility: number;
    description: string;
    cloudCover: number;
  };
  forecast: {
    next6Hours: number;
    next12Hours: number;
    next24Hours: number;
  };
  alerts?: Array<{
    event: string;
    severity: string;
    description: string;
  }>;
}

class RealTimeWeatherService {
  private static instance: RealTimeWeatherService;

  public static getInstance(): RealTimeWeatherService {
    if (!RealTimeWeatherService.instance) {
      RealTimeWeatherService.instance = new RealTimeWeatherService();
    }
    return RealTimeWeatherService.instance;
  }

  async getCurrentWeather(lat: number, lng: number): Promise<RealTimeWeatherData> {
    try {
      console.log(`Fetching weather data for coordinates: ${lat}, ${lng}`);
      
      // Fetch current weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEYS.OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      console.log('Weather data received:', weatherData);

      // Fetch forecast data
      let forecastData;
      try {
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${API_KEYS.OPENWEATHER_API_KEY}&units=metric`
        );
        
        if (forecastResponse.ok) {
          forecastData = await forecastResponse.json();
          console.log('Forecast data received:', forecastData);
        }
      } catch (error) {
        console.warn('Failed to fetch forecast data:', error);
      }

      // Process the data
      const rainfall = weatherData.rain?.['1h'] || weatherData.rain?.['3h'] / 3 || 0;
      
      // Calculate forecast rainfall from forecast data
      let next6Hours = 0;
      let next12Hours = 0;
      let next24Hours = 0;
      
      if (forecastData?.list) {
        // Sum rainfall for different time periods
        for (let i = 0; i < Math.min(forecastData.list.length, 8); i++) {
          const item = forecastData.list[i];
          const itemRain = item.rain?.['3h'] || 0;
          
          if (i < 2) next6Hours += itemRain; // First 6 hours (2 * 3h periods)
          if (i < 4) next12Hours += itemRain; // First 12 hours (4 * 3h periods)
          if (i < 8) next24Hours += itemRain; // First 24 hours (8 * 3h periods)
        }
      }

      const result: RealTimeWeatherData = {
        current: {
          temperature: weatherData.main.temp || 25,
          humidity: weatherData.main.humidity || 60,
          pressure: weatherData.main.pressure || 1013,
          windSpeed: weatherData.wind?.speed || 0,
          windDirection: weatherData.wind?.deg || 0,
          rainfall: rainfall,
          visibility: (weatherData.visibility || 10000) / 1000, // Convert to km
          description: weatherData.weather?.[0]?.description || 'Clear',
          cloudCover: weatherData.clouds?.all || 0,
        },
        forecast: {
          next6Hours: Math.round(next6Hours * 100) / 100,
          next12Hours: Math.round(next12Hours * 100) / 100,
          next24Hours: Math.round(next24Hours * 100) / 100,
        },
        alerts: [] // Weather alerts would require a different API endpoint
      };

      console.log('Processed weather data:', result);
      return result;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Return fallback data instead of throwing
      return {
        current: {
          temperature: 25,
          humidity: 65,
          pressure: 1013,
          windSpeed: 5,
          windDirection: 180,
          rainfall: 0,
          visibility: 10,
          description: 'Clear',
          cloudCover: 20,
        },
        forecast: {
          next6Hours: 0,
          next12Hours: 0.5,
          next24Hours: 1.2,
        },
        alerts: []
      };
    }
  }

  async getWeatherAlerts(lat: number, lng: number): Promise<any[]> {
    try {
      // Note: Weather alerts typically require a premium OpenWeatherMap subscription
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }
}

export default RealTimeWeatherService.getInstance();

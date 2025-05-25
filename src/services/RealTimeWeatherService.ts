
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
    start: string;
    end: string;
  }>;
  timestamp: string;
}

class RealTimeWeatherService {
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private static readonly API_KEY = API_KEYS.OPENWEATHER_API_KEY;

  static async getCurrentWeather(lat: number, lng: number): Promise<RealTimeWeatherData> {
    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      
      // Fetch forecast for rainfall prediction
      const forecastResponse = await fetch(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric`
      );
      
      let forecastData = null;
      if (forecastResponse.ok) {
        forecastData = await forecastResponse.json();
      }
      
      // Fetch weather alerts
      const alertsResponse = await fetch(
        `${this.BASE_URL}/onecall?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&exclude=minutely,daily`
      );
      
      let alertsData = null;
      if (alertsResponse.ok) {
        alertsData = await alertsResponse.json();
      }
      
      // Process rainfall data
      const rainfall = currentData.rain ? (currentData.rain['1h'] || currentData.rain['3h'] || 0) : 0;
      
      // Process forecast rainfall
      let next6Hours = 0, next12Hours = 0, next24Hours = 0;
      if (forecastData && forecastData.list) {
        const forecasts = forecastData.list.slice(0, 8); // Next 24 hours (3-hour intervals)
        
        // Calculate rainfall for different time periods
        next6Hours = forecasts.slice(0, 2).reduce((sum: number, item: any) => 
          sum + (item.rain ? (item.rain['3h'] || 0) : 0), 0
        );
        
        next12Hours = forecasts.slice(0, 4).reduce((sum: number, item: any) => 
          sum + (item.rain ? (item.rain['3h'] || 0) : 0), 0
        );
        
        next24Hours = forecasts.reduce((sum: number, item: any) => 
          sum + (item.rain ? (item.rain['3h'] || 0) : 0), 0
        );
      }
      
      return {
        current: {
          temperature: currentData.main.temp,
          humidity: currentData.main.humidity,
          pressure: currentData.main.pressure,
          windSpeed: currentData.wind?.speed || 0,
          windDirection: currentData.wind?.deg || 0,
          rainfall: rainfall,
          visibility: currentData.visibility / 1000, // Convert to km
          description: currentData.weather[0].description,
          cloudCover: currentData.clouds.all,
        },
        forecast: {
          next6Hours,
          next12Hours,
          next24Hours,
        },
        alerts: alertsData?.alerts?.map((alert: any) => ({
          event: alert.event,
          severity: alert.tags[0] || 'unknown',
          description: alert.description,
          start: new Date(alert.start * 1000).toISOString(),
          end: new Date(alert.end * 1000).toISOString(),
        })) || [],
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error('Error fetching real-time weather data:', error);
      
      // Return fallback data with error indication
      return {
        current: {
          temperature: 25,
          humidity: 65,
          pressure: 1013,
          windSpeed: 2.5,
          windDirection: 180,
          rainfall: 0,
          visibility: 10,
          description: 'Data unavailable',
          cloudCover: 50,
        },
        forecast: {
          next6Hours: 0,
          next12Hours: 0,
          next24Hours: 0,
        },
        alerts: [],
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  static async getWeatherAlerts(lat: number, lng: number) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/onecall?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&exclude=current,minutely,hourly,daily`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }
}

export default RealTimeWeatherService;

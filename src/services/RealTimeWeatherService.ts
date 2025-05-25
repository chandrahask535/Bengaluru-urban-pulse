
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
      console.log(`Fetching real-time weather for ${lat}, ${lng}`);
      
      if (!this.API_KEY) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status} - ${currentResponse.statusText}`);
      }
      
      const currentData = await currentResponse.json();
      console.log('Current weather data:', currentData);
      
      // Fetch forecast for rainfall prediction
      const forecastResponse = await fetch(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric`
      );
      
      let forecastData = null;
      if (forecastResponse.ok) {
        forecastData = await forecastResponse.json();
        console.log('Forecast data received');
      }
      
      // Fetch weather alerts using One Call API 3.0
      let alertsData = null;
      try {
        const alertsResponse = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&exclude=minutely,daily`
        );
        
        if (alertsResponse.ok) {
          alertsData = await alertsResponse.json();
          console.log('Alerts data received');
        }
      } catch (alertError) {
        console.warn('Could not fetch alerts:', alertError);
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
      
      const weatherData: RealTimeWeatherData = {
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
          severity: alert.tags?.[0] || 'unknown',
          description: alert.description,
          start: new Date(alert.start * 1000).toISOString(),
          end: new Date(alert.end * 1000).toISOString(),
        })) || [],
        timestamp: new Date().toISOString(),
      };

      console.log('Processed weather data:', weatherData);
      return weatherData;
      
    } catch (error) {
      console.error('Error fetching real-time weather data:', error);
      throw error; // Throw the error instead of returning fallback data
    }
  }
  
  static async getWeatherAlerts(lat: number, lng: number) {
    try {
      console.log(`Fetching weather alerts for ${lat}, ${lng}`);
      
      if (!this.API_KEY) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&exclude=current,minutely,hourly,daily`
      );
      
      if (!response.ok) {
        throw new Error(`Alerts API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  }
}

export default RealTimeWeatherService;

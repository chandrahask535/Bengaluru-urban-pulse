
import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

// Define base API URL for weather and other services
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "default_api_key";

// Service response type
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Types for lake data
export interface WaterQualityData {
  ph: number;
  do: number;
  bod: number;
  turbidity: number;
  temperature: number;
}

export interface EncroachmentData {
  percentage: number;
  hotspots: number;
  area_lost: number;
}

export interface HistoricalData {
  dates: string[];
  ph: number[];
  do: number[];
  encroachment: number[];
}

// Types for weather API responses
interface WeatherResponse {
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  main: {
    temp: number;
    humidity: number;
  };
}

interface ForecastResponse {
  list: Array<{
    rain?: {
      '3h'?: number;
    };
    main: {
      temp: number;
      humidity: number;
    };
  }>;
}

// LakeDataService class for handling lake-related API calls
export class LakeDataService {
  // Get water quality data for a specific lake
  static async getWaterQuality(lakeId: string): Promise<ServiceResponse<WaterQualityData>> {
    try {
      // In a real app, this would fetch from your backend API
      // For now, we'll simulate with random data
      const mockData: WaterQualityData = {
        ph: 5.5 + Math.random() * 3,
        do: 2 + Math.random() * 6,
        bod: 5 + Math.random() * 20,
        turbidity: 2 + Math.random() * 8,
        temperature: 22 + Math.random() * 8
      };
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error("Error fetching water quality data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        data: {
          ph: 7,
          do: 4,
          bod: 10,
          turbidity: 5,
          temperature: 25
        }
      };
    }
  }

  // Get encroachment data for a specific lake
  static async getEncroachmentData(lakeId: string): Promise<ServiceResponse<EncroachmentData>> {
    try {
      // Simulated data
      const mockData: EncroachmentData = {
        percentage: Math.floor(Math.random() * 40),
        hotspots: Math.floor(Math.random() * 5),
        area_lost: Math.floor(Math.random() * 200)
      };
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error("Error fetching encroachment data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        data: {
          percentage: 0,
          hotspots: 0,
          area_lost: 0
        }
      };
    }
  }

  // Get historical data for a specific lake
  static async getHistoricalData(lakeId: string): Promise<ServiceResponse<HistoricalData>> {
    try {
      // Simulated data
      const dates = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const mockData: HistoricalData = {
        dates,
        ph: Array.from({ length: 10 }, () => 5.5 + Math.random() * 3),
        do: Array.from({ length: 10 }, () => 2 + Math.random() * 6),
        encroachment: Array.from({ length: 10 }, (_, i) => 10 + i * 2 + Math.random() * 5)
      };
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error("Error fetching historical data:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: errorMessage,
        data: {
          dates: [],
          ph: [],
          do: [],
          encroachment: []
        }
      };
    }
  }

  // Get current rainfall data for a location
  static async getCurrentRainfall(lat: number, lon: number): Promise<number> {
    try {
      const response = await axios.get(`${WEATHER_API_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      // Extract rainfall data if available
      const data = response.data as WeatherResponse;
      const rainfall = data.rain ? 
        (data.rain['1h'] || data.rain['3h'] || 0) : 
        0;
      
      return rainfall;
    } catch (error) {
      console.error("Error fetching rainfall data:", error);
      return 0; // Default to 0 mm if there's an error
    }
  }

  // Get flood risk prediction for a location
  static async getFloodRiskPrediction(lat: number, lon: number): Promise<{ risk_level: "Critical" | "High" | "Moderate" | "Low"; probability: number }> {
    try {
      // In a real app, this would call your ML model API
      // For now, we'll use weather data to simulate a risk level
      const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      // Calculate average rainfall from forecast
      const data = response.data as ForecastResponse;
      const forecasts = data.list.slice(0, 8); // Next 24 hours
      const totalRainfall = forecasts.reduce((sum: number, item: any) => {
        const rain = item.rain ? (item.rain['3h'] || 0) : 0;
        return sum + rain;
      }, 0);
      
      const avgRainfall = totalRainfall / forecasts.length;
      
      // Determine risk level based on rainfall
      let riskLevel: "Critical" | "High" | "Moderate" | "Low" = "Low";
      let probability = 0;
      
      if (avgRainfall > 15) {
        riskLevel = "Critical";
        probability = 80 + Math.random() * 20;
      } else if (avgRainfall > 10) {
        riskLevel = "High";
        probability = 60 + Math.random() * 20;
      } else if (avgRainfall > 5) {
        riskLevel = "Moderate";
        probability = 30 + Math.random() * 30;
      } else {
        riskLevel = "Low";
        probability = Math.random() * 30;
      }
      
      return {
        risk_level: riskLevel,
        probability: Math.round(probability)
      };
    } catch (error) {
      console.error("Error predicting flood risk:", error);
      return {
        risk_level: "Low",
        probability: 0
      };
    }
  }

  // Get rainfall forecast (sum of rain for next 24 hours) for a location
  static async getRainfallForecast(lat: number, lon: number): Promise<number> {
    try {
      const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
        }
      });

      const data = response.data as ForecastResponse;
      // Sum rainfall for next 8 forecast periods (24h since 3h intervals)
      const forecasts = data.list.slice(0, 8);
      const totalRainfall = forecasts.reduce((sum: number, item) => {
        const rain = item.rain ? (item.rain['3h'] || 0) : 0;
        return sum + rain;
      }, 0);

      return totalRainfall;
    } catch (error) {
      console.error("Error fetching rainfall forecast:", error);
      return 0;
    }
  }
}


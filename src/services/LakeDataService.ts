import axios, { AxiosError } from 'axios';

interface WaterQualityData {
  ph: number;
  do: number;
  bod: number;
  turbidity: number;
  temperature: number;
}

interface EncroachmentData {
  percentage: number;
  hotspots: number;
  area_lost: number;
}

interface HistoricalData {
  dates: string[];
  ph: number[];
  do: number[];
  encroachment: number[];
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
}

const DEFAULT_WATER_QUALITY: WaterQualityData = {
  ph: 7,
  do: 0,
  bod: 0,
  turbidity: 0,
  temperature: 25
};

const DEFAULT_ENCROACHMENT: EncroachmentData = {
  percentage: 0,
  hotspots: 0,
  area_lost: 0
};

const DEFAULT_HISTORICAL: HistoricalData = {
  dates: [],
  ph: [],
  do: [],
  encroachment: []
};

const OPENWEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY || '';
const KSPCB_API_ENDPOINT = 'https://kspcb.gov.in/api/v1';

const handleServiceError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export class LakeDataService {
  static async getWaterQuality(lakeId: string): Promise<ServiceResponse<WaterQualityData>> {
    try {
      // In production, this would call the KSPCB API
      const response = await axios.get(`${KSPCB_API_ENDPOINT}/water-quality/${lakeId}`);
      return {
        data: response.data,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error fetching water quality data:', error);
      return {
        data: DEFAULT_WATER_QUALITY,
        error: handleServiceError(error),
        status: 'error'
      };
    }
  }

  static async getEncroachmentData(lakeId: string): Promise<ServiceResponse<EncroachmentData>> {
    try {
      // In production, this would call the government land records API
      const response = await axios.get(`${KSPCB_API_ENDPOINT}/encroachment/${lakeId}`);
      return {
        data: response.data,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error fetching encroachment data:', error);
      return {
        data: DEFAULT_ENCROACHMENT,
        error: handleServiceError(error),
        status: 'error'
      };
    }
  }

  static async getHistoricalData(lakeId: string): Promise<ServiceResponse<HistoricalData>> {
    try {
      // In production, this would fetch historical data from KSPCB database
      const response = await axios.get(`${KSPCB_API_ENDPOINT}/historical/${lakeId}`);
      return {
        data: response.data,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return {
        data: DEFAULT_HISTORICAL,
        error: handleServiceError(error),
        status: 'error'
      };
    }
  }

  static async getCurrentRainfall(lat: number, lon: number): Promise<ServiceResponse<number>> {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      return {
        data: response.data.rain?.['1h'] || 0,
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error fetching rainfall data:', error);
      return {
        data: 0,
        error: handleServiceError(error),
        status: 'error'
      };
    }
  }

  static async getFloodRiskPrediction(lat: number, lon: number): Promise<ServiceResponse<{
    risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
    probability: number;
  }>> {
    try {
      // This would integrate with your ML model API in production
      const weatherData = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      // Process weather forecast data to determine flood risk
      const rainfall24h = weatherData.data.list
        .slice(0, 8)
        .reduce((acc: number, item: any) => acc + (item.rain?.['3h'] || 0), 0);
      
      let risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
      let probability: number;

      if (rainfall24h > 100) {
        risk_level = 'Critical';
        probability = 90;
      } else if (rainfall24h > 50) {
        risk_level = 'High';
        probability = 75;
      } else if (rainfall24h > 25) {
        risk_level = 'Moderate';
        probability = 50;
      } else {
        risk_level = 'Low';
        probability = 25;
      }

      return {
        data: { risk_level, probability },
        error: null,
        status: 'success'
      };
    } catch (error) {
      console.error('Error predicting flood risk:', error);
      return {
        data: { risk_level: 'Low', probability: 0 },
        error: handleServiceError(error),
        status: 'error'
      };
    }
  }
}
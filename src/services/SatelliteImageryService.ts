import { API_KEYS, API_ENDPOINTS, API_CONFIG } from '@/config/api-keys';

interface SatelliteImageryParams {
  lat: number;
  lng: number;
  date?: string;
  dim?: number;
}

interface BhuvanParams extends SatelliteImageryParams {
  resolution?: string;
  product?: string;
}

class SatelliteImageryService {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async getNASAEarthImagery(params: SatelliteImageryParams) {
    const { lat, lng, date, dim = 0.025 } = params;
    const url = new URL(`${API_ENDPOINTS.NASA_EARTH}/imagery`);
    
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('lon', lng.toString());
    url.searchParams.append('dim', dim.toString());
    url.searchParams.append('api_key', API_KEYS.NASA_EARTH_API_KEY);
    
    if (date) {
      url.searchParams.append('date', date);
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching NASA Earth imagery:', error);
      throw error;
    }
  }

  static async getBhuvanImagery(params: BhuvanParams) {
    const { lat, lng, date, resolution = 'high', product = 'lulc' } = params;
    const url = new URL(`${API_ENDPOINTS.BHUVAN}/imagery`);
    
    url.searchParams.append('lat', lat.toString());
    url.searchParams.append('lon', lng.toString());
    url.searchParams.append('resolution', resolution);
    url.searchParams.append('product', product);
    url.searchParams.append('token', API_KEYS.BHUVAN_API_KEY);
    
    if (date) {
      url.searchParams.append('date', date);
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEYS.BHUVAN_API_KEY}`
        }
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching Bhuvan imagery:', error);
      throw error;
    }
  }

  static async getWaterBodyChanges(lat: number, lng: number, startDate: string, endDate: string) {
    try {
      const [historicalData, currentData] = await Promise.all([
        this.getNASAEarthImagery({ lat, lng, date: startDate }),
        this.getBhuvanImagery({ lat, lng, date: endDate })
      ]);

      return {
        historical: historicalData,
        current: currentData,
        changes: {
          // Process and analyze changes between the two datasets
          timestamp: new Date().toISOString(),
          waterBodyArea: {
            historical: historicalData.area,
            current: currentData.area,
            difference: currentData.area - historicalData.area
          }
        }
      };
    } catch (error) {
      console.error('Error analyzing water body changes:', error);
      throw error;
    }
  }
}

export default SatelliteImageryService;
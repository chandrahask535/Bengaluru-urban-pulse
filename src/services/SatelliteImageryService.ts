
import { API_KEYS } from '@/config/api-keys';

interface ImageryRequest {
  lat: number;
  lng: number;
  date?: string;
}

interface ImageryResponse {
  url: string;
  date: string;
  source: string;
}

interface WaterBodyChangeData {
  historical: {
    area: number;
    waterQuality: string;
  };
  current: {
    area: number;
    waterQuality: string;
    hotspots: number;
  };
}

class SatelliteImageryService {
  private static instance: SatelliteImageryService;

  public static getInstance(): SatelliteImageryService {
    if (!SatelliteImageryService.instance) {
      SatelliteImageryService.instance = new SatelliteImageryService();
    }
    return SatelliteImageryService.instance;
  }

  async getNASAEarthImagery({ lat, lng, date }: ImageryRequest): Promise<ImageryResponse> {
    try {
      // Use NASA Earth Imagery API
      const imageDate = date || '2024-01-01';
      const url = `https://api.nasa.gov/planetary/earth/imagery?lat=${lat}&lon=${lng}&dim=0.025&api_key=${API_KEYS.NASA_API_KEY}&date=${imageDate}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        // NASA returns the image directly
        return {
          url: url,
          date: imageDate,
          source: 'NASA MODIS'
        };
      } else {
        // Fallback to ESRI World Imagery
        throw new Error('NASA imagery not available');
      }
    } catch (error) {
      console.warn('NASA imagery failed, using fallback:', error);
      
      // Fallback to ESRI World Imagery
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        date: date || new Date().toISOString().split('T')[0],
        source: 'ESRI World Imagery'
      };
    }
  }

  async getBhuvanImagery({ lat, lng, date }: ImageryRequest): Promise<ImageryResponse> {
    try {
      // Attempt to use ISRO Bhuvan API (may not be publicly accessible)
      const imageDate = date || '2024-01-01';
      const url = `https://bhuvan.nrsc.gov.in/api/imagery?lat=${lat}&lon=${lng}&resolution=high&product=lulc&token=${API_KEYS.BHUVAN_TOKEN}&date=${imageDate}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_KEYS.BHUVAN_TOKEN}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url || url,
          date: imageDate,
          source: 'ISRO Bhuvan'
        };
      } else {
        throw new Error('Bhuvan imagery not available');
      }
    } catch (error) {
      console.warn('Bhuvan imagery failed, using fallback:', error);
      
      // Fallback to OpenStreetMap
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        date: date || new Date().toISOString().split('T')[0],
        source: 'OpenStreetMap'
      };
    }
  }

  async getWaterBodyChanges(lat: number, lng: number, historicalDate: string, currentDate: string): Promise<WaterBodyChangeData> {
    try {
      // This would typically involve complex satellite image analysis
      // For now, we'll return mock data with realistic variations
      const baseArea = 800 + Math.random() * 200;
      const historicalArea = baseArea;
      const currentArea = baseArea * (0.8 + Math.random() * 0.4); // ±20% variation
      
      // Simulate water quality degradation over time
      const qualityLevels = ['Excellent', 'Good', 'Moderate', 'Poor'];
      const historicalQuality = qualityLevels[Math.floor(Math.random() * 2)]; // Better in past
      const currentQuality = qualityLevels[Math.floor(Math.random() * 4)]; // Could be worse now
      
      return {
        historical: {
          area: Math.round(historicalArea),
          waterQuality: historicalQuality
        },
        current: {
          area: Math.round(currentArea),
          waterQuality: currentQuality,
          hotspots: Math.floor(Math.random() * 5) + 1
        }
      };
    } catch (error) {
      console.error('Failed to analyze water body changes:', error);
      
      // Return fallback data
      return {
        historical: {
          area: 850,
          waterQuality: 'Good'
        },
        current: {
          area: 720,
          waterQuality: 'Moderate',
          hotspots: 3
        }
      };
    }
  }

  async getAvailableDates(lat: number, lng: number): Promise<string[]> {
    try {
      // Try to get available dates from NASA
      const response = await fetch(
        `https://api.nasa.gov/planetary/earth/assets?lon=${lng}&lat=${lat}&date=2024-01-01&dim=0.15&api_key=${API_KEYS.NASA_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return [data.date || '2024-01-01'];
      }
    } catch (error) {
      console.warn('Failed to get available dates:', error);
    }
    
    // Return some default dates
    return [
      '2024-01-01',
      '2023-01-01',
      '2022-01-01',
      '2021-01-01',
      '2020-01-01'
    ];
  }
}

export default SatelliteImageryService.getInstance();

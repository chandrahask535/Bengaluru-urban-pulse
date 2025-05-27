
import { formatNumber } from './HistoricalFloodDataService';

interface LakeData {
  id: string;
  name: string;
  coordinates: [number, number];
  area: number; // in hectares
  maxDepth: number; // in meters
  currentLevel: number; // percentage of capacity
  waterQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  pollutionLevel: number; // 0-100 scale
  temperature: number; // in Celsius
  ph: number;
  dissolvedOxygen: number; // mg/L
  lastUpdated: string;
}

interface LakeMonitoringData {
  timestamp: string;
  waterLevel: number;
  temperature: number;
  ph: number;
  dissolvedOxygen: number;
  turbidity: number;
  pollutants: {
    nitrogen: number;
    phosphorus: number;
    heavyMetals: number;
  };
}

export class LakeDataService {
  private static instance: LakeDataService;
  private lakes: LakeData[] = [];

  public static getInstance(): LakeDataService {
    if (!LakeDataService.instance) {
      LakeDataService.instance = new LakeDataService();
    }
    return LakeDataService.instance;
  }

  constructor() {
    this.initializeLakeData();
  }

  private initializeLakeData() {
    this.lakes = [
      {
        id: 'bellandur',
        name: 'Bellandur Lake',
        coordinates: [12.9373, 77.6402],
        area: 361,
        maxDepth: 3.5,
        currentLevel: 78,
        waterQuality: 'Poor',
        pollutionLevel: 75,
        temperature: 26.5,
        ph: 7.8,
        dissolvedOxygen: 4.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'varthur',
        name: 'Varthur Lake',
        coordinates: [12.9417, 77.7341],
        area: 222,
        maxDepth: 2.8,
        currentLevel: 65,
        waterQuality: 'Fair',
        pollutionLevel: 60,
        temperature: 25.8,
        ph: 7.5,
        dissolvedOxygen: 5.1,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'hebbal',
        name: 'Hebbal Lake',
        coordinates: [13.0450, 77.5950],
        area: 154,
        maxDepth: 4.2,
        currentLevel: 82,
        waterQuality: 'Good',
        pollutionLevel: 35,
        temperature: 24.9,
        ph: 7.2,
        dissolvedOxygen: 6.8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'ulsoor',
        name: 'Ulsoor Lake',
        coordinates: [12.9825, 77.6203],
        area: 125,
        maxDepth: 3.1,
        currentLevel: 71,
        waterQuality: 'Good',
        pollutionLevel: 40,
        temperature: 25.3,
        ph: 7.1,
        dissolvedOxygen: 6.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'sankey',
        name: 'Sankey Tank',
        coordinates: [12.9967, 77.5764],
        area: 15,
        maxDepth: 2.5,
        currentLevel: 88,
        waterQuality: 'Excellent',
        pollutionLevel: 15,
        temperature: 24.1,
        ph: 6.9,
        dissolvedOxygen: 7.5,
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  getAllLakes(): LakeData[] {
    return [...this.lakes];
  }

  getLakeById(id: string): LakeData | undefined {
    return this.lakes.find(lake => lake.id === id);
  }

  getLakesByQuality(quality: LakeData['waterQuality']): LakeData[] {
    return this.lakes.filter(lake => lake.waterQuality === quality);
  }

  getRealTimeData(lakeId: string): LakeMonitoringData {
    const lake = this.getLakeById(lakeId);
    if (!lake) {
      throw new Error(`Lake with id ${lakeId} not found`);
    }

    // Generate realistic real-time data with some variation
    const baseTemp = lake.temperature;
    const basePh = lake.ph;
    const baseDO = lake.dissolvedOxygen;
    
    return {
      timestamp: new Date().toISOString(),
      waterLevel: formatNumber(lake.currentLevel + (Math.random() - 0.5) * 2, 1),
      temperature: formatNumber(baseTemp + (Math.random() - 0.5) * 1, 1),
      ph: formatNumber(basePh + (Math.random() - 0.5) * 0.2, 2),
      dissolvedOxygen: formatNumber(baseDO + (Math.random() - 0.5) * 0.5, 1),
      turbidity: formatNumber(20 + Math.random() * 30, 1), // NTU
      pollutants: {
        nitrogen: formatNumber(5 + Math.random() * 10, 2), // mg/L
        phosphorus: formatNumber(0.5 + Math.random() * 2, 2), // mg/L
        heavyMetals: formatNumber(0.1 + Math.random() * 0.5, 3) // mg/L
      }
    };
  }

  getHistoricalData(lakeId: string, days: number = 30): LakeMonitoringData[] {
    const lake = this.getLakeById(lakeId);
    if (!lake) {
      throw new Error(`Lake with id ${lakeId} not found`);
    }

    const data: LakeMonitoringData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Add some seasonal and random variation
      const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const randomFactor = (Math.random() - 0.5) * 0.3;
      
      data.push({
        timestamp: date.toISOString(),
        waterLevel: formatNumber(lake.currentLevel + seasonalFactor * 10 + randomFactor * 5, 1),
        temperature: formatNumber(lake.temperature + seasonalFactor * 3 + randomFactor * 2, 1),
        ph: formatNumber(lake.ph + randomFactor * 0.5, 2),
        dissolvedOxygen: formatNumber(lake.dissolvedOxygen + randomFactor * 1, 1),
        turbidity: formatNumber(20 + Math.random() * 30, 1),
        pollutants: {
          nitrogen: formatNumber(5 + Math.random() * 10, 2),
          phosphorus: formatNumber(0.5 + Math.random() * 2, 2),
          heavyMetals: formatNumber(0.1 + Math.random() * 0.5, 3)
        }
      });
    }
    
    return data;
  }

  updateLakeData(lakeId: string, updates: Partial<LakeData>): boolean {
    const lakeIndex = this.lakes.findIndex(lake => lake.id === lakeId);
    if (lakeIndex === -1) {
      return false;
    }
    
    this.lakes[lakeIndex] = {
      ...this.lakes[lakeIndex],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    return true;
  }

  getLakeStatistics() {
    const totalLakes = this.lakes.length;
    const averagePollution = formatNumber(
      this.lakes.reduce((sum, lake) => sum + lake.pollutionLevel, 0) / totalLakes,
      1
    );
    
    const qualityDistribution = this.lakes.reduce((acc, lake) => {
      acc[lake.waterQuality] = (acc[lake.waterQuality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageLevel = formatNumber(
      this.lakes.reduce((sum, lake) => sum + lake.currentLevel, 0) / totalLakes,
      1
    );
    
    return {
      totalLakes,
      averagePollution,
      qualityDistribution,
      averageLevel,
      lastUpdated: new Date().toISOString()
    };
  }
}

export default LakeDataService.getInstance();

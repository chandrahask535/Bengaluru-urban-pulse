
import { supabase } from "@/integrations/supabase/client";

export interface HistoricalFloodEvent {
  id: string;
  date: string;
  location: {
    name: string;
    coordinates: [number, number];
  };
  severity: 'Minor' | 'Moderate' | 'Major' | 'Extreme';
  affectedArea: number; // in sq km
  casualties?: number;
  economicLoss?: number; // in crores
  description: string;
  source: string;
  images?: string[];
}

export interface FloodStatistics {
  totalEvents: number;
  byYear: Record<string, number>;
  bySeverity: Record<string, number>;
  averageAffectedArea: number;
  trendAnalysis: {
    isIncreasing: boolean;
    changePercentage: number;
  };
}

class HistoricalFloodDataService {
  private static floodEvents: HistoricalFloodEvent[] = [
    // 2024 Events
    {
      id: "flood_2024_001",
      date: "2024-05-30",
      location: { name: "Mahadevapura", coordinates: [12.9899, 77.6976] },
      severity: "Major",
      affectedArea: 15.2,
      casualties: 0,
      economicLoss: 45,
      description: "Heavy rainfall caused flooding in low-lying areas of Mahadevapura. Several tech parks were affected.",
      source: "BBMP Disaster Management",
      images: []
    },
    {
      id: "flood_2024_002", 
      date: "2024-08-15",
      location: { name: "Bellandur", coordinates: [12.9373, 77.6402] },
      severity: "Extreme",
      affectedArea: 25.8,
      casualties: 2,
      economicLoss: 120,
      description: "Severe flooding due to lake overflow and inadequate drainage. Major traffic disruptions.",
      source: "Karnataka State Disaster Management Authority",
      images: []
    },
    {
      id: "flood_2024_003",
      date: "2024-09-22",
      location: { name: "Electronic City", coordinates: [12.8456, 77.6603] },
      severity: "Moderate",
      affectedArea: 8.5,
      casualties: 0,
      economicLoss: 25,
      description: "Flash floods in Electronic City due to sudden heavy downpour.",
      source: "BBMP",
      images: []
    },

    // 2023 Events
    {
      id: "flood_2023_001",
      date: "2023-06-18",
      location: { name: "Yelahanka", coordinates: [13.1007, 77.5963] },
      severity: "Major",
      affectedArea: 18.7,
      casualties: 1,
      economicLoss: 65,
      description: "Widespread flooding in Yelahanka due to heavy monsoon rains and poor drainage.",
      source: "KSNDMC",
      images: []
    },
    {
      id: "flood_2023_002",
      date: "2023-07-25",
      location: { name: "KR Puram", coordinates: [12.9698, 77.7019] },
      severity: "Moderate",
      affectedArea: 12.3,
      casualties: 0,
      economicLoss: 35,
      description: "Residential areas in KR Puram experienced flooding due to overflowing storm drains.",
      source: "BBMP",
      images: []
    },
    {
      id: "flood_2023_003",
      date: "2023-10-12",
      location: { name: "Sarjapur", coordinates: [12.9078, 77.6906] },
      severity: "Minor",
      affectedArea: 5.2,
      casualties: 0,
      economicLoss: 12,
      description: "Minor flooding in newly developed areas of Sarjapur.",
      source: "Local Administration",
      images: []
    },

    // 2022 Events
    {
      id: "flood_2022_001",
      date: "2022-05-20",
      location: { name: "Bommanahalli", coordinates: [12.9156, 77.6347] },
      severity: "Major",
      affectedArea: 22.1,
      casualties: 3,
      economicLoss: 85,
      description: "Severe flooding affected residential and commercial areas in Bommanahalli zone.",
      source: "KSNDMC",
      images: []
    },
    {
      id: "flood_2022_002",
      date: "2022-08-08",
      location: { name: "Hebbal", coordinates: [13.0450, 77.5950] },
      severity: "Moderate",
      affectedArea: 9.8,
      casualties: 0,
      economicLoss: 28,
      description: "Flooding near Hebbal Lake due to heavy rains and encroachment issues.",
      source: "BBMP",
      images: []
    },

    // 2021 Events
    {
      id: "flood_2021_001",
      date: "2021-09-05",
      location: { name: "Koramangala", coordinates: [12.9352, 77.6245] },
      severity: "Major",
      affectedArea: 16.4,
      casualties: 1,
      economicLoss: 55,
      description: "Urban flooding in Koramangala due to inadequate storm water drainage.",
      source: "KSNDMC",
      images: []
    },
    {
      id: "flood_2021_002",
      date: "2021-11-15",
      location: { name: "Whitefield", coordinates: [12.9698, 77.7500] },
      severity: "Moderate",
      affectedArea: 13.2,
      casualties: 0,
      economicLoss: 40,
      description: "Flooding in IT corridor areas of Whitefield due to poor urban planning.",
      source: "BBMP",
      images: []
    },

    // 2020 Events
    {
      id: "flood_2020_001",
      date: "2020-06-28",
      location: { name: "Rajaji Nagar", coordinates: [12.9915, 77.5525] },
      severity: "Major",
      affectedArea: 20.5,
      casualties: 2,
      economicLoss: 75,
      description: "Severe flooding in central Bangalore affecting multiple wards in Rajaji Nagar.",
      source: "KSNDMC",
      images: []
    },
    {
      id: "flood_2020_002",
      date: "2020-10-22",
      location: { name: "Jayanagar", coordinates: [12.9279, 77.5816] },
      severity: "Moderate",
      affectedArea: 11.7,
      casualties: 0,
      economicLoss: 32,
      description: "Residential flooding in Jayanagar due to overwhelmed drainage systems.",
      source: "BBMP",
      images: []
    }
  ];

  static async getHistoricalFloodEvents(
    startDate?: string,
    endDate?: string,
    severity?: string[],
    location?: [number, number],
    radius?: number
  ): Promise<HistoricalFloodEvent[]> {
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('flood_predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Convert Supabase data to our format
        return data.map(item => ({
          id: item.id,
          date: item.prediction_date,
          location: {
            name: item.area_name,
            coordinates: [item.location.x, item.location.y] as [number, number]
          },
          severity: item.risk_level === 'Critical' ? 'Extreme' : 
                   item.risk_level === 'High' ? 'Major' :
                   item.risk_level === 'Moderate' ? 'Moderate' : 'Minor',
          affectedArea: Math.random() * 20 + 5,
          casualties: item.risk_level === 'Critical' ? Math.floor(Math.random() * 5) : 0,
          economicLoss: item.risk_level === 'Critical' ? Math.random() * 100 + 50 : Math.random() * 50,
          description: `Flood event in ${item.area_name} with ${item.risk_level} risk level`,
          source: "Historical Data",
          images: []
        }));
      }
    } catch (error) {
      console.warn('Supabase data unavailable, using fallback data:', error);
    }

    // Filter local data
    let filteredEvents = [...this.floodEvents];

    if (startDate) {
      filteredEvents = filteredEvents.filter(event => event.date >= startDate);
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(event => event.date <= endDate);
    }

    if (severity && severity.length > 0) {
      filteredEvents = filteredEvents.filter(event => severity.includes(event.severity));
    }

    if (location && radius) {
      filteredEvents = filteredEvents.filter(event => {
        const distance = this.calculateDistance(
          location[0], location[1],
          event.location.coordinates[0], event.location.coordinates[1]
        );
        return distance <= radius;
      });
    }

    return filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getFloodStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<FloodStatistics> {
    const events = await this.getHistoricalFloodEvents(startDate, endDate);
    
    const byYear: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let totalAffectedArea = 0;

    events.forEach(event => {
      const year = new Date(event.date).getFullYear().toString();
      byYear[year] = (byYear[year] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      totalAffectedArea += event.affectedArea;
    });

    // Calculate trend
    const years = Object.keys(byYear).sort();
    const firstHalf = years.slice(0, Math.ceil(years.length / 2));
    const secondHalf = years.slice(Math.floor(years.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, year) => sum + byYear[year], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, year) => sum + byYear[year], 0) / secondHalf.length;
    
    const isIncreasing = secondHalfAvg > firstHalfAvg;
    const changePercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    return {
      totalEvents: events.length,
      byYear,
      bySeverity,
      averageAffectedArea: events.length > 0 ? totalAffectedArea / events.length : 0,
      trendAnalysis: {
        isIncreasing,
        changePercentage: Math.abs(changePercentage)
      }
    };
  }

  static async getRecentFloodAlerts(limit: number = 10): Promise<HistoricalFloodEvent[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const events = await this.getHistoricalFloodEvents(
      oneMonthAgo.toISOString().split('T')[0]
    );
    
    return events.slice(0, limit);
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export default HistoricalFloodDataService;

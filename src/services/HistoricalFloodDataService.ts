
// Utility functions for formatting numbers and currency
export const formatNumber = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const formatCurrency = (value: number): string => {
  return `₹${formatNumber(value / 100000, 1)}L`;
};

// Historical flood data interface
interface FloodEvent {
  id: string;
  year: number;
  location: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  economicLoss: number; // in INR
  affectedPopulation: number;
  rainfall: number; // in mm
  duration: number; // in days
}

interface FloodAnalysis {
  averageSeverity: string;
  riskFactors: string[];
  recommendations: string[];
  trends: {
    increasingFrequency: boolean;
    changingPatterns: string[];
  };
}

interface FloodStatistics {
  totalEvents: number;
  totalEconomicLoss: number;
  averageAffectedPopulation: number;
  mostAffectedAreas: string[];
}

class HistoricalFloodDataService {
  private static instance: HistoricalFloodDataService;
  private floodEvents: FloodEvent[] = [];

  public static getInstance(): HistoricalFloodDataService {
    if (!HistoricalFloodDataService.instance) {
      HistoricalFloodDataService.instance = new HistoricalFloodDataService();
    }
    return HistoricalFloodDataService.instance;
  }

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Generate realistic historical flood data for Karnataka
    this.floodEvents = [
      {
        id: 'flood-2019-01',
        year: 2019,
        location: 'Bengaluru Urban',
        severity: 'Moderate',
        economicLoss: 45000000, // 45 Cr
        affectedPopulation: 120000,
        rainfall: 180.5,
        duration: 3
      },
      {
        id: 'flood-2020-01',
        year: 2020,
        location: 'Dakshina Kannada',
        severity: 'High',
        economicLoss: 78000000, // 78 Cr
        affectedPopulation: 85000,
        rainfall: 245.8,
        duration: 5
      },
      {
        id: 'flood-2021-01',
        year: 2021,
        location: 'Udupi',
        severity: 'Critical',
        economicLoss: 120000000, // 120 Cr
        affectedPopulation: 95000,
        rainfall: 298.3,
        duration: 7
      },
      {
        id: 'flood-2022-01',
        year: 2022,
        location: 'Bengaluru Urban',
        severity: 'High',
        economicLoss: 89000000, // 89 Cr
        affectedPopulation: 140000,
        rainfall: 220.7,
        duration: 4
      },
      {
        id: 'flood-2023-01',
        year: 2023,
        location: 'Hassan',
        severity: 'Moderate',
        economicLoss: 34000000, // 34 Cr
        affectedPopulation: 67000,
        rainfall: 165.2,
        duration: 2
      },
      {
        id: 'flood-2024-01',
        year: 2024,
        location: 'Bengaluru Urban',
        severity: 'High',
        economicLoss: 95000000, // 95 Cr
        affectedPopulation: 156000,
        rainfall: 234.1,
        duration: 6
      }
    ];
  }

  getHistoricalFloodData(): FloodEvent[] {
    return [...this.floodEvents];
  }

  getFloodAnalysis(): FloodAnalysis {
    const totalEvents = this.floodEvents.length;
    const criticalEvents = this.floodEvents.filter(e => e.severity === 'Critical').length;
    const highEvents = this.floodEvents.filter(e => e.severity === 'High').length;
    const moderateEvents = this.floodEvents.filter(e => e.severity === 'Moderate').length;
    
    // Calculate average severity
    const severityScore = (criticalEvents * 4 + highEvents * 3 + moderateEvents * 2) / totalEvents;
    let averageSeverity = 'Moderate';
    if (severityScore >= 3.5) averageSeverity = 'Critical';
    else if (severityScore >= 2.5) averageSeverity = 'High';

    return {
      averageSeverity,
      riskFactors: [
        'Urban encroachment on natural drainage systems',
        'Climate change leading to erratic rainfall patterns',
        'Poor waste management blocking storm drains',
        'Rapid urbanization reducing green cover',
        'Inadequate early warning systems'
      ],
      recommendations: [
        'Implement comprehensive urban drainage master plan',
        'Restore natural water bodies and wetlands',
        'Develop smart flood warning systems',
        'Enforce stricter building regulations in flood-prone areas',
        'Create community-based disaster preparedness programs'
      ],
      trends: {
        increasingFrequency: true,
        changingPatterns: [
          'Urban flooding becoming more frequent',
          'Flash floods increasing due to climate change',
          'Economic losses rising with urban development'
        ]
      }
    };
  }

  getFloodStatistics(): FloodStatistics {
    const totalEvents = this.floodEvents.length;
    const totalEconomicLoss = this.floodEvents.reduce((sum, event) => sum + event.economicLoss, 0);
    const totalAffectedPopulation = this.floodEvents.reduce((sum, event) => sum + event.affectedPopulation, 0);
    
    // Count occurrences by location
    const locationCounts: { [key: string]: number } = {};
    this.floodEvents.forEach(event => {
      locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
    });
    
    const mostAffectedAreas = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([location]) => location);

    return {
      totalEvents,
      totalEconomicLoss,
      averageAffectedPopulation: Math.round(totalAffectedPopulation / totalEvents),
      mostAffectedAreas
    };
  }

  generateTimeSeriesData() {
    const yearData: { [year: number]: { events: number; economicLoss: number } } = {};
    
    // Initialize years
    for (let year = 2019; year <= 2024; year++) {
      yearData[year] = { events: 0, economicLoss: 0 };
    }
    
    // Aggregate data by year
    this.floodEvents.forEach(event => {
      yearData[event.year].events++;
      yearData[event.year].economicLoss += event.economicLoss / 10000000; // Convert to Cr
    });
    
    return Object.entries(yearData).map(([year, data]) => ({
      year: year,
      events: data.events,
      economicLoss: formatNumber(data.economicLoss, 1)
    }));
  }

  getCurrentRainfall(lat: number, lng: number): number {
    // Simulate current rainfall based on location and season
    const baseRainfall = Math.random() * 15; // 0-15 mm/hr base
    
    // Add seasonal variation (assuming monsoon season)
    const seasonalFactor = Math.random() * 10; // 0-10 mm/hr additional
    
    return formatNumber(baseRainfall + seasonalFactor, 1);
  }

  getRainfallForecast(lat: number, lng: number): number {
    // Simulate 24-hour rainfall forecast
    const baseForecast = Math.random() * 25; // 0-25 mm
    
    // Add some variation based on current conditions
    const variationFactor = Math.random() * 15; // 0-15 mm additional
    
    return formatNumber(baseForecast + variationFactor, 1);
  }

  getFloodRiskPrediction(location: { lat: number; lng: number }): { risk_level: string; probability: number } {
    // Simple risk calculation based on historical data and current conditions
    let riskScore = 0;
    
    // Check if location is in a historically affected area (Bengaluru Urban)
    if (Math.abs(location.lat - 12.9716) < 0.1 && Math.abs(location.lng - 77.5946) < 0.1) {
      riskScore += 30; // Bengaluru Urban has higher risk
    }
    
    // Add random factors for current conditions
    riskScore += Math.random() * 40; // 0-40 points
    
    let risk_level: string;
    let probability: number;
    
    if (riskScore >= 50) {
      risk_level = 'Critical';
      probability = 0.8 + Math.random() * 0.2;
    } else if (riskScore >= 35) {
      risk_level = 'High';
      probability = 0.6 + Math.random() * 0.2;
    } else if (riskScore >= 20) {
      risk_level = 'Moderate';
      probability = 0.3 + Math.random() * 0.3;
    } else {
      risk_level = 'Low';
      probability = 0.1 + Math.random() * 0.2;
    }
    
    return {
      risk_level,
      probability: formatNumber(probability, 2)
    };
  }
}

export default HistoricalFloodDataService.getInstance();

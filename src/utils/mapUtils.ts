
import RealTimeWeatherService from '@/services/RealTimeWeatherService';
import { formatNumber, formatCurrency } from '@/services/HistoricalFloodDataService';

// Real-time weather data fetching
export const fetchRealTimeWeather = async (lat: number, lng: number) => {
  try {
    const weatherData = await RealTimeWeatherService.getCurrentWeather(lat, lng);
    return weatherData;
  } catch (error) {
    console.error('Error fetching real-time weather:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async (lat: number, lng: number) => {
  try {
    const weatherData = await RealTimeWeatherService.getCurrentWeather(lat, lng);
    return {
      list: [{
        dt: Date.now() / 1000,
        main: {
          temp: formatNumber(weatherData.current.temperature),
          feels_like: formatNumber(weatherData.current.temperature + 2),
          humidity: weatherData.current.humidity,
          pressure: weatherData.current.pressure
        },
        weather: [{
          main: weatherData.current.description.includes('rain') ? 'Rain' : 'Clear',
          description: weatherData.current.description
        }],
        wind: {
          speed: formatNumber(weatherData.current.windSpeed)
        },
        visibility: weatherData.current.visibility * 1000,
        pop: weatherData.forecast.next24Hours > 0 ? 0.8 : 0.2
      }]
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

// Generate heatmap data based on real flood risk
export const generateHeatmapData = (locations: any[]) => {
  return locations.map(location => ({
    lat: formatNumber(location.coordinates[0], 4),
    lng: formatNumber(location.coordinates[1], 4),
    intensity: formatNumber(location.details?.floodRiskValue || 0.5, 2)
  }));
};

// Updated interface for popup data
interface PopupData {
  floodRisk?: string;
  rainfall?: number;
  forecastRainfall?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  greenCover?: number;
  elevationData?: number;
  drainageScore?: number;
  alerts?: any[];
}

// Generate enhanced location popup with real-time data and better visibility
export const generateLocationPopup = (
  locationName: string, 
  coordinates: [number, number],
  data: PopupData
) => {
  const alertsHtml = data.alerts && data.alerts.length > 0 
    ? `<div class="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-xs">
        <strong>⚠️ Weather Alert:</strong> ${data.alerts[0].event}
       </div>`
    : '';

  return `
    <div class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl max-w-xs border border-gray-200 dark:border-gray-700">
      <h3 class="font-bold text-gray-900 dark:text-white mb-2 text-sm">${locationName}</h3>
      <div class="space-y-2 text-xs">
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-blue-50 dark:bg-blue-900/50 p-2 rounded border">
            <div class="font-medium text-blue-800 dark:text-blue-200">Flood Risk</div>
            <div class="text-lg font-bold ${
              data.floodRisk === 'Critical' ? 'text-red-700 dark:text-red-400' :
              data.floodRisk === 'High' ? 'text-orange-700 dark:text-orange-400' :
              data.floodRisk === 'Moderate' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'
            }">${data.floodRisk || 'Low'}</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 p-2 rounded border">
            <div class="font-medium text-gray-800 dark:text-gray-200">Elevation</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">${formatNumber(data.elevationData || 920, 0)}m</div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-600 pt-2">
          <div class="font-medium text-gray-800 dark:text-gray-200 mb-1">Live Weather</div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <div class="text-gray-700 dark:text-gray-300">🌡️ ${formatNumber(data.temperature || 26, 1)}°C</div>
            <div class="text-gray-700 dark:text-gray-300">💧 ${formatNumber(data.humidity || 65, 0)}%</div>
            <div class="text-gray-700 dark:text-gray-300">🌧️ ${formatNumber(data.rainfall || 0, 1)}mm</div>
            <div class="text-gray-700 dark:text-gray-300">💨 ${formatNumber(data.windSpeed || 5, 1)}m/s</div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-600 pt-2">
          <div class="font-medium text-gray-800 dark:text-gray-200 mb-1">Infrastructure</div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <div class="text-gray-700 dark:text-gray-300">🌳 Green: ${formatNumber(data.greenCover || 35, 0)}%</div>
            <div class="text-gray-700 dark:text-gray-300">🚰 Drainage: ${formatNumber(data.drainageScore || 75, 0)}/100</div>
          </div>
        </div>
        
        ${data.forecastRainfall && data.forecastRainfall > 0 ? `
          <div class="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div class="font-medium text-gray-800 dark:text-gray-200">24h Forecast</div>
            <div class="text-blue-700 dark:text-blue-300 font-bold">${formatNumber(data.forecastRainfall, 1)}mm expected</div>
          </div>
        ` : ''}
        
        ${alertsHtml}
        
        <div class="border-t border-gray-200 dark:border-gray-600 pt-2 text-xs text-gray-600 dark:text-gray-400">
          📍 ${formatNumber(coordinates[0], 4)}, ${formatNumber(coordinates[1], 4)}
        </div>
      </div>
    </div>
  `;
};

// Get realistic elevation data based on Bangalore's topology
export const getElevationForCoordinates = (lat: number, lng: number): number => {
  // Bangalore elevation ranges from 900-950m above sea level
  // Higher elevations in the south, lower in the north
  
  const baseElevation = 920; // Average Bangalore elevation
  
  // Simulate elevation based on known high/low areas
  const southFactor = (lat - 12.9) * 50; // Southern areas are higher
  const variability = Math.sin(lat * 100) * Math.cos(lng * 100) * 15; // Add realistic variation
  
  return formatNumber(Math.max(880, Math.min(970, baseElevation + southFactor + variability)), 0);
};

// Calculate drainage score based on elevation, proximity to water bodies, and urban development
export const getDrainageScoreForCoordinates = (lat: number, lng: number): number => {
  const elevation = getElevationForCoordinates(lat, lng);
  
  // Higher elevation = better natural drainage
  const elevationScore = ((elevation - 880) / 90) * 40; // 0-40 points
  
  // Distance from major lakes (closer = potentially worse drainage due to low elevation)
  const lakeProximityPenalty = calculateLakeProximityPenalty(lat, lng);
  
  // Urban development density (more development = worse drainage)
  const urbanDensityPenalty = calculateUrbanDensityPenalty(lat, lng);
  
  // Slope calculation (steeper = better drainage)
  const slopeBonus = calculateSlopeBonus(lat, lng);
  
  const totalScore = Math.max(0, Math.min(100, 
    elevationScore + slopeBonus - lakeProximityPenalty - urbanDensityPenalty + 30
  ));
  
  return formatNumber(totalScore, 0);
};

// Helper function to calculate lake proximity penalty
const calculateLakeProximityPenalty = (lat: number, lng: number): number => {
  const majorLakes = [
    [12.9373, 77.6402], // Bellandur
    [12.9417, 77.7341], // Varthur
    [13.0450, 77.5950], // Hebbal
    [12.9825, 77.6203], // Ulsoor
  ];
  
  let minDistance = Infinity;
  majorLakes.forEach(([lakeLat, lakeLng]) => {
    const distance = Math.sqrt(Math.pow(lat - lakeLat, 2) + Math.pow(lng - lakeLng, 2));
    minDistance = Math.min(minDistance, distance);
  });
  
  // Penalty increases as we get closer to lakes (within 2km)
  if (minDistance < 0.02) { // Within ~2km
    return formatNumber((0.02 - minDistance) * 500, 1); // Up to 10 points penalty
  }
  return 0;
};

// Helper function to calculate urban density penalty
const calculateUrbanDensityPenalty = (lat: number, lng: number): number => {
  // High-density areas in Bangalore
  const highDensityAreas = [
    [12.9716, 77.5946], // City center
    [12.9698, 77.7500], // Whitefield
    [12.9279, 77.5816], // Jayanagar
    [12.9352, 77.6245], // Koramangala
  ];
  
  let proximityPenalty = 0;
  highDensityAreas.forEach(([areaLat, areaLng]) => {
    const distance = Math.sqrt(Math.pow(lat - areaLat, 2) + Math.pow(lng - areaLng, 2));
    if (distance < 0.05) { // Within ~5km
      proximityPenalty += (0.05 - distance) * 200; // Up to 10 points penalty
    }
  });
  
  return formatNumber(Math.min(15, proximityPenalty), 1);
};

// Helper function to calculate slope bonus
const calculateSlopeBonus = (lat: number, lng: number): number => {
  // Simulate slope based on elevation changes in the area
  const elevation1 = getElevationForCoordinates(lat, lng);
  const elevation2 = getElevationForCoordinates(lat + 0.001, lng);
  const elevation3 = getElevationForCoordinates(lat, lng + 0.001);
  
  const slope = Math.abs(elevation1 - elevation2) + Math.abs(elevation1 - elevation3);
  return formatNumber(Math.min(15, slope * 0.5), 1); // Up to 15 points bonus
};

// Generate flood zone data for map overlays
export const generateFloodZoneGeoJSON = (center: [number, number], riskLevel: string) => {
  const [lat, lng] = center;
  const radius = riskLevel === 'Critical' ? 0.015 : 
                 riskLevel === 'High' ? 0.01 : 
                 riskLevel === 'Moderate' ? 0.007 : 0.005;

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [formatNumber(lng - radius, 4), formatNumber(lat - radius, 4)],
          [formatNumber(lng + radius, 4), formatNumber(lat - radius, 4)],
          [formatNumber(lng + radius, 4), formatNumber(lat + radius, 4)],
          [formatNumber(lng - radius, 4), formatNumber(lat + radius, 4)],
          [formatNumber(lng - radius, 4), formatNumber(lat - radius, 4)]
        ]]
      },
      properties: {
        riskLevel,
        fillColor: riskLevel === 'Critical' ? '#ef4444' :
                   riskLevel === 'High' ? '#f97316' :
                   riskLevel === 'Moderate' ? '#eab308' : '#10b981',
        fillOpacity: 0.3
      }
    }]
  };
};

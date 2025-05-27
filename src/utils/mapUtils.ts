
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

// Generate enhanced location popup with HIGH CONTRAST and better visibility
export const generateLocationPopup = (
  locationName: string, 
  coordinates: [number, number],
  data: PopupData
) => {
  const alertsHtml = data.alerts && data.alerts.length > 0 
    ? `<div class="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r">
        <div class="flex items-center">
          <span class="text-red-600 font-semibold">⚠️ Weather Alert</span>
        </div>
        <p class="text-red-800 text-sm mt-1">${data.alerts[0].event}</p>
       </div>`
    : '';

  return `
    <div class="bg-white border border-gray-800 rounded-lg shadow-2xl p-4 max-w-sm" style="font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div class="border-b border-gray-800 pb-2 mb-3">
        <h3 class="font-bold text-gray-900 text-base leading-tight">${locationName}</h3>
        <p class="text-xs text-gray-700 mt-1 font-medium">📍 ${formatNumber(coordinates[0], 4)}, ${formatNumber(coordinates[1], 4)}</p>
      </div>
      
      <div class="space-y-3">
        <!-- Flood Risk Section with HIGH CONTRAST -->
        <div class="bg-gray-900 rounded-lg p-3 border-2 border-gray-800">
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-white">Flood Risk Level</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold border-2 ${
              data.floodRisk === 'Critical' ? 'bg-red-500 text-white border-red-700' :
              data.floodRisk === 'High' ? 'bg-orange-500 text-white border-orange-700' :
              data.floodRisk === 'Moderate' ? 'bg-yellow-500 text-black border-yellow-700' : 
              'bg-green-500 text-white border-green-700'
            }">${data.floodRisk || 'Low'}</span>
          </div>
        </div>
        
        <!-- Location Data with HIGH CONTRAST -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-blue-800 border-2 border-blue-900 rounded p-2">
            <div class="text-xs text-blue-100 font-medium">Elevation</div>
            <div class="text-sm font-bold text-white">${formatNumber(data.elevationData || 920, 0)}m</div>
          </div>
          <div class="bg-cyan-800 border-2 border-cyan-900 rounded p-2">
            <div class="text-xs text-cyan-100 font-medium">Drainage</div>
            <div class="text-sm font-bold text-white">${formatNumber(data.drainageScore || 75, 0)}/100</div>
          </div>
        </div>
        
        <!-- Weather Info with HIGH CONTRAST -->
        <div class="bg-gray-800 border-2 border-gray-900 rounded-lg p-3">
          <div class="text-sm font-semibold text-white mb-2">Current Weather</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex items-center text-white">
              <span class="mr-1">🌡️</span>
              <span class="font-bold">${formatNumber(data.temperature || 26, 1)}°C</span>
            </div>
            <div class="flex items-center text-white">
              <span class="mr-1">💧</span>
              <span class="font-bold">${formatNumber(data.humidity || 65, 0)}%</span>
            </div>
            <div class="flex items-center text-white">
              <span class="mr-1">🌧️</span>
              <span class="font-bold">${formatNumber(data.rainfall || 0, 1)}mm</span>
            </div>
            <div class="flex items-center text-white">
              <span class="mr-1">💨</span>
              <span class="font-bold">${formatNumber(data.windSpeed || 5, 1)}m/s</span>
            </div>
          </div>
        </div>
        
        <!-- Environment with HIGH CONTRAST -->
        <div class="bg-green-800 border-2 border-green-900 rounded-lg p-3">
          <div class="text-sm font-semibold text-white mb-2">Environment</div>
          <div class="flex justify-between text-xs text-green-100">
            <span>🌳 Green Cover: <strong class="text-white">${formatNumber(data.greenCover || 35, 0)}%</strong></span>
          </div>
        </div>
        
        ${data.forecastRainfall && data.forecastRainfall > 0 ? `
          <div class="bg-blue-800 border-2 border-blue-900 rounded-lg p-3">
            <div class="text-sm font-semibold text-white">24h Forecast</div>
            <div class="text-blue-100 font-bold text-sm">${formatNumber(data.forecastRainfall, 1)}mm expected</div>
          </div>
        ` : ''}
        
        ${alertsHtml}
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

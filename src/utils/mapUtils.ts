
import RealTimeWeatherService from '@/services/RealTimeWeatherService';

// Generate enhanced location popup with real-time data
export const generateLocationPopup = (
  locationName: string, 
  coordinates: [number, number],
  data: {
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
) => {
  const alertsHtml = data.alerts && data.alerts.length > 0 
    ? `<div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
        <strong>⚠️ Weather Alert:</strong> ${data.alerts[0].event}
       </div>`
    : '';

  return `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
      <h3 class="font-bold text-gray-900 dark:text-white mb-2 text-sm">${locationName}</h3>
      <div class="space-y-2 text-xs">
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
            <div class="font-medium text-blue-700 dark:text-blue-300">Flood Risk</div>
            <div class="text-lg font-bold ${
              data.floodRisk === 'Critical' ? 'text-red-600' :
              data.floodRisk === 'High' ? 'text-orange-600' :
              data.floodRisk === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
            }">${data.floodRisk || 'Unknown'}</div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div class="font-medium text-gray-700 dark:text-gray-300">Elevation</div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">${(data.elevationData || 0).toFixed(0)}m</div>
          </div>
        </div>
        
        <div class="border-t pt-2">
          <div class="font-medium text-gray-700 dark:text-gray-300 mb-1">Live Weather</div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <div>🌡️ ${(data.temperature || 0).toFixed(1)}°C</div>
            <div>💧 ${(data.humidity || 0)}%</div>
            <div>🌧️ ${(data.rainfall || 0).toFixed(1)}mm</div>
            <div>💨 ${(data.windSpeed || 0).toFixed(1)}m/s</div>
          </div>
        </div>
        
        <div class="border-t pt-2">
          <div class="font-medium text-gray-700 dark:text-gray-300 mb-1">Infrastructure</div>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <div>🌳 Green: ${data.greenCover || 0}%</div>
            <div>🚰 Drainage: ${(data.drainageScore || 0).toFixed(0)}/100</div>
          </div>
        </div>
        
        ${data.forecastRainfall ? `
          <div class="border-t pt-2">
            <div class="font-medium text-gray-700 dark:text-gray-300">24h Forecast</div>
            <div class="text-blue-600 dark:text-blue-400 font-bold">${data.forecastRainfall.toFixed(1)}mm expected</div>
          </div>
        ` : ''}
        
        ${alertsHtml}
        
        <div class="border-t pt-2 text-xs text-gray-500 dark:text-gray-400">
          📍 ${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}
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
  
  return Math.max(880, Math.min(970, baseElevation + southFactor + variability));
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
  
  return totalScore;
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
    return (0.02 - minDistance) * 500; // Up to 10 points penalty
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
  
  return Math.min(15, proximityPenalty);
};

// Helper function to calculate slope bonus
const calculateSlopeBonus = (lat: number, lng: number): number => {
  // Simulate slope based on elevation changes in the area
  const elevation1 = getElevationForCoordinates(lat, lng);
  const elevation2 = getElevationForCoordinates(lat + 0.001, lng);
  const elevation3 = getElevationForCoordinates(lat, lng + 0.001);
  
  const slope = Math.abs(elevation1 - elevation2) + Math.abs(elevation1 - elevation3);
  return Math.min(15, slope * 0.5); // Up to 15 points bonus
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
          [lng - radius, lat - radius],
          [lng + radius, lat - radius],
          [lng + radius, lat + radius],
          [lng - radius, lat + radius],
          [lng - radius, lat - radius]
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

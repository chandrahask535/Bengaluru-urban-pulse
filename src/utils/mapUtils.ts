interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  details: {
    floodRisk: string;
    floodRiskValue: number;
    greenCoverage: number;
    infrastructureScore: number;
    landUseTypes: Array<{
      type: string;
      percentage: number;
    }>;
    issues: string[];
  };
}

// Function to generate heatmap data from locations based on flood risk
export function generateHeatmapData(
  locations: Location[]
): Array<{ lat: number; lng: number; intensity: number }> {
  // Generate base points from the locations
  const basePoints = locations.map(loc => ({
    lat: loc.coordinates[0],
    lng: loc.coordinates[1],
    intensity: loc.details.floodRiskValue / 100 // Normalize to 0-1
  }));

  // Add more points around high risk areas to create a more realistic heatmap
  const expandedPoints: Array<{ lat: number; lng: number; intensity: number }> = [];
  
  basePoints.forEach(point => {
    // Only expand points with higher intensity for performance reasons
    if (point.intensity > 0.4) {
      // Add the original point
      expandedPoints.push(point);
      
      // Add points around the original point to create a cluster effect
      const radius = 0.02; // About 2km
      const numPoints = Math.ceil(point.intensity * 10); // More points for higher intensity areas
      
      for (let i = 0; i < numPoints; i++) {
        // Random angle
        const angle = Math.random() * Math.PI * 2;
        // Random distance within the radius (concentrated toward the center)
        const distance = radius * Math.sqrt(Math.random()) * point.intensity;
        
        // Calculate new coordinates
        const newLat = point.lat + distance * Math.sin(angle);
        const newLng = point.lng + distance * Math.cos(angle);
        
        // Calculate new intensity (decreases with distance from center)
        const distanceFactor = 1 - (distance / radius);
        const newIntensity = point.intensity * distanceFactor * (0.5 + Math.random() * 0.5);
        
        expandedPoints.push({
          lat: newLat,
          lng: newLng,
          intensity: newIntensity
        });
      }
    } else {
      expandedPoints.push(point);
    }
  });

  return expandedPoints;
}

// Function to get severity color based on value
export function getSeverityColor(value: number, type: 'flood' | 'pollution' | 'traffic' = 'flood'): string {
  // Colors for flood risk
  if (type === 'flood') {
    if (value >= 75) return '#ef4444'; // red-500
    if (value >= 50) return '#f97316'; // orange-500
    if (value >= 25) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  }
  // Colors for pollution
  else if (type === 'pollution') {
    if (value >= 300) return '#7f1d1d'; // red-900
    if (value >= 200) return '#ef4444'; // red-500
    if (value >= 150) return '#f97316'; // orange-500
    if (value >= 100) return '#eab308'; // yellow-500
    if (value >= 50) return '#84cc16'; // lime-500
    return '#22c55e'; // green-500
  }
  // Colors for traffic congestion
  else {
    if (value >= 80) return '#ef4444'; // red-500
    if (value >= 60) return '#f97316'; // orange-500
    if (value >= 40) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  }
}

export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres
  return d;
}

export function getBoundingBox(
  lat: number, 
  lng: number, 
  radiusKm: number
): { sw: [number, number], ne: [number, number] } {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Convert latitude to radians
  const latRad = (lat * Math.PI) / 180;
  
  // Angular distance in radians
  const angDist = radiusKm / R;
  
  // Calculate min/max latitudes and longitudes
  const minLat = lat - (angDist * 180) / Math.PI;
  const maxLat = lat + (angDist * 180) / Math.PI;
  
  // Adjust for longitude distance which varies with latitude
  const maxLng = lng + ((angDist * 180) / Math.PI) / Math.cos(latRad);
  const minLng = lng - ((angDist * 180) / Math.PI) / Math.cos(latRad);
  
  return {
    sw: [minLat, minLng],
    ne: [maxLat, maxLng]
  };
}

// Function to generate rich location info popup content
export function generateLocationPopup(
  locationName: string,
  coordinates: [number, number],
  details: {
    floodRisk?: string;
    rainfall?: number;
    greenCover?: number;
    waterBodies?: number;
    urbanDensity?: number;
    elevationData?: number;
    drainageScore?: number;
  }
): string {
  let content = `
    <div class="p-3 max-w-xs">
      <h3 class="font-bold text-lg mb-1">${locationName}</h3>
      <p class="text-xs text-gray-500 mb-2">Coordinates: ${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}</p>
      <div class="space-y-2">
  `;

  if (details.floodRisk) {
    const riskColor = details.floodRisk.toLowerCase() === 'high' ? 'text-red-600' : 
                      details.floodRisk.toLowerCase() === 'moderate' ? 'text-orange-500' : 
                      details.floodRisk.toLowerCase() === 'low' ? 'text-green-600' : 'text-blue-600';
    
    content += `
      <div>
        <span class="text-sm font-medium">Flood Risk: </span>
        <span class="${riskColor} font-medium">${details.floodRisk}</span>
      </div>
    `;
  }

  if (details.rainfall !== undefined) {
    content += `
      <div>
        <span class="text-sm font-medium">Recent Rainfall: </span>
        <span>${details.rainfall.toFixed(1)} mm</span>
      </div>
    `;
  }

  if (details.greenCover !== undefined) {
    content += `
      <div>
        <span class="text-sm font-medium">Green Coverage: </span>
        <span>${details.greenCover.toFixed(1)}%</span>
      </div>
    `;
  }

  if (details.waterBodies !== undefined) {
    content += `
      <div>
        <span class="text-sm font-medium">Water Bodies: </span>
        <span>${details.waterBodies} nearby</span>
      </div>
    `;
  }

  if (details.urbanDensity !== undefined) {
    content += `
      <div>
        <span class="text-sm font-medium">Urban Density: </span>
        <span>${details.urbanDensity.toFixed(1)}%</span>
      </div>
    `;
  }

  if (details.elevationData !== undefined) {
    content += `
      <div>
        <span class="text-sm font-medium">Elevation: </span>
        <span>${details.elevationData.toFixed(1)}m</span>
      </div>
    `;
  }

  if (details.drainageScore !== undefined) {
    const drainageClass = details.drainageScore > 70 ? 'text-green-600' : 
                          details.drainageScore > 40 ? 'text-orange-500' : 'text-red-600';
    content += `
      <div>
        <span class="text-sm font-medium">Drainage Score: </span>
        <span class="${drainageClass}">${details.drainageScore}/100</span>
      </div>
    `;
  }

  content += `
      </div>
    </div>
  `;

  return content;
}

// Generate synthetic elevation data for Bengaluru region (until real data is available)
export function getElevationForCoordinates(lat: number, lng: number): number {
  // Base elevation for Bengaluru (around 920m)
  const baseElevation = 920;
  
  // Bengaluru central coordinates
  const blrCenterLat = 12.9716;
  const blrCenterLng = 77.5946;
  
  // Calculate distance from center
  const distance = calculateDistance(lat, lng, blrCenterLat, blrCenterLng) / 1000; // in km
  
  // Generate some variation - higher in north/northeastern areas, lower in south
  const latDiff = lat - blrCenterLat;
  const lngDiff = lng - blrCenterLng;
  
  // Northern areas tend to be higher
  const northFactor = latDiff * 15;
  
  // Eastern areas also tend to be slightly higher
  const eastFactor = lngDiff * 5;
  
  // Add some randomness to make it more natural
  const randomFactor = Math.sin(lat * 100) * Math.cos(lng * 100) * 10;
  
  // Calculate final elevation
  let elevation = baseElevation + northFactor + eastFactor + randomFactor;
  
  // Add some local peaks and valleys based on distance rings from center
  elevation += Math.sin(distance * 0.8) * 15;
  
  return elevation;
}

// Get drainage score for coordinates (synthetic data until real data is available)
export function getDrainageScoreForCoordinates(lat: number, lng: number): number {
  // Bengaluru central coordinates
  const blrCenterLat = 12.9716;
  const blrCenterLng = 77.5946;
  
  // Known problem areas (low drainage scores)
  const problemAreas = [
    { lat: 12.9783, lng: 77.6408, radius: 2, impact: -40 }, // Koramangala
    { lat: 12.9289, lng: 77.6851, radius: 3, impact: -50 }, // Bellandur
    { lat: 12.9592, lng: 77.7494, radius: 3, impact: -45 }, // Whitefield
    { lat: 12.9982, lng: 77.5865, radius: 2, impact: -35 }, // Ulsoor
    { lat: 13.0283, lng: 77.5603, radius: 2, impact: -25 }, // Hebbal
  ];
  
  // Base drainage score (higher in central areas, lower in outskirts)
  const distance = calculateDistance(lat, lng, blrCenterLat, blrCenterLng) / 1000;
  let baseScore = 75 - distance * 2; // Decreases with distance from center
  
  // Adjust for problem areas
  for (const area of problemAreas) {
    const areaDistance = calculateDistance(lat, lng, area.lat, area.lng) / 1000;
    if (areaDistance < area.radius) {
      // Apply impact based on proximity to problem area center
      const impactFactor = 1 - (areaDistance / area.radius);
      baseScore += area.impact * impactFactor;
    }
  }
  
  // Add some randomness (±10%)
  const randomFactor = (Math.random() * 20 - 10);
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, baseScore + randomFactor));
}

// Function to fetch real-time weather data from OpenWeatherMap
export async function fetchRealTimeWeather(lat: number, lng: number): Promise<any> {
  const apiKey = '8ad34abc3b5bd464821c93ba25ac9fd1'; // Default API key (replace with your own)
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching real-time weather:', error);
    throw error;
  }
}

// Function to fetch weather forecast from OpenWeatherMap
export async function fetchWeatherForecast(lat: number, lng: number): Promise<any> {
  const apiKey = '8ad34abc3b5bd464821c93ba25ac9fd1'; // Default API key (replace with your own)
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Weather forecast fetch failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

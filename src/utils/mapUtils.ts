
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

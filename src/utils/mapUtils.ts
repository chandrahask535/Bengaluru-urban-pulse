export const generateHeatmapData = (locations: any[]) => {
  return locations.map(location => ({
    lat: location.coordinates[0],
    lng: location.coordinates[1],
    intensity: location.details.floodRiskValue || 0.5
  }));
};

export const generateLocationPopup = (
  name: string, 
  coordinates: [number, number], 
  details: {
    floodRisk: string;
    rainfall?: number;
    forecastRainfall?: number;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    greenCover: number;
    elevationData: number;
    drainageScore: number;
    alerts?: any[];
  }
) => {
  return `
    <div style="background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 8px; border: 2px solid #333; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 250px;">
      <h3 style="color: #ffffff; font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${name}</h3>
      <div style="space-y: 4px;">
        <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Coordinates:</span> <strong style="color: #ffffff;">${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}</strong></p>
        <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Flood Risk:</span> <strong style="color: ${details.floodRisk === 'High' ? '#ff6666' : details.floodRisk === 'Moderate' ? '#ffaa66' : '#66ff66'};">${details.floodRisk}</strong></p>
        ${details.rainfall !== undefined ? `<p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Current Rainfall:</span> <strong style="color: #ffffff;">${details.rainfall.toFixed(1)} mm/hr</strong></p>` : ''}
        ${details.forecastRainfall !== undefined ? `<p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">24h Forecast:</span> <strong style="color: #ffffff;">${details.forecastRainfall.toFixed(1)} mm</strong></p>` : ''}
        ${details.temperature !== undefined ? `<p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Temperature:</span> <strong style="color: #ffffff;">${details.temperature.toFixed(1)}°C</strong></p>` : ''}
        ${details.humidity !== undefined ? `<p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Humidity:</span> <strong style="color: #ffffff;">${details.humidity}%</strong></p>` : ''}
        <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Green Coverage:</span> <strong style="color: #ffffff;">${details.greenCover}%</strong></p>
        <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Elevation:</span> <strong style="color: #ffffff;">${details.elevationData}m</strong></p>
        <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Drainage Score:</span> <strong style="color: #ffffff;">${details.drainageScore}/10</strong></p>
        ${details.alerts && details.alerts.length > 0 ? `<p style="margin: 4px 0; color: #ff6666;"><span style="color: #a0a0a0;">Alerts:</span> <strong>${details.alerts[0].event}</strong></p>` : ''}
      </div>
    </div>
  `;
};

export const getElevationForCoordinates = (lat: number, lng: number): number => {
  // Mock elevation data based on Bangalore's topography
  // Higher elevations in the north, lower in the south
  const baseElevation = 920; // Bangalore's average elevation
  const latFactor = (lat - 12.97) * 50; // Variation based on latitude
  const random = (Math.random() - 0.5) * 20; // Add some randomness
  return Math.round(baseElevation + latFactor + random);
};

export const getDrainageScoreForCoordinates = (lat: number, lng: number): number => {
  // Mock drainage score (1-10, where 10 is excellent drainage)
  const baseScore = 6;
  const urbanDensity = Math.random() * 2 - 1; // -1 to 1
  const elevationFactor = (getElevationForCoordinates(lat, lng) - 920) / 100; // Normalize elevation
  const score = baseScore + urbanDensity + elevationFactor;
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
};

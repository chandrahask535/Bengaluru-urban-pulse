
// API configuration with fallback values for development
export const API_KEYS = {
  MAPBOX_API_KEY: import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || 'pk.eyJ1IjoidXJiYW5wdWxzZSIsImEiOiJjbHpkZXh4eHgwMDAwMm1zOGY2eDJkY2M5In0.placeholder_token',
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '8ad34abc3b5bd464821c93ba25ac9fd1',
  NASA_API_KEY: import.meta.env.VITE_NASA_API_KEY || 'fQH61FjpO5Uaqh335VOCEVvEaqr1onrHtpPfA3eZ',
  BHUVAN_TOKEN: import.meta.env.VITE_BHUVAN_TOKEN || '21dee4e5f0d489d5108b8c68a4e0037edc310cff'
};

export const API_ENDPOINTS = {
  MAPBOX_GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  OPENWEATHER_BASE: 'https://api.openweathermap.org/data/2.5',
  NASA_EARTH: 'https://api.nasa.gov/planetary/earth',
  BHUVAN_BASE: 'https://bhuvan.nrsc.gov.in/api'
};

// Check if we're missing the Mapbox token
export const isMapboxConfigured = () => {
  return API_KEYS.MAPBOX_API_KEY !== 'pk.eyJ1IjoidXJiYW5wdWxzZSIsImEiOiJjbHpkZXh4eHgwMDAwMm1zOGY2eDJkY2M5In0.placeholder_token';
};

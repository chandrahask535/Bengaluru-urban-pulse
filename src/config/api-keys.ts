
// API Keys and Configuration

export const API_KEYS = {
  // Weather Data
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || "8ad34abc3b5bd464821c93ba25ac9fd1",
  
  // Maps and Geolocation
  MAPBOX_API_KEY: import.meta.env.VITE_MAPBOX_API_KEY || "pk.eyJ1IjoibG92YWJsZWxsYyIsImEiOiJjbHd1cTJvcDgxYWM5MnBtd3kxY2NrenU1In0.6OFAO96tqZVBEkw_JWbDQA",
  
  // Satellite Imagery
  NASA_EARTH_API_KEY: import.meta.env.VITE_NASA_EARTH_API_KEY || "fQH61FjpO5Uaqh335VOCEVvEaqr1onrHtpPfA3eZ",
  BHUVAN_API_KEY: import.meta.env.VITE_BHUVAN_API_KEY || "21dee4e5f0d489d5108b8c68a4e0037edc310cff",
};

// API Endpoints
export const API_ENDPOINTS = {
  WEATHER: import.meta.env.VITE_API_WEATHER_URL || "https://api.openweathermap.org/data/2.5",
  MAPBOX: import.meta.env.VITE_API_MAPBOX_URL || "https://api.mapbox.com",
  NASA_EARTH: import.meta.env.VITE_API_NASA_EARTH_URL || "https://api.nasa.gov/planetary/earth",
  BHUVAN: import.meta.env.VITE_API_BHUVAN_URL || "https://bhuvan.nrsc.gov.in/api",
  
  // New API endpoints for the additional Bhuvan services
  BHUVAN_LULC: "https://bhuvan.nrsc.gov.in/api/lulc",
  BHUVAN_LULC_STATISTICS: "https://bhuvan.nrsc.gov.in/api/lulc-statistics",
  BHUVAN_GEOCODING: "https://bhuvan.nrsc.gov.in/api/geocode",
  BHUVAN_GEOID: "https://bhuvan.nrsc.gov.in/api/geoid",
};

// Configuration
export const API_CONFIG = {
  WEATHER_UPDATE_INTERVAL: parseInt(import.meta.env.VITE_WEATHER_UPDATE_INTERVAL || '300000'),
  FLOOD_PREDICTION_INTERVAL: parseInt(import.meta.env.VITE_FLOOD_PREDICTION_INTERVAL || '900000'),
  LAKE_MONITORING_INTERVAL: parseInt(import.meta.env.VITE_LAKE_MONITORING_INTERVAL || '1800000'),
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRIES || '3'),
  TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000')
};

// API Keys and Configuration

export const API_KEYS = {
  // Weather Data
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
  
  // Maps and Geolocation
  MAPBOX_API_KEY: import.meta.env.VITE_MAPBOX_API_KEY,
  
  // Satellite Imagery
  NASA_EARTH_API_KEY: import.meta.env.VITE_NASA_EARTH_API_KEY,
  BHUVAN_API_KEY: import.meta.env.VITE_BHUVAN_API_KEY,
};

// API Endpoints
export const API_ENDPOINTS = {
  WEATHER: import.meta.env.VITE_API_WEATHER_URL,
  MAPBOX: import.meta.env.VITE_API_MAPBOX_URL,
  NASA_EARTH: import.meta.env.VITE_API_NASA_EARTH_URL,
  BHUVAN: import.meta.env.VITE_API_BHUVAN_URL,
};

// Configuration
export const API_CONFIG = {
  WEATHER_UPDATE_INTERVAL: parseInt(import.meta.env.VITE_WEATHER_UPDATE_INTERVAL || '300000'),
  FLOOD_PREDICTION_INTERVAL: parseInt(import.meta.env.VITE_FLOOD_PREDICTION_INTERVAL || '900000'),
  LAKE_MONITORING_INTERVAL: parseInt(import.meta.env.VITE_LAKE_MONITORING_INTERVAL || '1800000'),
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRIES || '3'),
  TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000')
};
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY: string;
  readonly VITE_MAPBOX_API_KEY: string;
  readonly VITE_NASA_EARTH_API_KEY: string;
  readonly VITE_BHUVAN_API_KEY: string;

  readonly VITE_API_WEATHER_URL: string;
  readonly VITE_API_MAPBOX_URL: string;
  readonly VITE_API_NASA_EARTH_URL: string;
  readonly VITE_API_BHUVAN_URL: string;

  readonly VITE_WEATHER_UPDATE_INTERVAL: string;
  readonly VITE_FLOOD_PREDICTION_INTERVAL: string;
  readonly VITE_LAKE_MONITORING_INTERVAL: string;
  readonly VITE_MAX_RETRIES: string;
  readonly VITE_REQUEST_TIMEOUT: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
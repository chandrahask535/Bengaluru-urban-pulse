
import { API_KEYS, API_ENDPOINTS } from '@/config/api-keys';

export interface GeocodeResult {
  id: string;
  name: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: Record<string, any>;
}

export interface GeocodeResponse {
  features: GeocodeResult[];
  type: string;
  query: string[];
}

export const MapBoxService = {
  /**
   * Geocode a place name to coordinates
   * @param place Place name to geocode
   * @returns Promise with geocoding results
   */
  geocodePlace: async (place: string): Promise<GeocodeResponse> => {
    try {
      const url = `${API_ENDPOINTS.MAPBOX_GEOCODING}/${encodeURIComponent(place)}.json`;
      const params = new URLSearchParams({
        access_token: API_KEYS.MAPBOX_API_KEY,
        limit: '5',
        types: 'place,locality,neighborhood'
      });
      
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error geocoding place:', error);
      // Return fallback data for Bangalore area
      return {
        features: [{
          id: 'fallback',
          name: place,
          place_name: `${place}, Bangalore, Karnataka, India`,
          center: [77.5946, 12.9716],
          geometry: {
            type: 'Point',
            coordinates: [77.5946, 12.9716]
          },
          properties: {}
        }],
        type: 'FeatureCollection',
        query: [place]
      };
    }
  },
  
  /**
   * Reverse geocode coordinates to place information
   * @param lng Longitude
   * @param lat Latitude
   * @returns Promise with reverse geocoding results
   */
  reverseGeocode: async (lng: number, lat: number): Promise<GeocodeResponse> => {
    try {
      const url = `${API_ENDPOINTS.MAPBOX_GEOCODING}/${lng},${lat}.json`;
      const params = new URLSearchParams({
        access_token: API_KEYS.MAPBOX_API_KEY,
        limit: '1'
      });
      
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Return fallback data
      return {
        features: [{
          id: 'fallback',
          name: 'Unknown Location',
          place_name: `Unknown Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          center: [lng, lat],
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {}
        }],
        type: 'FeatureCollection',
        query: [lng.toString(), lat.toString()]
      };
    }
  }
};

export default MapBoxService;

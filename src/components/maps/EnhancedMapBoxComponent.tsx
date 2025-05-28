
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_KEYS } from '@/config/api-keys';

interface EnhancedMapBoxComponentProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    color?: string;
  }>;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  className?: string;
  showTraffic?: boolean;
  showBuildings?: boolean;
  showTerrain?: boolean;
  showRainLayer?: boolean;
  showUrbanZones?: boolean;
  showFloodZones?: boolean;
  heatmapData?: Array<{ lat: number; lng: number; intensity?: number }>;
}

const EnhancedMapBoxComponent = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  className = 'h-[400px] w-full rounded-lg',
  showTraffic = false,
  showBuildings = false,
  showTerrain = false,
  showRainLayer = false,
  showUrbanZones = false,
  showFloodZones = false,
  heatmapData = [],
}: EnhancedMapBoxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Set Mapbox access token
    mapboxgl.accessToken = API_KEYS.MAPBOX_API_KEY;
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center[1], center[0]], // MapBox uses [lng, lat] order
      zoom: zoom,
      pitch: showBuildings ? 45 : 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add click handler
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    map.current.on('load', () => {
      setMapLoaded(true);
      
      const mapInstance = map.current;
      if (!mapInstance) return;

      // Add heatmap if data is provided
      if (heatmapData.length > 0) {
        const geojsonData = {
          type: 'FeatureCollection',
          features: heatmapData.map(point => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lng, point.lat]
            },
            properties: {
              intensity: point.intensity || 1
            }
          }))
        };

        mapInstance.addSource('heatmap-data', {
          type: 'geojson',
          data: geojsonData as any
        });

        mapInstance.addLayer({
          id: 'heatmap-layer',
          type: 'heatmap',
          source: 'heatmap-data',
          paint: {
            'heatmap-weight': [
              'interpolate', ['linear'], ['get', 'intensity'],
              0, 0,
              1, 1
            ],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.2, 'rgb(0,0,255)',
              0.4, 'rgb(0,255,255)',
              0.6, 'rgb(0,255,0)',
              0.8, 'rgb(255,255,0)',
              1, 'rgb(255,0,0)'
            ],
            'heatmap-radius': 20,
            'heatmap-opacity': 0.7
          }
        });
      }

      // Add flood zones if requested
      if (showFloodZones) {
        const floodZonesGeoJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'High Risk Zone',
                risk: 'High'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.02, center[0] - 0.01],
                  [center[1] + 0.02, center[0] - 0.01],
                  [center[1] + 0.02, center[0] + 0.01],
                  [center[1] - 0.02, center[0] + 0.01],
                  [center[1] - 0.02, center[0] - 0.01]
                ]]
              }
            }
          ]
        };
        
        mapInstance.addSource('flood-zones', {
          type: 'geojson',
          data: floodZonesGeoJSON as any
        });
        
        mapInstance.addLayer({
          id: 'flood-zones-fill',
          type: 'fill',
          source: 'flood-zones',
          paint: {
            'fill-color': '#ff4444',
            'fill-opacity': 0.4
          }
        });
      }

      // Add urban zones if requested
      if (showUrbanZones) {
        const urbanZonesGeoJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Urban Zone',
                type: 'Residential'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.03, center[0] - 0.02],
                  [center[1] + 0.03, center[0] - 0.02],
                  [center[1] + 0.03, center[0] + 0.02],
                  [center[1] - 0.03, center[0] + 0.02],
                  [center[1] - 0.03, center[0] - 0.02]
                ]]
              }
            }
          ]
        };
        
        mapInstance.addSource('urban-zones', {
          type: 'geojson',
          data: urbanZonesGeoJSON as any
        });
        
        mapInstance.addLayer({
          id: 'urban-zones-fill',
          type: 'fill',
          source: 'urban-zones',
          paint: {
            'fill-color': '#82ca9d',
            'fill-opacity': 0.5
          }
        });
      }

      // Add rain layer if requested
      if (showRainLayer) {
        mapInstance.addLayer({
          id: 'rainfall',
          type: 'raster',
          source: {
            type: 'raster',
            tiles: [
              `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEYS.OPENWEATHER_API_KEY}`
            ],
            tileSize: 256
          },
          paint: {
            'raster-opacity': 0.6
          }
        });
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapLoaded) return;

    // Clear existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add new markers
    markers.forEach(({ position, popup, color }) => {
      let markerElement;
      if (color) {
        markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = color;
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
      }
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([position[1], position[0]])
        .addTo(mapInstance);
      
      if (popup) {
        marker.setPopup(new mapboxgl.Popup().setHTML(popup));
      }
      
      markerRefs.current.push(marker);
    });
  }, [markers, mapLoaded]);

  // Update center and zoom
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter([center[1], center[0]]);
    map.current.setZoom(zoom);
  }, [center, zoom]);

  return <div ref={mapContainer} className={className} />;
};

export default EnhancedMapBoxComponent;

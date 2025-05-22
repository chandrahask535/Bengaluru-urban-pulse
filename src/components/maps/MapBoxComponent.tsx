
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_KEYS } from '@/config/api-keys';

interface MapBoxComponentProps {
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
  style?: string;
  showHeatmap?: boolean;
  heatmapData?: Array<{ lat: number; lng: number; intensity?: number }>;
  showRainLayer?: boolean;
  isInteractive?: boolean;
}

const MapBoxComponent = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  className = 'h-[400px] w-full rounded-lg',
  showTraffic = false,
  showBuildings = false,
  showTerrain = false,
  style = 'mapbox://styles/mapbox/streets-v11',
  showHeatmap = false,
  heatmapData = [],
  showRainLayer = false,
  isInteractive = true,
}: MapBoxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Initialize map with the public token
    mapboxgl.accessToken = API_KEYS.MAPBOX_API_KEY;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [center[1], center[0]], // MapBox uses [lng, lat] order
      zoom: zoom,
      interactive: isInteractive,
    });

    // Add navigation controls if interactive
    if (isInteractive) {
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );
    }

    // Add fullscreen control
    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    // Add geolocate control
    if (isInteractive) {
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );
    }

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }),
      'bottom-left'
    );

    // Add click handler
    if (onMapClick && isInteractive) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    map.current.on('load', () => {
      setMapLoaded(true);
      
      const mapInstance = map.current;
      if (!mapInstance) return;

      // Add 3D buildings layer if requested
      if (showBuildings) {
        // Check if the map style has the 3D building layer
        if (!mapInstance.getLayer('3d-buildings')) {
          mapInstance.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 13,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                16, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          });
        }
      }

      // Add terrain if requested
      if (showTerrain) {
        mapInstance.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
        
        mapInstance.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      }

      // Add traffic layer if requested
      if (showTraffic) {
        mapInstance.addLayer({
          'id': 'traffic',
          'type': 'line',
          'source': {
            'type': 'vector',
            'url': 'mapbox://mapbox.mapbox-traffic-v1'
          },
          'source-layer': 'traffic',
          'paint': {
            'line-width': 2,
            'line-color': [
              'case',
              ['==', ['get', 'congestion'], 'low'], '#4CAF50',
              ['==', ['get', 'congestion'], 'moderate'], '#FFEB3B',
              ['==', ['get', 'congestion'], 'heavy'], '#FF9800',
              ['==', ['get', 'congestion'], 'severe'], '#F44336',
              '#000000'
            ]
          }
        });
      }

      // Add heatmap if requested
      if (showHeatmap && heatmapData.length > 0) {
        // Convert data to GeoJSON format
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

        // Add the GeoJSON source
        mapInstance.addSource('heatmap-data', {
          type: 'geojson',
          data: geojsonData as any
        });

        // Add the heatmap layer
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
            'heatmap-radius': 15,
            'heatmap-opacity': 0.8
          }
        });
      }

      // Add rain layer if requested (radar visualization)
      if (showRainLayer) {
        mapInstance.addLayer({
          'id': 'rainfall',
          'type': 'raster',
          'source': {
            'type': 'raster',
            'tiles': [
              // Replace with your actual rainfall data tile URL
              // This is a placeholder - in a real implementation, you'd use weather API tiles
              'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + API_KEYS.OPENWEATHER_API_KEY
            ],
            'tileSize': 256
          },
          'paint': {
            'raster-opacity': 0.8
          }
        });
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [style, showBuildings, showTerrain, showTraffic, showHeatmap, showRainLayer]);

  // Update markers when they change
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !mapLoaded) return;

    // Clear existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add new markers
    markers.forEach(({ position, popup, color }) => {
      // Create a custom marker element if color is specified
      let markerElement;
      if (color) {
        markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = color;
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 0 2px rgba(0,0,0,0.5)';
      }
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([position[1], position[0]])  // MapBox uses [lng, lat] order
        .addTo(mapInstance);
      
      if (popup) {
        marker.setPopup(new mapboxgl.Popup().setHTML(popup));
      }
      
      markerRefs.current.push(marker);
    });
  }, [markers, mapLoaded]);

  // Update center and zoom when they change
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter([center[1], center[0]]);
    map.current.setZoom(zoom);
  }, [center, zoom]);

  return <div ref={mapContainer} className={className} />;
};

export default MapBoxComponent;

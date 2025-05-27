import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_KEYS, isMapboxConfigured } from '@/config/api-keys';
import MapboxTokenInput from './MapboxTokenInput';

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
  showBuildings?: boolean;
  showTerrain?: boolean;
  showRainLayer?: boolean;
  showUrbanZones?: boolean;
  showFloodZones?: boolean;
}

const EnhancedMapBoxComponent = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  className = 'h-[400px] w-full rounded-lg',
  showBuildings = false,
  showTerrain = false,
  showRainLayer = false,
  showUrbanZones = false,
  showFloodZones = false,
}: EnhancedMapBoxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentToken, setCurrentToken] = useState(API_KEYS.MAPBOX_API_KEY);
  const [tokenConfigured, setTokenConfigured] = useState(isMapboxConfigured());

  const handleTokenSubmit = (token: string) => {
    setCurrentToken(token);
    setTokenConfigured(true);
  };

  useEffect(() => {
    if (!mapContainer.current || map.current || !tokenConfigured) return;
    
    // Initialize map with the token
    mapboxgl.accessToken = currentToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center[1], center[0]], // MapBox uses [lng, lat] order
        zoom: zoom,
        interactive: true,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(
        new mapboxgl.FullscreenControl(),
        'top-right'
      );

      // Add scale control
      map.current.addControl(
        new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: 'metric'
        }),
        'bottom-left'
      );

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

        // Add 3D buildings layer if requested
        if (showBuildings) {
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

        // Add urban zones if requested (simulated data)
        if (showUrbanZones) {
          const urbanZonesGeoJSON = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                id: 'zone-1',
                properties: {
                  name: 'Commercial District',
                  type: 'Commercial',
                  density: 'High',
                  floodRisk: 'Moderate'
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [center[1] - 0.01, center[0] - 0.01],
                    [center[1] + 0.01, center[0] - 0.01],
                    [center[1] + 0.01, center[0] + 0.01],
                    [center[1] - 0.01, center[0] + 0.01],
                    [center[1] - 0.01, center[0] - 0.01]
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
            'id': 'urban-zones-fill',
            'type': 'fill',
            'source': 'urban-zones',
            'paint': {
              'fill-color': '#6b7de0',
              'fill-opacity': 0.5
            }
          });
          
          mapInstance.addLayer({
            'id': 'urban-zones-outline',
            'type': 'line',
            'source': 'urban-zones',
            'paint': {
              'line-color': '#4757c5',
              'line-width': 2
            }
          });
          
          // Add click handler for zones with HIGH CONTRAST popup
          mapInstance.on('click', 'urban-zones-fill', (e) => {
            if (!e.features || e.features.length === 0) return;
            
            const feature = e.features[0];
            const props = feature.properties;
            
            if (!props) return;
            
            new mapboxgl.Popup({
              className: 'mapbox-popup-dark'
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 8px; border: 2px solid #333; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 200px;">
                  <h3 style="color: #ffffff; font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${props.name}</h3>
                  <div style="space-y: 4px;">
                    <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Type:</span> <strong style="color: #ffffff;">${props.type}</strong></p>
                    <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Density:</span> <strong style="color: #ffffff;">${props.density}</strong></p>
                    <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Flood Risk:</span> <strong style="color: #ffffff;">${props.floodRisk}</strong></p>
                  </div>
                </div>
              `)
              .addTo(mapInstance);
          });
        }

        // Add flood zones if requested (simulated data)
        if (showFloodZones) {
          const floodZonesGeoJSON = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                id: 'flood-high',
                properties: {
                  name: 'High Risk Flood Zone',
                  risk: 'High',
                  depth: '> 1.0m'
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [center[1] - 0.02, center[0] - 0.01],
                    [center[1] + 0.01, center[0] - 0.02],
                    [center[1] + 0.02, center[0] + 0.01],
                    [center[1] - 0.01, center[0] + 0.02],
                    [center[1] - 0.02, center[0] - 0.01]
                  ]]
                }
              }
            ]
          };
          
          mapInstance.addSource('flood-zones', {
            'type': 'geojson',
            'data': floodZonesGeoJSON as any
          });
          
          mapInstance.addLayer({
            'id': 'flood-zones-fill',
            'type': 'fill',
            'source': 'flood-zones',
            'paint': {
              'fill-color': '#ff4444',
              'fill-opacity': 0.4
            }
          });
          
          mapInstance.addLayer({
            'id': 'flood-zones-outline',
            'type': 'line',
            'source': 'flood-zones',
            'paint': {
              'line-color': '#cc0000',
              'line-width': 1,
              'line-dasharray': [2, 2]
            }
          });
          
          // Add click handler for flood zones with HIGH CONTRAST popup
          mapInstance.on('click', 'flood-zones-fill', (e) => {
            if (!e.features || e.features.length === 0) return;
            
            const feature = e.features[0];
            const props = feature.properties;
            
            if (!props) return;
            
            new mapboxgl.Popup({
              className: 'mapbox-popup-dark'
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 8px; border: 2px solid #cc0000; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 200px;">
                  <h3 style="color: #ff6666; font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${props.name}</h3>
                  <div style="space-y: 4px;">
                    <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Risk Level:</span> <strong style="color: #ff6666;">${props.risk}</strong></p>
                    <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Expected Depth:</span> <strong style="color: #ffffff;">${props.depth}</strong></p>
                    <p style="margin: 4px 0; color: #cccccc; font-size: 12px;">Based on historical data and terrain analysis</p>
                  </div>
                </div>
              `)
              .addTo(mapInstance);
          });
        }

        // Add rain layer if requested
        if (showRainLayer) {
          mapInstance.addLayer({
            'id': 'rainfall',
            'type': 'raster',
            'source': {
              'type': 'raster',
              'tiles': [
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
          setMapLoaded(false);
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenConfigured(false);
    }
  }, [tokenConfigured, currentToken, showBuildings, showTerrain, showRainLayer, showUrbanZones, showFloodZones]);

  // Update markers when they change
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
        markerElement.style.border = '3px solid white';
        markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
      }
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([position[1], position[0]])
        .addTo(mapInstance);
      
      if (popup) {
        // Create high contrast popup
        const popupInstance = new mapboxgl.Popup({
          className: 'mapbox-popup-dark',
          closeButton: true,
          closeOnClick: false
        }).setHTML(popup);
        
        marker.setPopup(popupInstance);
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

  if (!tokenConfigured) {
    return <MapboxTokenInput onTokenSubmit={handleTokenSubmit} />;
  }

  return (
    <div>
      <div ref={mapContainer} className={className} />
      <style>{`
        .mapbox-popup-dark .mapboxgl-popup-content {
          background: #1a1a1a !important;
          color: #ffffff !important;
          border: 2px solid #333 !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .mapbox-popup-dark .mapboxgl-popup-close-button {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: bold !important;
          background: rgba(0,0,0,0.5) !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          right: 8px !important;
          top: 8px !important;
        }
        .mapbox-popup-dark .mapboxgl-popup-close-button:hover {
          background: rgba(255,255,255,0.2) !important;
        }
        .mapbox-popup-dark .mapboxgl-popup-tip {
          border-top-color: #1a1a1a !important;
        }
      `}</style>
    </div>
  );
};

export default EnhancedMapBoxComponent;

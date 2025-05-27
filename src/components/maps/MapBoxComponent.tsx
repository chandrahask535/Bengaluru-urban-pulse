import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_KEYS, isMapboxConfigured } from '@/config/api-keys';
import MapboxTokenInput from './MapboxTokenInput';

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
  showWaterBodies?: boolean;
  showUrbanZones?: boolean;
  enableLocateControl?: boolean;
  showFloodZones?: boolean;
  enableHover?: boolean;
  onHover?: (feature: any) => void;
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
  style = 'mapbox://styles/mapbox/streets-v12',
  showHeatmap = false,
  heatmapData = [],
  showRainLayer = false,
  isInteractive = true,
  showWaterBodies = false,
  showUrbanZones = false,
  enableLocateControl = false,
  showFloodZones = false,
  enableHover = false,
  onHover,
}: MapBoxComponentProps & { enableHover?: boolean; onHover?: (feature: any) => void }) => {
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
    
    // Initialize map with the public token
    mapboxgl.accessToken = currentToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: [center[1], center[0]], // MapBox uses [lng, lat] order
        zoom: zoom,
        interactive: isInteractive,
        pitch: showBuildings ? 45 : 0, // Add a 45-degree pitch when showing buildings
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
      if (isInteractive && enableLocateControl) {
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

      // Add hover handler
      if (enableHover && onHover) {
        map.current.on('mousemove', (e) => {
          const features = map.current?.queryRenderedFeatures(e.point);
          if (features && features.length > 0) {
            onHover(features[0]);
          }
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
                'fill-extrusion-color': [
                  'interpolate', ['linear'], ['get', 'height'],
                  0, '#aaa',
                  50, '#999',
                  100, '#888',
                  200, '#777'
                ],
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

        // Add water bodies layer for better water visualization
        if (showWaterBodies) {
          mapInstance.addLayer({
            'id': 'water-bodies-fill',
            'type': 'fill',
            'source': {
              'type': 'vector',
              'url': 'mapbox://mapbox.mapbox-streets-v8'
            },
            'source-layer': 'water',
            'paint': {
              'fill-color': [
                'match',
                ['get', 'class'],
                'lake', '#b3d1ff',
                'river', '#b3d1ff',
                'stream', '#b3d1ff',
                'canal', '#b3d1ff',
                '#b3d1ff'
              ],
              'fill-opacity': 0.8
            }
          });
          
          mapInstance.addLayer({
            'id': 'water-bodies-line',
            'type': 'line',
            'source': {
              'type': 'vector',
              'url': 'mapbox://mapbox.mapbox-streets-v8'
            },
            'source-layer': 'water',
            'paint': {
              'line-color': '#4d88ff',
              'line-width': 1
            }
          });
          
          // Add click interaction for water bodies with HIGH CONTRAST popup
          mapInstance.on('click', 'water-bodies-fill', (e) => {
            if (!e.features || e.features.length === 0) return;
            
            const features = e.features;
            const waterFeature = features[0];
            const properties = waterFeature.properties;
            
            new mapboxgl.Popup({
              className: 'mapbox-popup-dark'
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 8px; border: 2px solid #4d88ff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 200px;">
                  <h3 style="color: #66b3ff; font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${properties?.name || 'Water Body'}</h3>
                  <p style="margin: 4px 0; color: #e5e5e5;"><span style="color: #a0a0a0;">Type:</span> <strong style="color: #ffffff;">${properties?.class || 'Unknown'}</strong></p>
                  <p style="margin: 4px 0; color: #cccccc; font-size: 12px;">Click to view more details</p>
                </div>
              `)
              .addTo(mapInstance);
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

          // Check if source exists and update it, or add a new one
          if (mapInstance.getSource('heatmap-data')) {
            (mapInstance.getSource('heatmap-data') as mapboxgl.GeoJSONSource).setData(geojsonData as any);
          } else {
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
        }

        // Add rain layer if requested (radar visualization)
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
  }, [tokenConfigured, currentToken, style, showBuildings, showTerrain, showTraffic, showHeatmap, showRainLayer, showWaterBodies]);

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
        markerElement.style.border = '3px solid white';
        markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
      }
      
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([position[1], position[0]])  // MapBox uses [lng, lat] order
        .addTo(mapInstance);
      
      if (popup) {
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

export default MapBoxComponent;

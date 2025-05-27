
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
  style = 'mapbox://styles/mapbox/streets-v11',
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
}: MapBoxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | number | null>(null);

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
      const handleHover = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
        const mapInstance = map.current;
        if (!mapInstance) return;
        
        // Get features at point
        const features = mapInstance.queryRenderedFeatures(e.point);
        
        if (features.length > 0) {
          const feature = features[0];
          
          // Set hover state
          if (hoveredFeatureId !== feature.id) {
            // Reset previous hover state
            if (hoveredFeatureId) {
              mapInstance.setFeatureState(
                { source: 'urban-zones', id: hoveredFeatureId },
                { hover: false }
              );
            }
            
            // Set new hover state
            if (feature.source === 'urban-zones') {
              setHoveredFeatureId(feature.id);
              mapInstance.setFeatureState(
                { source: 'urban-zones', id: feature.id },
                { hover: true }
              );
            }
            
            // Call hover callback
            onHover(feature);
          }
        }
      };
      
      map.current.on('mousemove', handleHover);
      
      // Clean up hover state on mouseout
      map.current.on('mouseleave', () => {
        const mapInstance = map.current;
        if (!mapInstance || !hoveredFeatureId) return;
        
        mapInstance.setFeatureState(
          { source: 'urban-zones', id: hoveredFeatureId },
          { hover: false }
        );
        
        setHoveredFeatureId(null);
        onHover(null);
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
        
        // Add legend explanation
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'traffic-legend-popup'
        });
        
        mapInstance.on('mouseenter', 'traffic', (e) => {
          const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['traffic'] });
          
          if (features.length > 0) {
            const congestion = features[0].properties?.congestion || 'Unknown';
            const roadName = features[0].properties?.name || 'Road';
            
            popup.setLngLat(e.lngLat)
              .setHTML(`<strong>${roadName}</strong><br>Traffic: ${congestion}`)
              .addTo(mapInstance);
          }
        });
        
        mapInstance.on('mouseleave', 'traffic', () => {
          popup.remove();
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
        
        // Add hover interaction for water bodies
        mapInstance.on('mouseenter', 'water-bodies-fill', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        
        mapInstance.on('mouseleave', 'water-bodies-fill', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
        
        mapInstance.on('click', 'water-bodies-fill', (e) => {
          const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['water-bodies-fill'] });
          
          if (features.length > 0) {
            const waterFeature = features[0];
            const properties = waterFeature.properties;
            
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold">${properties?.name || 'Water Body'}</h3>
                  <p class="text-sm">Type: ${properties?.class || 'Unknown'}</p>
                </div>
              `)
              .addTo(mapInstance);
          }
        });
      }

      // Add urban zones - simulated data
      if (showUrbanZones) {
        // Simulated urban zones GeoJSON
        const urbanZonesGeoJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: 'central-business-district',
              properties: {
                name: 'Central Business District',
                density: 'High',
                type: 'Commercial',
                floodRisk: 'Moderate'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.02, center[0] - 0.02],
                  [center[1] + 0.02, center[0] - 0.02],
                  [center[1] + 0.02, center[0] + 0.02],
                  [center[1] - 0.02, center[0] + 0.02],
                  [center[1] - 0.02, center[0] - 0.02]
                ]]
              }
            },
            {
              type: 'Feature',
              id: 'residential-zone',
              properties: {
                name: 'Residential Zone',
                density: 'Medium',
                type: 'Residential',
                floodRisk: 'Low'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.04, center[0] - 0.04],
                  [center[1] + 0.04, center[0] - 0.04],
                  [center[1] + 0.04, center[0] - 0.02],
                  [center[1] - 0.04, center[0] - 0.02],
                  [center[1] - 0.04, center[0] - 0.04]
                ]]
              }
            },
            {
              type: 'Feature',
              id: 'industrial-zone',
              properties: {
                name: 'Industrial Zone',
                density: 'Medium',
                type: 'Industrial',
                floodRisk: 'High'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] + 0.03, center[0] + 0.03],
                  [center[1] + 0.06, center[0] + 0.03],
                  [center[1] + 0.06, center[0] + 0.06],
                  [center[1] + 0.03, center[0] + 0.06],
                  [center[1] + 0.03, center[0] + 0.03]
                ]]
              }
            }
          ]
        };
        
        // Add urban zones source and layers
        mapInstance.addSource('urban-zones', {
          type: 'geojson',
          data: urbanZonesGeoJSON as any
        });
        
        mapInstance.addLayer({
          'id': 'urban-zones-fill',
          'type': 'fill',
          'source': 'urban-zones',
          'paint': {
            'fill-color': [
              'match',
              ['get', 'type'],
              'Commercial', '#6b7de0',
              'Residential', '#82ca9d',
              'Industrial', '#e87979',
              '#aaaaaa'
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8,
              0.5
            ]
          }
        });
        
        mapInstance.addLayer({
          'id': 'urban-zones-outline',
          'type': 'line',
          'source': 'urban-zones',
          'paint': {
            'line-color': [
              'match',
              ['get', 'type'],
              'Commercial', '#4757c5',
              'Residential', '#3da066',
              'Industrial', '#c64444',
              '#666666'
            ],
            'line-width': 2
          }
        });
        
        // Add click handler for urban zones
        mapInstance.on('click', 'urban-zones-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const props = feature.properties;
          
          if (!props) return;
          
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-lg">${props.name}</h3>
                <div class="mt-2 space-y-1">
                  <p><span class="font-medium">Type:</span> ${props.type}</p>
                  <p><span class="font-medium">Density:</span> ${props.density}</p>
                  <p><span class="font-medium">Flood Risk:</span> ${props.floodRisk}</p>
                </div>
              </div>
            `)
            .addTo(mapInstance);
        });
        
        // Change cursor on hover
        mapInstance.on('mouseenter', 'urban-zones-fill', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        
        mapInstance.on('mouseleave', 'urban-zones-fill', () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }

      // Add flood zones if requested (simulated data)
      if (showFloodZones) {
        // Simulated flood zones GeoJSON
        // These would be generated from real flood models in production
        const floodZonesGeoJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'High Risk Flood Zone',
                risk: 'High',
                depth: '> 1.0m'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.03, center[0] - 0.01],
                  [center[1] - 0.01, center[0] - 0.03],
                  [center[1] + 0.02, center[0] - 0.02],
                  [center[1] + 0.03, center[0] + 0.01],
                  [center[1] + 0.01, center[0] + 0.03],
                  [center[1] - 0.02, center[0] + 0.01],
                  [center[1] - 0.03, center[0] - 0.01]
                ]]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Medium Risk Flood Zone',
                risk: 'Medium',
                depth: '0.5 - 1.0m'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.04, center[0] - 0.02],
                  [center[1] - 0.01, center[0] - 0.04],
                  [center[1] + 0.03, center[0] - 0.03],
                  [center[1] + 0.05, center[0] + 0.01],
                  [center[1] + 0.02, center[0] + 0.04],
                  [center[1] - 0.03, center[0] + 0.02],
                  [center[1] - 0.04, center[0] - 0.02]
                ]]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Low Risk Flood Zone',
                risk: 'Low',
                depth: '< 0.5m'
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[1] - 0.05, center[0] - 0.03],
                  [center[1] - 0.01, center[0] - 0.05],
                  [center[1] + 0.04, center[0] - 0.04],
                  [center[1] + 0.06, center[0] + 0.01],
                  [center[1] + 0.03, center[0] + 0.05],
                  [center[1] - 0.04, center[0] + 0.03],
                  [center[1] - 0.05, center[0] - 0.03]
                ]]
              }
            }
          ]
        };
        
        // Add flood zones to the map
        mapInstance.addSource('flood-zones', {
          'type': 'geojson',
          'data': floodZonesGeoJSON as any
        });
        
        mapInstance.addLayer({
          'id': 'flood-zones-fill',
          'type': 'fill',
          'source': 'flood-zones',
          'paint': {
            'fill-color': [
              'match',
              ['get', 'risk'],
              'High', '#ff4444',
              'Medium', '#ffaa33',
              'Low', '#ffee33',
              '#aaaaaa'
            ],
            'fill-opacity': 0.4
          }
        });
        
        mapInstance.addLayer({
          'id': 'flood-zones-outline',
          'type': 'line',
          'source': 'flood-zones',
          'paint': {
            'line-color': [
              'match',
              ['get', 'risk'],
              'High', '#cc0000',
              'Medium', '#cc7700',
              'Low', '#cccc00',
              '#666666'
            ],
            'line-width': 1,
            'line-dasharray': [2, 2]
          }
        });
        
        // Add click handler for flood zones
        mapInstance.on('click', 'flood-zones-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const props = feature.properties;
          
          if (!props) return;
          
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-lg">${props.name}</h3>
                <div class="mt-2 space-y-1">
                  <p><span class="font-medium">Risk Level:</span> <span class="text-${props.risk === 'High' ? 'red-600' : props.risk === 'Medium' ? 'amber-600' : 'yellow-600'}">${props.risk}</span></p>
                  <p><span class="font-medium">Expected Depth:</span> ${props.depth}</p>
                  <p class="text-sm mt-2">Based on historical data and terrain analysis</p>
                </div>
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
        
        // Add info popup for rain layer
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          className: 'rain-layer-info-popup'
        })
          .setLngLat([center[1], center[0]])
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">Precipitation Layer</h3>
              <p class="text-sm">This layer shows current precipitation data from OpenWeatherMap.</p>
              <p class="text-sm mt-1">Darker blue indicates heavier rainfall.</p>
            </div>
          `)
          .addTo(mapInstance);
          
        // Close popup after 8 seconds
        setTimeout(() => {
          popup.remove();
        }, 8000);
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [style, showBuildings, showTerrain, showTraffic, showHeatmap, showRainLayer, showWaterBodies, showUrbanZones, showFloodZones, enableHover, onHover]);

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

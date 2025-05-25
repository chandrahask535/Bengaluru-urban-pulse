
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Marker {
  position: [number, number];
  popup: string;
  color: string;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface EnhancedMapBoxProps {
  center: [number, number];
  zoom?: number;
  markers?: Marker[];
  className?: string;
  showBuildings?: boolean;
  showTraffic?: boolean;
  style?: string;
  showHeatmap?: boolean;
  heatmapData?: HeatmapPoint[];
  showRainLayer?: boolean;
  showTerrain?: boolean;
  showWaterBodies?: boolean;
  showUrbanZones?: boolean;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  enableHover?: boolean;
  onHover?: (feature: any) => void;
}

const EnhancedMapBoxComponent: React.FC<EnhancedMapBoxProps> = ({
  center,
  zoom = 11,
  markers = [],
  className = 'h-96',
  showBuildings = false,
  showTraffic = false,
  style = 'mapbox://styles/mapbox/streets-v11',
  showHeatmap = false,
  heatmapData = [],
  showRainLayer = false,
  showTerrain = false,
  showWaterBodies = false,
  showUrbanZones = false,
  onMapClick,
  enableHover = false,
  onHover
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNtNWhyaGdyczB1aHcyanB4aWZlNGh1enkifQ.PgeyMH5jL9fz9v0sUls-Ag';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [center[1], center[0]], // Mapbox uses [lng, lat]
      zoom: zoom,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
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

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Click handler
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (map.current && isMapLoaded) {
      map.current.flyTo({
        center: [center[1], center[0]],
        zoom: zoom,
        essential: true
      });
    }
  }, [center, zoom, isMapLoaded]);

  // Update map style
  useEffect(() => {
    if (map.current && isMapLoaded) {
      map.current.setStyle(style);
    }
  }, [style, isMapLoaded]);

  // Handle 3D buildings
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (showBuildings) {
      map.current.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    } else {
      if (map.current.getLayer('3d-buildings')) {
        map.current.removeLayer('3d-buildings');
      }
    }
  }, [showBuildings, isMapLoaded]);

  // Handle traffic layer
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (showTraffic) {
      map.current.addSource('mapbox-traffic', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-traffic-v1'
      });

      map.current.addLayer({
        id: 'traffic',
        type: 'line',
        source: 'mapbox-traffic',
        'source-layer': 'traffic',
        paint: {
          'line-width': 2,
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'low'],
            '#5cb85c',
            ['==', ['get', 'congestion'], 'moderate'],
            '#f0ad4e',
            ['==', ['get', 'congestion'], 'heavy'],
            '#d9534f',
            ['==', ['get', 'congestion'], 'severe'],
            '#d9534f',
            '#3bb2d0'
          ]
        }
      });
    } else {
      if (map.current.getLayer('traffic')) {
        map.current.removeLayer('traffic');
      }
      if (map.current.getSource('mapbox-traffic')) {
        map.current.removeSource('mapbox-traffic');
      }
    }
  }, [showTraffic, isMapLoaded]);

  // Handle flood zones
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (showUrbanZones) {
      // Create proper GeoJSON FeatureCollection
      const floodZonesGeoJSON: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [77.5946, 12.9716],
                [77.6046, 12.9716],
                [77.6046, 12.9816],
                [77.5946, 12.9816],
                [77.5946, 12.9716]
              ]]
            },
            properties: {
              name: "High Risk Zone",
              risk: "High"
            }
          }
        ]
      };

      map.current.addSource('flood-zones', {
        type: 'geojson',
        data: floodZonesGeoJSON
      });

      map.current.addLayer({
        id: 'flood-zones-fill',
        type: 'fill',
        source: 'flood-zones',
        paint: {
          'fill-color': '#ff0000',
          'fill-opacity': 0.3
        }
      });
    } else {
      if (map.current.getLayer('flood-zones-fill')) {
        map.current.removeLayer('flood-zones-fill');
      }
      if (map.current.getSource('flood-zones')) {
        map.current.removeSource('flood-zones');
      }
    }
  }, [showUrbanZones, isMapLoaded]);

  // Handle markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    markers.forEach((marker, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = marker.color;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(marker.popup);

      new mapboxgl.Marker(el)
        .setLngLat([marker.position[1], marker.position[0]])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [markers, isMapLoaded]);

  // Handle heatmap
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (showHeatmap && heatmapData.length > 0) {
      const features = heatmapData.map(point => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.lng, point.lat]
        },
        properties: {
          intensity: point.intensity
        }
      }));

      const heatmapGeoJSON: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: features
      };

      map.current.addSource('heatmap-data', {
        type: 'geojson',
        data: heatmapGeoJSON
      });

      map.current.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-data',
        maxzoom: 15,
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,255,0)',
            0.2, 'rgb(0,0,255)',
            0.4, 'rgb(0,255,255)',
            0.6, 'rgb(0,255,0)',
            0.8, 'rgb(255,255,0)',
            1, 'rgb(255,0,0)'
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.8
        }
      });
    } else {
      if (map.current.getLayer('heatmap-layer')) {
        map.current.removeLayer('heatmap-layer');
      }
      if (map.current.getSource('heatmap-data')) {
        map.current.removeSource('heatmap-data');
      }
    }
  }, [showHeatmap, heatmapData, isMapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default EnhancedMapBoxComponent;

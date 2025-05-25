
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_KEYS } from '@/config/api-keys';
import RealTimeWeatherService from '@/services/RealTimeWeatherService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Building, 
  Mountain, 
  Droplet, 
  CloudRain, 
  Navigation, 
  Eye,
  MapPin,
  Thermometer,
  Wind,
  Gauge
} from 'lucide-react';

interface EnhancedMapBoxProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    color?: string;
    type?: 'flood' | 'lake' | 'alert' | 'default';
  }>;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  showBuildings?: boolean;
  showTerrain?: boolean;
  showRainLayer?: boolean;
  showFloodZones?: boolean;
  showTraffic?: boolean;
  showSatellite?: boolean;
  enableLocateControl?: boolean;
  className?: string;
}

const EnhancedMapBoxComponent = ({
  center,
  zoom = 12,
  markers = [],
  onMapClick,
  showBuildings = false,
  showTerrain = false,
  showRainLayer = false,
  showFloodZones = false,
  showTraffic = false,
  showSatellite = false,
  enableLocateControl = false,
  className = "h-full w-full"
}: EnhancedMapBoxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState({
    buildings: showBuildings,
    terrain: showTerrain,
    rain: showRainLayer,
    floodZones: showFloodZones,
    traffic: showTraffic,
    satellite: showSatellite
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = API_KEYS.MAPBOX_API_KEY;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: selectedLayers.satellite 
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      pitch: selectedLayers.buildings ? 45 : 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control if enabled
    if (enableLocateControl) {
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
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Map click handler
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    // Map load handler
    map.current.on('load', () => {
      setMapLoaded(true);
      addAllLayers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Function to add all map layers
  const addAllLayers = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    // Add 3D buildings layer
    if (selectedLayers.buildings && !map.current.getLayer('3d-buildings')) {
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
    }

    // Add terrain layer
    if (selectedLayers.terrain && !map.current.getSource('mapbox-dem')) {
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    }

    // Add traffic layer
    if (selectedLayers.traffic && !map.current.getLayer('traffic')) {
      map.current.addLayer({
        id: 'traffic',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        },
        'source-layer': 'traffic',
        paint: {
          'line-width': 2,
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'low'], '#00ff00',
            ['==', ['get', 'congestion'], 'moderate'], '#ffff00',
            ['==', ['get', 'congestion'], 'heavy'], '#ff8800',
            '#ff0000'
          ]
        }
      });
    }

    // Add flood zones layer
    if (selectedLayers.floodZones && !map.current.getLayer('flood-zones')) {
      map.current.addLayer({
        id: 'flood-zones',
        type: 'fill',
        source: {
          type: 'geojson',
          data: generateFloodZoneData()
        },
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.3
        }
      });
    }

    // Add rainfall layer
    if (selectedLayers.rain && !map.current.getLayer('rainfall')) {
      map.current.addLayer({
        id: 'rainfall',
        type: 'raster',
        source: {
          type: 'raster',
          tiles: [`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEYS.OPENWEATHER_API_KEY}`],
          tileSize: 256,
        },
        paint: {
          'raster-opacity': 0.6
        }
      });
    }
  }, [selectedLayers, mapLoaded]);

  // Generate flood zone data
  const generateFloodZoneData = () => {
    const [lng, lat] = center;
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - 0.01, lat - 0.01],
              [lng + 0.01, lat - 0.01],
              [lng + 0.01, lat + 0.01],
              [lng - 0.01, lat + 0.01],
              [lng - 0.01, lat - 0.01]
            ]]
          },
          properties: {
            name: 'High Risk Flood Zone',
            risk: 'high'
          }
        }
      ]
    };
  };

  // Update markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    markers.forEach((marker, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = marker.color || '#3b82f6';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.position[1], marker.position[0]])
        .addTo(map.current!);

      if (marker.popup) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(marker.popup);
        mapboxMarker.setPopup(popup);
      }
    });
  }, [markers, mapLoaded]);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weather = await RealTimeWeatherService.getCurrentWeather(center[0], center[1]);
        setWeatherData(weather);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
  }, [center]);

  // Layer toggle functions
  const toggleLayer = (layerType: keyof typeof selectedLayers) => {
    setSelectedLayers(prev => {
      const newLayers = { ...prev, [layerType]: !prev[layerType] };
      
      // Apply layer changes
      if (map.current && mapLoaded) {
        switch (layerType) {
          case 'buildings':
            if (newLayers.buildings) {
              map.current.setPitch(45);
            } else {
              map.current.setPitch(0);
              if (map.current.getLayer('3d-buildings')) {
                map.current.removeLayer('3d-buildings');
              }
            }
            break;
            
          case 'terrain':
            if (newLayers.terrain) {
              if (!map.current.getSource('mapbox-dem')) {
                map.current.addSource('mapbox-dem', {
                  type: 'raster-dem',
                  url: 'mapbox://mapbox.mapbox-terrain-dem-v1'
                });
              }
              map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
            } else {
              map.current.setTerrain(null);
            }
            break;
            
          case 'satellite':
            map.current.setStyle(newLayers.satellite 
              ? 'mapbox://styles/mapbox/satellite-v9'
              : 'mapbox://styles/mapbox/light-v11'
            );
            break;
        }
        
        // Re-add other layers after style change
        setTimeout(() => addAllLayers(), 100);
      }
      
      return newLayers;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <Card className="p-2">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedLayers.buildings ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLayer('buildings')}
              className="text-xs"
            >
              <Building className="h-3 w-3 mr-1" />
              3D
            </Button>
            <Button
              variant={selectedLayers.terrain ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLayer('terrain')}
              className="text-xs"
            >
              <Mountain className="h-3 w-3 mr-1" />
              Terrain
            </Button>
            <Button
              variant={selectedLayers.rain ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLayer('rain')}
              className="text-xs"
            >
              <CloudRain className="h-3 w-3 mr-1" />
              Rain
            </Button>
            <Button
              variant={selectedLayers.floodZones ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLayer('floodZones')}
              className="text-xs"
            >
              <Droplet className="h-3 w-3 mr-1" />
              Flood
            </Button>
            <Button
              variant={selectedLayers.satellite ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLayer('satellite')}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Satellite
            </Button>
          </div>
        </Card>
      </div>

      {/* Weather Info */}
      {weatherData && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="p-3 bg-white/90 backdrop-blur-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Current Weather</h4>
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <Thermometer className="h-3 w-3 mr-1 text-red-500" />
                  {weatherData.current.temperature.toFixed(1)}°C
                </div>
                <div className="flex items-center">
                  <CloudRain className="h-3 w-3 mr-1 text-blue-500" />
                  {weatherData.current.rainfall.toFixed(1)}mm
                </div>
                <div className="flex items-center">
                  <Wind className="h-3 w-3 mr-1 text-gray-500" />
                  {weatherData.current.windSpeed.toFixed(1)}m/s
                </div>
                <div className="flex items-center">
                  <Gauge className="h-3 w-3 mr-1 text-purple-500" />
                  {weatherData.current.humidity}%
                </div>
              </div>
              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <div className="mt-2 p-1 bg-red-100 rounded text-xs text-red-700">
                  Weather Alert: {weatherData.alerts[0].event}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedMapBoxComponent;

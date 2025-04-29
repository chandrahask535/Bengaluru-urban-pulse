
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { API_KEYS } from '@/config/api-keys';

interface MapBoxComponentProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  className?: string;
}

const MapBoxComponent = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  className = 'h-[400px] w-full rounded-lg',
}: MapBoxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Initialize map with the public token
    mapboxgl.accessToken = API_KEYS.MAPBOX_API_KEY;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add click handler
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // Clear existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    // Add new markers
    markers.forEach(({ position, popup }) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([position[1], position[0]])  // MapBox uses [lng, lat] order
        .addTo(mapInstance);
      
      if (popup) {
        marker.setPopup(new mapboxgl.Popup().setHTML(popup));
      }
      
      markerRefs.current.push(marker);
    });
  }, [markers]);

  // Update center and zoom when they change
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter([center[1], center[0]]);
    map.current.setZoom(zoom);
  }, [center, zoom]);

  return <div ref={mapContainer} className={className} />;
};

export default MapBoxComponent;

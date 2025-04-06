import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  className?: string;
}

const MapContainer = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  className = 'h-[400px] w-full rounded-lg',
}: MapContainerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler
    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng);
      });
    }

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

    // Add new markers
    markers.forEach(({ position, popup }) => {
      const marker = L.marker(position).addTo(map);
      if (popup) {
        marker.bindPopup(popup);
      }
    });
  }, [markers]);

  // Update center and zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView(center, zoom);
  }, [center, zoom]);

  return <div ref={mapContainerRef} className={className} />;
};

export default MapContainer;
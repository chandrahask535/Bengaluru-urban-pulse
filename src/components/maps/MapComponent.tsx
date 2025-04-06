
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  onMapClick?: (e: L.LeafletMouseEvent) => void;
  className?: string;
}

const MapComponent = ({ center, zoom, markers = [], onMapClick, className = 'h-[400px]' }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<string>(`map-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Create map instance only if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    } else {
      // Update view if map already exists
      mapRef.current.setView(center, zoom);
    }

    // Add click handler
    if (onMapClick && mapRef.current) {
      mapRef.current.on('click', onMapClick);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, onMapClick]);

  // Update markers whenever they change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

    // Add markers
    markers.forEach(marker => {
      const m = L.marker(marker.position).addTo(mapRef.current!);
      if (marker.popup) {
        m.bindPopup(marker.popup);
      }
    });
  }, [markers]);

  return <div id={mapContainerRef.current} className={className} />;
};

export default MapComponent;


import { useEffect, useRef, useState, useId } from 'react';
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
  const mapContainerId = useId();
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const markerRefs = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;
    setIsMapInitialized(true);

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

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized) return;

    // Clear existing markers
    markerRefs.current.forEach(marker => {
      marker.remove();
    });
    markerRefs.current = [];

    // Add new markers
    markers.forEach(({ position, popup }) => {
      const marker = L.marker(position).addTo(map);
      markerRefs.current.push(marker);
      if (popup) {
        marker.bindPopup(popup);
      }
    });
  }, [markers, isMapInitialized]);

  // Update center and zoom when they change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapInitialized) return;

    map.setView(center, zoom);
  }, [center, zoom, isMapInitialized]);

  return <div id={mapContainerId} ref={mapContainerRef} className={className} />;
};

export default MapContainer;

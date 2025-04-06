import { useEffect } from 'react';
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
  useEffect(() => {
    // Create map instance
    const map = L.map('map').setView(center, zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers
    markers.forEach(marker => {
      const m = L.marker(marker.position).addTo(map);
      if (marker.popup) {
        m.bindPopup(marker.popup);
      }
    });

    // Add click handler
    if (onMapClick) {
      map.on('click', onMapClick);
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [center, zoom, markers, onMapClick]);

  return <div id="map" className={className} />;
};

export default MapComponent;
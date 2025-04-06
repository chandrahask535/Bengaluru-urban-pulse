import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SatelliteImageryService from '@/services/SatelliteImageryService';

interface SatelliteViewProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  year?: string;
  onLoad?: () => void;
  imageSource?: 'nasa' | 'bhuvan';
  date?: string;
}

const SatelliteView = ({
  center,
  zoom = 15,
  className = 'h-[400px] w-full rounded-lg',
  year,
  onLoad,
  imageSource = 'nasa',
  date,
}: SatelliteViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [imageryLayer, setImageryLayer] = useState<L.TileLayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    // Load satellite imagery based on source
    const loadSatelliteImagery = async () => {
      try {
        setLoading(true);
        const [lat, lng] = center;
        const imagery = imageSource === 'nasa'
          ? await SatelliteImageryService.getNASAEarthImagery({ lat, lng, date })
          : await SatelliteImageryService.getBhuvanImagery({ lat, lng, date });

        if (imageryLayer) {
          map.removeLayer(imageryLayer);
        }

        const newLayer = L.tileLayer(imagery.url, {
          attribution: imageSource === 'nasa'
            ? 'Imagery &copy; NASA MODIS'
            : 'Imagery &copy; ISRO Bhuvan',
          maxZoom: 19,
        }).addTo(map);

        setImageryLayer(newLayer);
      } catch (error) {
        console.error('Error loading satellite imagery:', error);
        // Fallback to ESRI World Imagery if API fails
        const fallbackLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        }).addTo(map);
        setImageryLayer(fallbackLayer);
      } finally {
        setLoading(false);
      }
    };

    loadSatelliteImagery();

    // Add labels layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Notify when map is loaded
    map.whenReady(() => {
      onLoad?.();
    });

    // Add year overlay if provided
    if (year) {
      const yearOverlay = new L.Control({ position: 'bottomleft' });
      yearOverlay.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        div.style.background = 'white';
        div.style.padding = '5px 10px';
        div.style.margin = '10px';
        div.style.borderRadius = '4px';
        div.style.fontSize = '14px';
        div.style.fontWeight = 'bold';
        div.innerHTML = year;
        return div;
      };
      yearOverlay.addTo(map);
    }

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center and zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView(center, zoom);
  }, [center, zoom]);

  return <div ref={mapContainerRef} className={className} />;
};

export default SatelliteView;
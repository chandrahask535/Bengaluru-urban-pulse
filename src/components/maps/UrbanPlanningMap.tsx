
import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';

interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  details: {
    floodRisk: string;
    floodRiskValue: number;
    greenCoverage: number;
    infrastructureScore: number;
    landUseTypes: Array<{
      type: string;
      percentage: number;
    }>;
    issues: string[];
  };
}

interface UrbanPlanningMapProps {
  locations: Location[];
  selectedLocation: string;
  onLocationSelect: (locationId: string) => void;
  className?: string;
}

const UrbanPlanningMap = ({
  locations,
  selectedLocation,
  onLocationSelect,
  className = 'h-[600px]'
}: UrbanPlanningMapProps) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const mapContainerRef = useState<string>(`urban-planning-map-${Math.random().toString(36).substring(2, 9)}`)[0];

  useEffect(() => {
    if (!map) {
      // Initialize map centered on Bengaluru
      const newMap = L.map(mapContainerRef).setView([12.9716, 77.5946], 11);

      // Add Mapbox tiles using environment variable
      L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_API_KEY}`, {
        attribution: '© Mapbox © OpenStreetMap'
      }).addTo(newMap);

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [mapContainerRef]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.remove());
      const newMarkers: L.Marker[] = [];

      // Add markers for each location
      locations.forEach(location => {
        const marker = L.marker(location.coordinates)
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${location.name}</h3>
              <p class="text-sm">Flood Risk: ${location.details.floodRisk}</p>
              <p class="text-sm">Green Coverage: ${location.details.greenCoverage}%</p>
              <button 
                class="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                onclick="window.selectLocation('${location.id}')"
              >
                Select Location
              </button>
            </div>
          `);

        if (location.id === selectedLocation) {
          marker.openPopup();
          map.setView(location.coordinates, 12);
        }

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);

      // Add global function for marker click handling
      (window as any).selectLocation = (locationId: string) => {
        onLocationSelect(locationId);
      };
    }
  }, [map, locations, selectedLocation, onLocationSelect]);

  return (
    <Card className="p-4">
      <div id={mapContainerRef} className={className} />
    </Card>
  );
};

export default UrbanPlanningMap;

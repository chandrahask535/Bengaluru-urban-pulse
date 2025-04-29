
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import MapBoxComponent from '@/components/maps/MapBoxComponent';

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
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; popup: string }>>([]);

  // Create popups for each location
  useEffect(() => {
    const newMarkers = locations.map(location => ({
      position: location.coordinates,
      popup: `
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
      `
    }));
    
    setMarkers(newMarkers);
    
    // Add global function for marker click handling
    (window as any).selectLocation = (locationId: string) => {
      onLocationSelect(locationId);
    };
    
    return () => {
      // Clean up the global function
      delete (window as any).selectLocation;
    };
  }, [locations, onLocationSelect]);

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);
  // Make sure we have a valid [number, number] tuple
  const centerCoordinates: [number, number] = selectedLocationData 
    ? selectedLocationData.coordinates
    : [12.9716, 77.5946];

  return (
    <Card className="p-4">
      <MapBoxComponent
        center={centerCoordinates}
        zoom={selectedLocation ? 12 : 11}
        markers={markers}
        className={className}
      />
    </Card>
  );
};

export default UrbanPlanningMap;

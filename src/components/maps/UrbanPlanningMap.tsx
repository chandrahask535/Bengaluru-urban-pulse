
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import MapBoxComponent from '@/components/maps/MapBoxComponent';
import { Button } from '@/components/ui/button';
import { Layers, Map as MapIcon, CloudRain, Building } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { generateHeatmapData } from '@/utils/mapUtils';

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
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; popup: string; color: string }>>([]);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [showBuildings, setShowBuildings] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRain, setShowRain] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<Array<{ lat: number; lng: number; intensity: number }>>([]);

  // Create popups for each location
  useEffect(() => {
    const newMarkers = locations.map(location => {
      // Determine marker color based on flood risk
      let markerColor;
      switch(location.details.floodRisk.toLowerCase()) {
        case 'high': markerColor = '#ef4444'; break;
        case 'moderate': markerColor = '#f59e0b'; break;
        case 'low': markerColor = '#10b981'; break;
        default: markerColor = '#3b82f6';
      }
      
      return {
        position: location.coordinates,
        color: markerColor,
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
      }
    });
    
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

  // Generate heatmap data based on flood risk
  useEffect(() => {
    // Generate heatmap data based on flood risk values
    const data = generateHeatmapData(locations);
    setHeatmapData(data);
  }, [locations]);

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);
  // Make sure we have a valid [number, number] tuple
  const centerCoordinates: [number, number] = selectedLocationData 
    ? selectedLocationData.coordinates
    : [12.9716, 77.5946];

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center">
          <MapIcon className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          <h3 className="text-lg font-medium">Urban Planning Map</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem 
              value="buildings" 
              aria-label="Toggle 3D Buildings"
              onClick={() => setShowBuildings(!showBuildings)}
              className={showBuildings ? 'bg-blue-100 dark:bg-blue-900' : ''}
            >
              <Building className="h-4 w-4 mr-1" />
              3D
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="traffic" 
              aria-label="Toggle Traffic"
              onClick={() => setShowTraffic(!showTraffic)}
              className={showTraffic ? 'bg-blue-100 dark:bg-blue-900' : ''}
            >
              <Layers className="h-4 w-4 mr-1" />
              Traffic
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="rain" 
              aria-label="Toggle Rain"
              onClick={() => setShowRain(!showRain)}
              className={showRain ? 'bg-blue-100 dark:bg-blue-900' : ''}
            >
              <CloudRain className="h-4 w-4 mr-1" />
              Rain
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="heatmap" 
              aria-label="Toggle Flood Risk Heatmap"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={showHeatmap ? 'bg-blue-100 dark:bg-blue-900' : ''}
            >
              <span className="h-4 w-4 mr-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full inline-block"></span>
              Risk
            </ToggleGroupItem>
          </ToggleGroup>
          
          <select 
            className="p-2 border rounded text-sm bg-white dark:bg-gray-800"
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
          >
            <option value="mapbox://styles/mapbox/streets-v11">Street</option>
            <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
            <option value="mapbox://styles/mapbox/satellite-streets-v11">Hybrid</option>
            <option value="mapbox://styles/mapbox/light-v10">Light</option>
            <option value="mapbox://styles/mapbox/dark-v10">Dark</option>
            <option value="mapbox://styles/mapbox/navigation-day-v1">Navigation</option>
          </select>
        </div>
      </div>
      
      <MapBoxComponent
        center={centerCoordinates}
        zoom={selectedLocation ? 12 : 11}
        markers={markers}
        className={className}
        showBuildings={showBuildings}
        showTraffic={showTraffic}
        style={mapStyle}
        showHeatmap={showHeatmap}
        heatmapData={heatmapData}
        showRainLayer={showRain}
      />
      
      {/* Legend */}
      <div className="mt-3 bg-white dark:bg-gray-800 p-2 rounded-md border shadow-sm">
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-1 font-medium">Map Legend</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-500 inline-block mr-1"></span>
            High Risk
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-amber-500 inline-block mr-1"></span>
            Moderate Risk
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-1"></span>
            Low Risk
          </div>
          {showTraffic && (
            <>
              <div className="border-l border-gray-300 dark:border-gray-600 pl-2"></div>
              <div className="flex items-center">
                <span className="h-2 w-4 bg-green-500 inline-block mr-1"></span>
                Low Traffic
              </div>
              <div className="flex items-center">
                <span className="h-2 w-4 bg-yellow-500 inline-block mr-1"></span>
                Moderate
              </div>
              <div className="flex items-center">
                <span className="h-2 w-4 bg-red-500 inline-block mr-1"></span>
                Heavy
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UrbanPlanningMap;

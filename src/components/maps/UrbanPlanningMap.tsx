
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import MapBoxComponent from '@/components/maps/MapBoxComponent';
import { Button } from '@/components/ui/button';
import { Layers, Map as MapIcon, CloudRain, Building, Mountain, Droplet, Info } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { generateHeatmapData, generateLocationPopup, getElevationForCoordinates, getDrainageScoreForCoordinates } from '@/utils/mapUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [showTerrain, setShowTerrain] = useState(false);
  const [showWaterBodies, setShowWaterBodies] = useState(false);
  const [showUrbanZones, setShowUrbanZones] = useState(false);
  const [heatmapData, setHeatmapData] = useState<Array<{ lat: number; lng: number; intensity: number }>>([]);
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);

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
      
      // Generate rich popup content with more information
      const popupContent = generateLocationPopup(
        location.name,
        location.coordinates,
        {
          floodRisk: location.details.floodRisk,
          greenCover: location.details.greenCoverage,
          elevationData: getElevationForCoordinates(location.coordinates[0], location.coordinates[1]),
          drainageScore: getDrainageScoreForCoordinates(location.coordinates[0], location.coordinates[1]),
          urbanDensity: 100 - location.details.greenCoverage - (location.details.landUseTypes.find(lt => lt.type === 'Water')?.percentage || 0)
        }
      );
      
      return {
        position: location.coordinates,
        color: markerColor,
        popup: popupContent
      };
    });
    
    setMarkers(newMarkers);
  }, [locations]);

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

  // Handle map click
  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    // Find the closest location to where the user clicked
    let closestLocation = locations[0];
    let minDistance = Infinity;
    
    locations.forEach(location => {
      const dx = location.coordinates[0] - latlng.lat;
      const dy = location.coordinates[1] - latlng.lng;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location;
      }
    });
    
    // Only select if within reasonable distance (0.1 degrees ~ 11km)
    if (minDistance < 0.1) {
      onLocationSelect(closestLocation.id);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center">
          <MapIcon className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          <h3 className="text-lg font-medium">Urban Planning Map</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <ToggleGroup type="multiple" className="justify-start">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="buildings" 
                    aria-label="Toggle 3D Buildings"
                    onClick={() => setShowBuildings(!showBuildings)}
                    className={showBuildings ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    3D
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show 3D buildings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="traffic" 
                    aria-label="Toggle Traffic"
                    onClick={() => setShowTraffic(!showTraffic)}
                    className={showTraffic ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <Layers className="h-4 w-4 mr-1" />
                    Traffic
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show real-time traffic conditions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="rain" 
                    aria-label="Toggle Rain"
                    onClick={() => setShowRain(!showRain)}
                    className={showRain ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <CloudRain className="h-4 w-4 mr-1" />
                    Rain
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show precipitation data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="terrain" 
                    aria-label="Toggle Terrain"
                    onClick={() => setShowTerrain(!showTerrain)}
                    className={showTerrain ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <Mountain className="h-4 w-4 mr-1" />
                    Terrain
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show elevation and terrain</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="water" 
                    aria-label="Toggle Water Bodies"
                    onClick={() => setShowWaterBodies(!showWaterBodies)}
                    className={showWaterBodies ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <Droplet className="h-4 w-4 mr-1" />
                    Water
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Highlight lakes, rivers, and water bodies</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="zones" 
                    aria-label="Toggle Urban Zones"
                    onClick={() => setShowUrbanZones(!showUrbanZones)}
                    className={showUrbanZones ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Zones
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show urban planning zones</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="heatmap" 
                    aria-label="Toggle Flood Risk Heatmap"
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={showHeatmap ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  >
                    <span className="h-4 w-4 mr-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full inline-block"></span>
                    Risk
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show flood risk heat map</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        zoom={selectedLocation ? 13 : 11}
        markers={markers}
        className={className}
        showBuildings={showBuildings}
        showTraffic={showTraffic}
        style={mapStyle}
        showHeatmap={showHeatmap}
        heatmapData={heatmapData}
        showRainLayer={showRain}
        showTerrain={showTerrain}
        showWaterBodies={showWaterBodies}
        showUrbanZones={showUrbanZones}
        onMapClick={handleMapClick}
        enableHover={true}
        onHover={setHoveredFeature}
      />
      
      {/* Enhanced Legend */}
      <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded-md border shadow-sm">
        <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Map Legend
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          {/* Flood Risk Legend */}
          <div>
            <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Flood Risk</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block mr-1"></span>
                High Risk
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block mr-1"></span>
                Moderate
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-1"></span>
                Low Risk
              </div>
            </div>
          </div>
          
          {/* Traffic Legend */}
          {showTraffic && (
            <div>
              <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Traffic Conditions</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <div className="flex items-center">
                  <span className="h-2 w-4 bg-green-500 inline-block mr-1"></span>
                  Low
                </div>
                <div className="flex items-center">
                  <span className="h-2 w-4 bg-yellow-500 inline-block mr-1"></span>
                  Moderate
                </div>
                <div className="flex items-center">
                  <span className="h-2 w-4 bg-orange-500 inline-block mr-1"></span>
                  Heavy
                </div>
                <div className="flex items-center">
                  <span className="h-2 w-4 bg-red-500 inline-block mr-1"></span>
                  Severe
                </div>
              </div>
            </div>
          )}
          
          {/* Urban Zones Legend */}
          {showUrbanZones && (
            <div>
              <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Urban Zones</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-[#6b7de0] inline-block mr-1"></span>
                  Commercial
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-[#82ca9d] inline-block mr-1"></span>
                  Residential
                </div>
                <div className="flex items-center">
                  <span className="h-3 w-3 bg-[#e87979] inline-block mr-1"></span>
                  Industrial
                </div>
              </div>
            </div>
          )}
          
          {/* Heatmap Legend */}
          {showHeatmap && (
            <div>
              <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Flood Risk Heatmap</p>
              <div className="flex items-center">
                <div className="h-2 w-20 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 inline-block mr-1"></div>
                <div className="flex justify-between w-20">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Rain Layer Legend */}
          {showRain && (
            <div>
              <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Precipitation</p>
              <div className="flex items-center">
                <div className="h-2 w-20 bg-gradient-to-r from-transparent via-blue-300 to-blue-700 inline-block mr-1"></div>
                <div className="flex justify-between w-20">
                  <span>None</span>
                  <span>Heavy</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Feature Info Section - Shows when hovering over features */}
        {hoveredFeature && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Selected Feature</p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p><strong>{hoveredFeature.properties?.name || 'Unknown Feature'}</strong></p>
              {hoveredFeature.properties?.type && (
                <p>Type: {hoveredFeature.properties.type}</p>
              )}
              {hoveredFeature.properties?.density && (
                <p>Density: {hoveredFeature.properties.density}</p>
              )}
              {hoveredFeature.properties?.floodRisk && (
                <p>Flood Risk: {hoveredFeature.properties.floodRisk}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Click on any location or feature for more details. Toggle layers using the buttons above.
        </div>
      </div>
    </Card>
  );
};

export default UrbanPlanningMap;

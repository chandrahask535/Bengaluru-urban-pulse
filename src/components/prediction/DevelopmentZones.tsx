
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, MapPin, TrendingUp, ArrowUpRight } from 'lucide-react';
import MapContainer from '@/components/ui/map/MapContainer';
import { toast } from 'sonner';

interface DevelopmentZonesProps {
  onBack: () => void;
}

interface Zone {
  id: string;
  name: string;
  coordinates: [number, number];
  growthPotential: number;
  infrastructureProjects: string[];
  zoneType: 'residential' | 'commercial' | 'mixed' | 'upcoming';
}

const developmentZones: Zone[] = [
  {
    id: "zone1",
    name: "Whitefield Tech Corridor",
    coordinates: [12.9698, 77.7500],
    growthPotential: 28,
    infrastructureProjects: ["Metro Purple Line Extension", "IT Park Expansion", "Peripheral Ring Road"],
    zoneType: 'commercial'
  },
  {
    id: "zone2",
    name: "North Bangalore Growth Hub",
    coordinates: [13.0827, 77.5877],
    growthPotential: 35,
    infrastructureProjects: ["Aerospace SEZ", "Peripheral Ring Road", "Road Widening Project"],
    zoneType: 'upcoming'
  },
  {
    id: "zone3",
    name: "Eastern Residential Belt",
    coordinates: [12.9552, 77.7021],
    growthPotential: 23,
    infrastructureProjects: ["New Township Development", "Water Supply Infrastructure", "Green Belt"],
    zoneType: 'residential'
  },
  {
    id: "zone4",
    name: "Central Business District",
    coordinates: [12.9716, 77.5946],
    growthPotential: 18,
    infrastructureProjects: ["Metro Connectivity", "Urban Renewal Project", "Smart City Initiative"],
    zoneType: 'mixed'
  },
  {
    id: "zone5",
    name: "Southern Industrial Corridor",
    coordinates: [12.8399, 77.6770],
    growthPotential: 22,
    infrastructureProjects: ["Industrial Park Expansion", "Road Infrastructure", "Logistics Hub"],
    zoneType: 'commercial'
  },
];

const DevelopmentZones = ({ onBack }: DevelopmentZonesProps) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    toast.success(`Selected ${zone.name}`, {
      description: `Growth potential: ${zone.growthPotential}%`
    });
  };

  const getMarkerPopup = (zone: Zone) => {
    return `
      <div class="p-2">
        <h3 class="font-bold">${zone.name}</h3>
        <p class="text-sm">Growth Potential: ${zone.growthPotential}%</p>
      </div>
    `;
  };
  
  const getZoneTypeColor = (zoneType: string) => {
    switch(zoneType) {
      case 'residential': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'commercial': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'mixed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'upcoming': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <Building className="mr-2 h-5 w-5 text-karnataka-park-medium" />
          Development Zones
        </h3>
        <Button variant="outline" onClick={onBack}>
          Back to Investment Insights
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-karnataka-park-medium" />
            Prime Development Locations
          </h4>
          <div className="h-[400px] mb-4">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={11}
              className="h-full w-full rounded-md shadow-sm"
              markers={developmentZones.map(zone => ({
                position: zone.coordinates,
                popup: getMarkerPopup(zone)
              }))}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Click on markers to view development zone details
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-karnataka-park-medium" />
            Zone Information
          </h4>
          
          {selectedZone ? (
            <div className="space-y-4">
              <div>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getZoneTypeColor(selectedZone.zoneType)}`}>
                  {selectedZone.zoneType.charAt(0).toUpperCase() + selectedZone.zoneType.slice(1)}
                </span>
                <h3 className="text-lg font-semibold mt-2">{selectedZone.name}</h3>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Growth Potential</div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-green-600">{selectedZone.growthPotential}%</span>
                  <span className="ml-1 text-sm text-gray-500">projected increase</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Key Infrastructure Projects</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedZone.infrastructureProjects.map((project, idx) => (
                    <li key={idx}>{project}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4">
                <Button className="w-full" variant="outline">
                  View Detailed Analysis <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
              <MapPin className="h-12 w-12 mb-2 text-gray-300" />
              <p>Select a zone to view details</p>
            </div>
          )}
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {developmentZones.map(zone => (
          <Card 
            key={zone.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedZone?.id === zone.id ? 'border-karnataka-park-medium bg-karnataka-park-light/10' : 
              'hover:border-karnataka-park-light'
            }`}
            onClick={() => handleZoneClick(zone)}
          >
            <div className="flex justify-between items-start">
              <h5 className="font-medium">{zone.name}</h5>
              <span className={`text-xs px-2 py-0.5 rounded ${getZoneTypeColor(zone.zoneType)}`}>
                {zone.zoneType.charAt(0).toUpperCase() + zone.zoneType.slice(1)}
              </span>
            </div>
            <div className="mt-2 text-lg font-semibold text-green-600">
              {zone.growthPotential}% <span className="text-xs text-gray-500">growth</span>
            </div>
            <div className="mt-1 text-xs text-gray-600 truncate">
              {zone.infrastructureProjects[0]}, {zone.infrastructureProjects.length > 1 ? `+${zone.infrastructureProjects.length - 1} more` : ''}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DevelopmentZones;

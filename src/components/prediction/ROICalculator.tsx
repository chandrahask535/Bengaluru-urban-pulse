
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Calculator, TrendingUp, Target } from 'lucide-react';
import MapContainer from '@/components/ui/map/MapContainer';
import { toast } from 'sonner';

interface ROICalculatorProps {
  onBack: () => void;
}

interface LocationData {
  lat: number;
  lng: number;
  areaName: string;
  selectedAreaSize: number;
}

const ROICalculator = ({ onBack }: ROICalculatorProps) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    lat: 12.9716,
    lng: 77.5946,
    areaName: 'Select on map',
    selectedAreaSize: 0
  });
  
  const [investment, setInvestment] = useState<string>('10000000');
  const [timeframe, setTimeframe] = useState<string>('5');
  const [calculatedROI, setCalculatedROI] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const bangaloreNeighborhoods = [
    { name: 'Whitefield', growthRate: 28 },
    { name: 'Peripheral Ring Road', growthRate: 35 },
    { name: 'HSR Layout', growthRate: 24 },
    { name: 'Koramangala', growthRate: 22 },
    { name: 'Indiranagar', growthRate: 20 },
    { name: 'Electronic City', growthRate: 18 },
    { name: 'Bellandur', growthRate: 27 },
    { name: 'Marathahalli', growthRate: 23 },
  ];

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    // Find nearest neighborhood based on dummy locations
    const neighborhoods = [
      { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
      { name: 'HSR Layout', lat: 12.9116, lng: 77.6474 },
      { name: 'Koramangala', lat: 12.9279, lng: 77.6271 },
      { name: 'Indiranagar', lat: 12.9719, lng: 77.6412 },
      { name: 'Electronic City', lat: 12.8399, lng: 77.6770 },
      { name: 'Bellandur', lat: 12.9217, lng: 77.6747 },
      { name: 'Marathahalli', lat: 12.9591, lng: 77.6974 },
    ];
    
    // Find closest neighborhood
    let closestNeighborhood = neighborhoods[0];
    let closestDistance = calculateDistance(
      latlng.lat, 
      latlng.lng, 
      neighborhoods[0].lat, 
      neighborhoods[0].lng
    );
    
    neighborhoods.forEach(neighborhood => {
      const distance = calculateDistance(
        latlng.lat, 
        latlng.lng, 
        neighborhood.lat, 
        neighborhood.lng
      );
      
      if (distance < closestDistance) {
        closestNeighborhood = neighborhood;
        closestDistance = distance;
      }
    });
    
    // Calculate a random area size between 5000 and 25000 sq ft
    const randomAreaSize = Math.floor(5000 + Math.random() * 20000);
    
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng,
      areaName: closestNeighborhood.name,
      selectedAreaSize: randomAreaSize
    });
    
    toast.success(`Selected location in ${closestNeighborhood.name}`, {
      description: `Area size: ${randomAreaSize.toLocaleString()} sq ft`
    });
  };
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };
  
  const calculateInvestmentROI = () => {
    setIsCalculating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const investmentAmount = parseFloat(investment);
        const years = parseFloat(timeframe);
        
        if (isNaN(investmentAmount) || isNaN(years)) {
          toast.error("Please enter valid numbers for investment amount and timeframe");
          setIsCalculating(false);
          return;
        }
        
        // Find growth rate for the selected area
        const areaInfo = bangaloreNeighborhoods.find(n => n.name === selectedLocation.areaName);
        const growthRate = areaInfo ? areaInfo.growthRate : 15; // Default to 15% if area not found
        
        // Calculate compound growth
        const landValue = selectedLocation.selectedAreaSize * 7500; // Base rate
        const futureValue = landValue * Math.pow(1 + (growthRate / 100), years);
        const roi = ((futureValue - landValue) / landValue) * 100;
        
        setCalculatedROI(roi);
        setIsCalculating(false);
      } catch (error) {
        console.error("Error calculating ROI:", error);
        toast.error("Error calculating ROI");
        setIsCalculating(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <Target className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          ROI Predictions
        </h3>
        <Button variant="outline" onClick={onBack}>
          Back to Investment Insights
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-karnataka-metro-medium" />
            Select Location for Investment
          </h4>
          <div className="h-[400px] mb-4">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={11}
              className="h-full w-full rounded-md shadow-sm"
              onMapClick={handleMapClick}
              markers={selectedLocation.lat ? [
                {
                  position: [selectedLocation.lat, selectedLocation.lng],
                  popup: `${selectedLocation.areaName}: ${selectedLocation.selectedAreaSize.toLocaleString()} sq ft`
                }
              ] : []}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Click on the map to select a location for investment analysis
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <Calculator className="mr-2 h-4 w-4 text-karnataka-metro-medium" />
            Investment Parameters
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1" htmlFor="location">
                Selected Area
              </label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                <MapPin className="h-4 w-4 text-karnataka-lake-medium" />
                <span>{selectedLocation.areaName}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1" htmlFor="area">
                Area Size
              </label>
              <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                {selectedLocation.selectedAreaSize.toLocaleString()} sq ft
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1" htmlFor="investment">
                Investment Amount (₹)
              </label>
              <Input
                id="investment"
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                placeholder="Enter investment amount"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1" htmlFor="timeframe">
                Investment Timeframe (Years)
              </label>
              <Input
                id="timeframe"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="Enter years"
              />
            </div>
            
            <Button 
              className="w-full"
              onClick={calculateInvestmentROI}
              disabled={isCalculating || !selectedLocation.areaName || selectedLocation.areaName === "Select on map"}
            >
              {isCalculating ? "Calculating..." : "Calculate ROI"}
            </Button>
          </div>
          
          {calculatedROI !== null && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <div className="text-sm mb-1">Projected Return on Investment</div>
              <div className="text-2xl font-bold">{calculatedROI.toFixed(2)}%</div>
              <div className="text-xs mt-1">over {timeframe} years</div>
            </div>
          )}
        </Card>
      </div>
      
      <Card className="p-6">
        <h4 className="text-lg font-medium mb-4 flex items-center">
          <TrendingUp className="mr-2 h-4 w-4 text-karnataka-metro-medium" />
          Investment Insights
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-lg">
            <div className="font-semibold mb-1">Estimated Land Value</div>
            <div className="text-xl font-bold text-karnataka-metro-medium">
              ₹{(selectedLocation.selectedAreaSize * 7500).toLocaleString()}/sq ft
            </div>
            <div className="text-sm text-gray-500 mt-1">Based on current market rates</div>
          </div>
          
          <div className="border p-4 rounded-lg">
            <div className="font-semibold mb-1">Growth Potential</div>
            <div className="text-xl font-bold text-green-600">
              {(() => {
                const area = bangaloreNeighborhoods.find(n => n.name === selectedLocation.areaName);
                return area ? `${area.growthRate}%` : "18-25%";
              })()}
            </div>
            <div className="text-sm text-gray-500 mt-1">Projected annual appreciation</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ROICalculator;

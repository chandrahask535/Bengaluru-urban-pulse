
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartBar, Calculator, MapPin, ArrowRight } from "lucide-react";
import MapContainer from "@/components/ui/map/MapContainer";
import { toast } from "sonner";

interface LandPriceCalculatorProps {
  onBack: () => void;
}

interface LandPriceFormData {
  latitude: string;
  longitude: string;
  distanceToMetro: string;
  distanceToTechPark: string;
  distanceToAirport: string;
  hasGreenSpaceNearby: boolean;
  isCornerPlot: boolean;
  isResidentialZone: boolean;
}

const LandPriceCalculator = ({ onBack }: LandPriceCalculatorProps) => {
  const [formData, setFormData] = useState<LandPriceFormData>({
    latitude: "12.9716",
    longitude: "77.5946",
    distanceToMetro: "2.5",
    distanceToTechPark: "3.2",
    distanceToAirport: "15.0",
    hasGreenSpaceNearby: false,
    isCornerPlot: false,
    isResidentialZone: true
  });
  
  const [predictedPrice, setPredictedPrice] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    setFormData({
      ...formData,
      latitude: latlng.lat.toFixed(4),
      longitude: latlng.lng.toFixed(4)
    });
    
    // Auto-adjust other values based on the location
    // In a real app, this would call an API to get actual data
    const distanceToMetro = (Math.random() * 5 + 0.5).toFixed(1);
    const distanceToTechPark = (Math.random() * 8 + 1).toFixed(1);
    const distanceToAirport = (Math.random() * 20 + 5).toFixed(1);
    
    setFormData(prev => ({
      ...prev,
      latitude: latlng.lat.toFixed(4),
      longitude: latlng.lng.toFixed(4),
      distanceToMetro,
      distanceToTechPark,
      distanceToAirport,
      hasGreenSpaceNearby: Math.random() > 0.5
    }));
    
    toast.success("Location selected", {
      description: `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`
    });
  };
  
  const calculateLandPrice = () => {
    setIsCalculating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Base price per sq ft
        const basePrice = 7500;
        
        // Location-based adjustments
        const latitudeFactor = parseFloat(formData.latitude) > 13.0 ? 1.2 : 1.0;
        const longitudeFactor = parseFloat(formData.longitude) > 77.6 ? 1.15 : 1.0;
        
        // Proximity factors (closer is better)
        const metroFactor = Math.max(0.8, 1 - (parseFloat(formData.distanceToMetro) * 0.05));
        const techParkFactor = Math.max(0.8, 1 - (parseFloat(formData.distanceToTechPark) * 0.03));
        const airportFactor = parseFloat(formData.distanceToAirport) < 10 ? 1.1 : 1.0;
        
        // Additional factors
        const greenSpaceFactor = formData.hasGreenSpaceNearby ? 1.15 : 1.0;
        const cornerPlotFactor = formData.isCornerPlot ? 1.1 : 1.0;
        const zoneFactor = formData.isResidentialZone ? 1.05 : 0.95;
        
        // Random market fluctuation
        const marketFactor = 0.9 + (Math.random() * 0.2);
        
        // Calculate final price
        const calculatedPrice = basePrice * 
          latitudeFactor * 
          longitudeFactor * 
          metroFactor * 
          techParkFactor * 
          airportFactor *
          greenSpaceFactor *
          cornerPlotFactor *
          zoneFactor *
          marketFactor;
          
        // Format the price
        const formattedPrice = calculatedPrice.toFixed(2);
        
        setPredictedPrice(formattedPrice);
        setIsCalculating(false);
      } catch (error) {
        console.error("Error calculating price:", error);
        toast.error("Error calculating price");
        setIsCalculating(false);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <ChartBar className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          Land Price Prediction
        </h3>
        <Button variant="outline" onClick={onBack}>
          Back to Investment Insights
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-karnataka-metro-medium" />
            Select Location
          </h4>
          <div className="h-[400px] mb-4">
            <MapContainer
              center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
              zoom={12}
              className="h-full w-full rounded-md shadow-sm"
              onMapClick={handleMapClick}
              markers={[
                {
                  position: [parseFloat(formData.latitude), parseFloat(formData.longitude)],
                  popup: `Selected location: ${formData.latitude}, ${formData.longitude}`
                }
              ]}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Click on the map to select a location for price prediction
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <Calculator className="mr-2 h-4 w-4 text-karnataka-metro-medium" />
            Property Details
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  name="latitude"
                  value={formData.latitude} 
                  onChange={handleInputChange} 
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  name="longitude"
                  value={formData.longitude} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="distanceToMetro">Distance to Metro (km)</Label>
              <Input 
                id="distanceToMetro" 
                name="distanceToMetro"
                value={formData.distanceToMetro} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div>
              <Label htmlFor="distanceToTechPark">Distance to Tech Park (km)</Label>
              <Input 
                id="distanceToTechPark" 
                name="distanceToTechPark"
                value={formData.distanceToTechPark} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div>
              <Label htmlFor="distanceToAirport">Distance to Airport (km)</Label>
              <Input 
                id="distanceToAirport" 
                name="distanceToAirport"
                value={formData.distanceToAirport} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasGreenSpaceNearby" 
                  checked={formData.hasGreenSpaceNearby}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("hasGreenSpaceNearby", checked as boolean)
                  }
                />
                <Label htmlFor="hasGreenSpaceNearby">Green Space Nearby</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isCornerPlot" 
                  checked={formData.isCornerPlot}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("isCornerPlot", checked as boolean)
                  }
                />
                <Label htmlFor="isCornerPlot">Corner Plot</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isResidentialZone" 
                  checked={formData.isResidentialZone}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("isResidentialZone", checked as boolean)
                  }
                />
                <Label htmlFor="isResidentialZone">Residential Zone</Label>
              </div>
            </div>
            
            <Button 
              className="w-full mt-2"
              onClick={calculateLandPrice}
              disabled={isCalculating}
            >
              {isCalculating ? "Calculating..." : "Predict Price"}
            </Button>
          </div>
        </Card>
      </div>
      
      {predictedPrice && (
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h4 className="text-lg font-semibold mb-4">Predicted Land Price</h4>
          <div className="text-4xl font-bold">₹{Number(predictedPrice).toLocaleString()}<span className="text-lg">/sqft</span></div>
          <p className="text-sm mt-2 opacity-80">Based on the provided location and proximity factors</p>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => {
                  toast.success("Report saved", {
                    description: "Land price prediction report has been saved"
                  });
                }}
              >
                Save Report
              </Button>
            </div>
            <div>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={onBack}
              >
                Compare Areas <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LandPriceCalculator;

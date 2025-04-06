import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Droplet, Building2, Plane, Trees } from "lucide-react";

interface PredictionInputs {
  latitude: string;
  longitude: string;
  distanceToMetro: string;
  distanceToTechPark: string;
  distanceToAirport: string;
  greenSpaceNearby: boolean;
}

const LandPricePrediction = () => {
  const [inputs, setInputs] = useState<PredictionInputs>({
    latitude: "",
    longitude: "",
    distanceToMetro: "",
    distanceToTechPark: "",
    distanceToAirport: "",
    greenSpaceNearby: false,
  });

  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);

  const handleInputChange = (field: keyof PredictionInputs, value: string | boolean) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePredict = () => {
    // Mock prediction calculation
    const basePrice = 5000; // Base price per sqft
    const metroFactor = Math.max(0, 1 - Number(inputs.distanceToMetro) * 0.1);
    const techParkFactor = Math.max(0, 1 - Number(inputs.distanceToTechPark) * 0.08);
    const airportFactor = Math.max(0, 1 - Number(inputs.distanceToAirport) * 0.05);
    const greenSpaceFactor = inputs.greenSpaceNearby ? 1.2 : 1;

    const price = basePrice * metroFactor * techParkFactor * airportFactor * greenSpaceFactor;
    setPredictedPrice(Math.round(price * 100) / 100);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <Input
              type="number"
              step="0.0001"
              value={inputs.latitude}
              onChange={(e) => handleInputChange("latitude", e.target.value)}
              placeholder="12.9716"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <Input
              type="number"
              step="0.0001"
              value={inputs.longitude}
              onChange={(e) => handleInputChange("longitude", e.target.value)}
              placeholder="77.5946"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Droplet className="w-5 h-5 text-karnataka-metro-medium" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Distance to Metro (km)</label>
              <Input
                type="number"
                step="0.1"
                value={inputs.distanceToMetro}
                onChange={(e) => handleInputChange("distanceToMetro", e.target.value)}
                placeholder="2.5"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Building2 className="w-5 h-5 text-karnataka-lake-medium" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Distance to Tech Park (km)</label>
              <Input
                type="number"
                step="0.1"
                value={inputs.distanceToTechPark}
                onChange={(e) => handleInputChange("distanceToTechPark", e.target.value)}
                placeholder="3.2"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Plane className="w-5 h-5 text-karnataka-rain-medium" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Distance to Airport (km)</label>
              <Input
                type="number"
                step="0.1"
                value={inputs.distanceToAirport}
                onChange={(e) => handleInputChange("distanceToAirport", e.target.value)}
                placeholder="15.0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Trees className="w-5 h-5 text-karnataka-park-medium" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Green Space Nearby</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={inputs.greenSpaceNearby}
                  onChange={(e) => handleInputChange("greenSpaceNearby", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-karnataka-park-medium focus:ring-karnataka-park-light"
                />
                <span className="text-sm text-gray-600">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={handlePredict}
          className="w-full md:w-auto bg-karnataka-metro-medium hover:bg-karnataka-metro-dark"
        >
          Predict Price
        </Button>

        {predictedPrice !== null && (
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-karnataka-metro-medium">
              ₹{predictedPrice.toLocaleString()}/sqft
            </h3>
            <p className="text-sm text-gray-600">
              Based on the provided location and proximity factors
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LandPricePrediction;
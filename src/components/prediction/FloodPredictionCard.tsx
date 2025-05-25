
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Droplet, CloudRain, MapPin, Compass, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFloodPrediction } from "@/hooks/usePredictionData";
import MapBoxComponent from "@/components/maps/MapBoxComponent";
import { generateLocationPopup, getElevationForCoordinates, getDrainageScoreForCoordinates } from "@/utils/mapUtils";
import MapBoxService from "@/services/MapBoxService";

const FloodPredictionCard = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
  const [areaName, setAreaName] = useState("Bangalore Central");
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; popup?: string; color?: string }>>([]);
  const [showFloodZones, setShowFloodZones] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  const [showRainLayer, setShowRainLayer] = useState(false);

  // States for user input
  const [inputLat, setInputLat] = useState(location.lat.toString());
  const [inputLng, setInputLng] = useState(location.lng.toString());
  const [inputAreaName, setInputAreaName] = useState(areaName);

  // Use the prediction hook
  const { data, isLoading, isError, error, refetch } = useFloodPrediction(
    location,
    areaName
  );

  // Update markers when location changes
  useEffect(() => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      // Generate additional details for the popup
      const elevation = getElevationForCoordinates(lat, lng);
      const drainageScore = getDrainageScoreForCoordinates(lat, lng);
      
      const popupContent = generateLocationPopup(inputAreaName, [lat, lng], {
        floodRisk: data?.prediction?.risk_level || "Unknown",
        rainfall: data?.weather?.rainfall || 0,
        greenCover: Math.round(25 + Math.random() * 35), // Simulated data
        elevationData: elevation,
        drainageScore: drainageScore
      });
      
      // Determine marker color based on risk level
      let markerColor = '#3b82f6'; // Default blue
      if (data?.prediction?.risk_level) {
        switch(data.prediction.risk_level) {
          case 'Critical': markerColor = '#ef4444'; break; // Red
          case 'High': markerColor = '#f97316'; break; // Orange
          case 'Moderate': markerColor = '#eab308'; break; // Yellow
          case 'Low': markerColor = '#10b981'; break; // Green
        }
      }
      
      setMarkers([{
        position: [lat, lng],
        popup: popupContent,
        color: markerColor
      }]);
    }
  }, [inputLat, inputLng, inputAreaName, data]);

  // Function to handle prediction
  const handlePredict = useCallback(() => {
    // Validate inputs
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    
    if (isNaN(lat) || isNaN(lng) || !inputAreaName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid coordinates and area name",
        variant: "destructive",
      });
      return;
    }
    
    // Update state with validated inputs
    setLocation({ lat, lng });
    setAreaName(inputAreaName);
    setIsPredicting(true);
    
    // Trigger refetch with new parameters
    refetch().finally(() => setIsPredicting(false));
  }, [inputLat, inputLng, inputAreaName, toast, refetch]);

  // Function to get risk level color
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Function to use user's current location
  const useCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInputLat(latitude.toString());
          setInputLng(longitude.toString());
          
          // Try to get location name using reverse geocoding
          MapBoxService.reverseGeocode(longitude, latitude)
            .then(data => {
              if (data.features && data.features.length > 0) {
                const placeName = data.features[0].place_name;
                setInputAreaName(placeName);
                
                // Also update location and trigger prediction
                setLocation({ lat: latitude, lng: longitude });
                setAreaName(placeName);
                
                // Automatically trigger prediction with the new location
                setTimeout(() => {
                  refetch().finally(() => setIsLocationLoading(false));
                }, 500);
                
                toast({
                  title: "Location Updated",
                  description: "Using your current location for prediction"
                });
              } else {
                setInputAreaName("Current Location");
                setIsLocationLoading(false);
                toast({
                  title: "Location Updated",
                  description: "Using your current location for prediction"
                });
              }
            })
            .catch(err => {
              console.error("Geocoding error:", err);
              setInputAreaName("Current Location");
              setIsLocationLoading(false);
              
              toast({
                title: "Location Updated",
                description: "Using your current location for prediction"
              });
            });
        },
        (error) => {
          setIsLocationLoading(false);
          let errorMessage = "Unable to get your location";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += ": Permission denied. Please enable location services in your browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += ": Position unavailable. Try again later.";
              break;
            case error.TIMEOUT:
              errorMessage += ": Request timed out. Try again.";
              break;
            default:
              errorMessage += `: ${error.message}`;
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      });
    }
  }, [toast, refetch]);

  // Handle map click to update coordinates
  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    setInputLat(latlng.lat.toFixed(6));
    setInputLng(latlng.lng.toFixed(6));
    
    // Try to get location name using reverse geocoding
    MapBoxService.reverseGeocode(latlng.lng, latlng.lat)
      .then(data => {
        if (data.features && data.features.length > 0) {
          const placeName = data.features[0].place_name;
          setInputAreaName(placeName);
        }
      })
      .catch(err => console.error("Geocoding error:", err));
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudRain className="mr-2 h-5 w-5 text-karnataka-rain-medium" />
          Flood Risk Prediction
        </CardTitle>
        <CardDescription>
          Get real-time flood risk assessment based on location and rainfall data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="w-full h-[350px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapBoxComponent
              center={[parseFloat(inputLat) || 12.9716, parseFloat(inputLng) || 77.5946]}
              markers={markers}
              onMapClick={handleMapClick}
              zoom={12}
              showBuildings={showBuildings}
              showTerrain={showTerrain}
              showRainLayer={showRainLayer}
              showFloodZones={showFloodZones}
              enableLocateControl={true}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showFloodZones ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowFloodZones(!showFloodZones)}
              className="flex items-center"
            >
              <Droplet className="h-4 w-4 mr-1" />
              Flood Zones
            </Button>
            <Button
              variant={showBuildings ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowBuildings(!showBuildings)}
              className="flex items-center"
            >
              <Ruler className="h-4 w-4 mr-1" />
              3D Buildings
            </Button>
            <Button
              variant={showTerrain ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowTerrain(!showTerrain)}
              className="flex items-center"
            >
              <Compass className="h-4 w-4 mr-1" />
              Terrain
            </Button>
            <Button
              variant={showRainLayer ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowRainLayer(!showRainLayer)}
              className="flex items-center"
            >
              <CloudRain className="h-4 w-4 mr-1" />
              Rainfall
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                placeholder="12.9716"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                placeholder="77.5946"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="areaName">Area Name</Label>
            <Input
              id="areaName"
              value={inputAreaName}
              onChange={(e) => setInputAreaName(e.target.value)}
              placeholder="Enter area name"
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              onClick={handlePredict} 
              disabled={isLoading || isPredicting}
              className="flex-1"
            >
              {isLoading || isPredicting ? "Processing..." : "Predict Flood Risk"}
            </Button>
            <Button 
              variant="outline" 
              onClick={useCurrentLocation}
              disabled={isLocationLoading}
              type="button"
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isLocationLoading ? "Getting Location..." : "Use My Location"}
            </Button>
          </div>
        </div>

        {isError && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>Error: {error?.message || "Failed to get prediction"}</span>
            </div>
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex items-center">
                <CloudRain className="h-5 w-5 mr-2 text-karnataka-rain-medium" />
                <span className="text-sm font-medium">Current Rainfall</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold">{data.weather.rainfall.toFixed(1)}</span>
                <span className="ml-1 text-sm text-gray-500">mm</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex items-center">
                <Droplet className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
                <span className="text-sm font-medium">Prediction Date</span>
              </div>
              <span className="text-base">
                {new Date(data.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Flood Risk Level</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
                    data.prediction.risk_level
                  )}`}
                >
                  {data.prediction.risk_level}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    data.prediction.risk_level === "Critical"
                      ? "bg-red-500"
                      : data.prediction.risk_level === "High"
                      ? "bg-orange-500"
                      : data.prediction.risk_level === "Moderate"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${data.prediction.probability * 100}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Confidence: {(data.prediction.probability * 100).toFixed(0)}%
              </p>
              
              {/* Additional information */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Elevation: {getElevationForCoordinates(location.lat, location.lng).toFixed(1)}m above sea level</li>
                  <li>• Drainage score: {getDrainageScoreForCoordinates(location.lat, location.lng).toFixed(0)}/100</li>
                  <li>• Recent rainfall: {data.weather.rainfall.toFixed(1)} mm</li>
                  <li>• Forecast rainfall: {(data.weather.rainfall_forecast || data.weather.rainfall * 1.2).toFixed(1)} mm (next 24h)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Based on ML predictions using real-time weather data and terrain analysis
      </CardFooter>
    </Card>
  );
};

export default FloodPredictionCard;

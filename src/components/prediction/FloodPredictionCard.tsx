
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Droplet, CloudRain, MapPin, Compass, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFloodPrediction } from "@/hooks/usePredictionData";
import EnhancedMapBoxComponent from "@/components/maps/EnhancedMapBoxComponent";
import { generateLocationPopup, getElevationForCoordinates, getDrainageScoreForCoordinates } from "@/utils/mapUtils";
import MapBoxService from "@/services/MapBoxService";
import RealTimeWeatherService, { RealTimeWeatherData } from "@/services/RealTimeWeatherService";

// Define the Marker interface to match what's expected
interface Marker {
  position: [number, number];
  popup: string;
  color: string;
}

const FloodPredictionCard = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [areaName, setAreaName] = useState("Bangalore Central");
  const [isPredicting, setIsPredicting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [showFloodZones, setShowFloodZones] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  const [showRainLayer, setShowRainLayer] = useState(false);
  const [realTimeWeather, setRealTimeWeather] = useState<RealTimeWeatherData | null>(null);

  // States for user input
  const [inputLat, setInputLat] = useState(location.lat.toString());
  const [inputLng, setInputLng] = useState(location.lng.toString());
  const [inputAreaName, setInputAreaName] = useState(areaName);

  // Use the prediction hook
  const { data, isLoading, isError, error, refetch } = useFloodPrediction(
    location,
    areaName
  );

  // Fetch real-time weather data
  useEffect(() => {
    const fetchRealTimeWeather = async () => {
      try {
        const weather = await RealTimeWeatherService.getCurrentWeather(location.lat, location.lng);
        setRealTimeWeather(weather);
      } catch (error) {
        console.error('Error fetching real-time weather:', error);
      }
    };

    fetchRealTimeWeather();
    const interval = setInterval(fetchRealTimeWeather, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [location]);

  // Update markers when location changes
  useEffect(() => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const elevation = getElevationForCoordinates(lat, lng);
      const drainageScore = getDrainageScoreForCoordinates(lat, lng);
      
      // Use real-time weather data if available
      const currentRainfall = realTimeWeather?.current.rainfall || data?.weather?.rainfall || 0;
      const forecastRainfall = realTimeWeather?.forecast.next24Hours || data?.weather?.rainfall_forecast || 0;
      
      const popupContent = generateLocationPopup(inputAreaName, [lat, lng], {
        floodRisk: data?.prediction?.risk_level || "Unknown",
        rainfall: currentRainfall,
        forecastRainfall: forecastRainfall,
        temperature: realTimeWeather?.current.temperature || 25,
        humidity: realTimeWeather?.current.humidity || 65,
        windSpeed: realTimeWeather?.current.windSpeed || 0,
        greenCover: Math.round(25 + Math.random() * 35),
        elevationData: elevation,
        drainageScore: drainageScore,
        alerts: realTimeWeather?.alerts || []
      });
      
      // Determine marker color based on risk level
      let markerColor = '#3b82f6';
      if (data?.prediction?.risk_level) {
        switch(data.prediction.risk_level) {
          case 'Critical': markerColor = '#ef4444'; break;
          case 'High': markerColor = '#f97316'; break;
          case 'Moderate': markerColor = '#eab308'; break;
          case 'Low': markerColor = '#10b981'; break;
        }
      }
      
      // Ensure popup is always provided
      setMarkers([{
        position: [lat, lng],
        popup: popupContent,
        color: markerColor
      }]);
    }
  }, [inputLat, inputLng, inputAreaName, data, realTimeWeather]);

  // Function to handle prediction
  const handlePredict = useCallback(() => {
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
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Latitude must be between -90 and 90, longitude between -180 and 180",
        variant: "destructive",
      });
      return;
    }
    
    setLocation({ lat, lng });
    setAreaName(inputAreaName);
    setIsPredicting(true);
    
    refetch().finally(() => setIsPredicting(false));
  }, [inputLat, inputLng, inputAreaName, toast, refetch]);

  const useCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation services",
        variant: "destructive",
      });
      return;
    }

    setIsLocationLoading(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setInputLat(latitude.toFixed(6));
        setInputLng(longitude.toFixed(6));
        
        try {
          const data = await MapBoxService.reverseGeocode(longitude, latitude);
          if (data.features && data.features.length > 0) {
            const placeName = data.features[0].place_name;
            setInputAreaName(placeName);
            setLocation({ lat: latitude, lng: longitude });
            setAreaName(placeName);
            
            toast({
              title: "Location Updated",
              description: `Using your current location: ${placeName}`,
            });
            
            setTimeout(() => {
              refetch().finally(() => setIsLocationLoading(false));
            }, 500);
          } else {
            setInputAreaName("Current Location");
            setIsLocationLoading(false);
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setInputAreaName(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLocationLoading(false);
          
          toast({
            title: "Location Found",
            description: "Using your coordinates for prediction",
          });
        }
      },
      (error) => {
        setIsLocationLoading(false);
        let errorMessage = "Unable to get your location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your device settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      options
    );
  }, [toast, refetch]);

  const handleMapClick = useCallback(async (latlng: { lat: number; lng: number }) => {
    setInputLat(latlng.lat.toFixed(6));
    setInputLng(latlng.lng.toFixed(6));
    
    try {
      const data = await MapBoxService.reverseGeocode(latlng.lng, latlng.lat);
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name;
        setInputAreaName(placeName);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setInputAreaName(`Location: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    }
  }, []);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudRain className="mr-2 h-5 w-5 text-karnataka-rain-medium" />
          Real-time Flood Risk Prediction
        </CardTitle>
        <CardDescription>
          Get AI-powered flood risk assessment with live weather data and satellite analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <EnhancedMapBoxComponent
              center={[parseFloat(inputLat) || 12.9716, parseFloat(inputLng) || 77.5946]}
              markers={markers}
              onMapClick={handleMapClick}
              zoom={12}
              showBuildings={showBuildings}
              showTerrain={showTerrain}
              showRainLayer={showRainLayer}
              showUrbanZones={showFloodZones}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                placeholder="12.9716"
                type="number"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                placeholder="77.5946"
                type="number"
                step="any"
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
              {isLoading || isPredicting ? "Analyzing..." : "Predict Flood Risk"}
            </Button>
            <Button 
              variant="outline" 
              onClick={useCurrentLocation}
              disabled={isLocationLoading}
              type="button"
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isLocationLoading ? "Locating..." : "Use My Location"}
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

        {realTimeWeather && (
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold">Live Weather Conditions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex justify-between items-center p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center">
                  <CloudRain className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">Rainfall</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{realTimeWeather.current.rainfall.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 block">mm/hr</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-md bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{realTimeWeather.current.temperature.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 block">°C</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{realTimeWeather.current.humidity}</span>
                  <span className="text-xs text-gray-500 block">%</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center">
                  <span className="text-sm font-medium">24h Forecast</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{realTimeWeather.forecast.next24Hours.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 block">mm</span>
                </div>
              </div>
            </div>

            {realTimeWeather.alerts && realTimeWeather.alerts.length > 0 && (
              <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded-md">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Weather Alert</span>
                </div>
                {realTimeWeather.alerts.map((alert, index) => (
                  <p key={index} className="text-sm">{alert.event}: {alert.description}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-4">
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">AI Flood Risk Assessment</span>
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
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-2">Risk Analysis</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Elevation: {getElevationForCoordinates(location.lat, location.lng).toFixed(1)}m above sea level</li>
                  <li>• Drainage efficiency: {getDrainageScoreForCoordinates(location.lat, location.lng).toFixed(0)}/100</li>
                  <li>• Current rainfall: {realTimeWeather?.current.rainfall.toFixed(1) || data.weather.rainfall.toFixed(1)} mm/hr</li>
                  <li>• 24h forecast: {realTimeWeather?.forecast.next24Hours.toFixed(1) || (data.weather.rainfall_forecast || data.weather.rainfall * 1.2).toFixed(1)} mm</li>
                  <li>• Weather conditions: {realTimeWeather?.current.description || "Standard conditions"}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Powered by real-time weather data, AI predictions, and satellite analysis • Updated every 5 minutes
      </CardFooter>
    </Card>
  );
};

export default FloodPredictionCard;

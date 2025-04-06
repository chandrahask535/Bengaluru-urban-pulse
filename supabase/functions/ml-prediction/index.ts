import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = api-keys.env.get("SUPABASE_URL") || "https://myrteuqoeettnpunxoyt.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock ML prediction model (in real implementation, this would use scikit-learn/XGBoost models)
function predictFloodRisk(rainfall: number, location: { lat: number; lng: number }): { risk_level: string; probability: number } {
  // Enhanced risk assessment model incorporating multiple factors
  const RISK_THRESHOLDS = {
    CRITICAL: 100,
    HIGH: 70,
    MODERATE: 40,
    LOW: 20
  };

  // Calculate base risk from rainfall
  let probability = Math.min(rainfall / RISK_THRESHOLDS.CRITICAL, 1);
  
  // Adjust probability based on location factors (mock elevation and soil data)
  const mockElevation = Math.sin(location.lat) * Math.cos(location.lng) * 100;
  const elevationFactor = mockElevation < 0 ? 1.2 : 0.8; // Lower elevation increases risk

  // Apply location-based adjustment
  probability *= elevationFactor;

  // Determine risk level based on adjusted probability
  let risk_level: string;
  if (probability >= 0.8) {
    risk_level = "Critical";
  } else if (probability >= 0.6) {
    risk_level = "High";
  } else if (probability >= 0.3) {
    risk_level = "Moderate";
  } else {
    risk_level = "Low";
  }

  return { risk_level, probability: Number(probability.toFixed(2)) };
}

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(lat: number, lng: number): Promise<{ rainfall: number }> {
  const OPENWEATHER_API_KEY = api-keys.env.get("OPENWEATHER_API_KEY");
  if (!OPENWEATHER_API_KEY) {
    console.warn("OpenWeather API key not configured, using mock data");
    return { rainfall: Math.random() * 120 };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Convert precipitation to mm/h if available, otherwise use a calculated value
    const rainfall = data.rain?.['1h'] || (data.main.humidity * 0.5); // Simplified calculation
    return { rainfall };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Fallback to historical average or calculated value
    return { rainfall: 45 }; // Default to moderate rainfall
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse the request
    if (req.method === "GET") {
      // Return API info for GET requests
      return new Response(
        JSON.stringify({
          status: "online",
          endpoints: {
            "/flood-prediction": "POST - Predict flood risk for a location",
            "/lake-health": "POST - Get lake health assessment",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pathname } = new URL(req.url);
    const requestData = await req.json();

    // Flood prediction endpoint
    if (pathname === "/flood-prediction") {
      // Validate request data
      if (!requestData.location || !requestData.location.lat || !requestData.location.lng) {
        return new Response(
          JSON.stringify({ error: "Invalid request. Location coordinates required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get weather data from external API
      const weatherData = await fetchWeatherData(requestData.location.lat, requestData.location.lng);
      
      // Run prediction model
      const prediction = predictFloodRisk(weatherData.rainfall, requestData.location);

      // Store prediction in database
      const { error } = await supabase.from("flood_predictions").insert({
        area_name: requestData.area_name || "Unknown Area",
        location: `POINT(${requestData.location.lng} ${requestData.location.lat})`,
        prediction_date: new Date().toISOString().split("T")[0],
        rainfall_forecast: weatherData.rainfall,
        risk_level: prediction.risk_level,
      });

      if (error) {
        console.error("Error storing prediction:", error);
      }

      // Return prediction
      return new Response(
        JSON.stringify({
          prediction: prediction,
          weather: weatherData,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Lake health assessment endpoint
    if (pathname === "/lake-health") {
      // Validate request data
      if (!requestData.lake_id) {
        return new Response(
          JSON.stringify({ error: "Invalid request. Lake ID required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch lake data from database
      const { data: lakeData, error } = await supabase
        .from("lakes")
        .select("*")
        .eq("id", requestData.lake_id)
        .single();

      if (error || !lakeData) {
        return new Response(
          JSON.stringify({ error: "Lake not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // In a real implementation, this would use actual analysis algorithms
      // Mock lake health assessment
      const healthAssessment = {
        water_quality: lakeData.pollution_level || "Unknown",
        encroachment_risk: lakeData.encroachment_status || "Unknown",
        restoration_priority: Math.random() > 0.5 ? "High" : "Medium",
        suggested_actions: [
          "Regular water quality testing",
          "Monitor encroachment activities",
          "Community cleanup drive",
        ],
      };

      // Return assessment
      return new Response(
        JSON.stringify({
          lake: lakeData,
          health_assessment: healthAssessment,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Urban planning insights endpoint
    if (pathname === "/urban-insights") {
      // This would integrate with zoning data and urban planning models
      // Mock response for now
      return new Response(
        JSON.stringify({
          insights: {
            green_cover_percentage: 22.5,
            drainage_efficiency: "Medium",
            flood_prone_zones: 3,
            suggested_improvements: [
              "Increase permeable surfaces",
              "Expand green cover in eastern sector",
              "Improve drainage infrastructure in low-lying areas",
            ],
          },
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no matching endpoint found
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

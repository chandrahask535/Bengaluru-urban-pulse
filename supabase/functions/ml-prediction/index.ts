
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://myrteuqoeettnpunxoyt.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock ML prediction model (in real implementation, this would use scikit-learn/XGBoost models)
function predictFloodRisk(rainfall: number, location: { lat: number; lng: number }): { risk_level: string; probability: number } {
  // This is a simple mock model - would be replaced with actual ML logic
  // In a real implementation, you would load a trained model and use it for predictions
  
  // Simple logic based on rainfall amount
  if (rainfall > 100) {
    return { risk_level: "Critical", probability: 0.9 };
  } else if (rainfall > 70) {
    return { risk_level: "High", probability: 0.7 };
  } else if (rainfall > 40) {
    return { risk_level: "Moderate", probability: 0.4 };
  } else {
    return { risk_level: "Low", probability: 0.1 };
  }
}

// Function to fetch weather data from OpenWeatherMap API (would be implemented with actual API key)
async function fetchWeatherData(lat: number, lng: number): Promise<{ rainfall: number }> {
  // In real implementation, fetch from OpenWeatherMap
  // For now, return mock data
  console.log(`Fetching weather data for location: ${lat}, ${lng}`);
  return { rainfall: Math.random() * 120 }; // Random value between 0-120mm
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

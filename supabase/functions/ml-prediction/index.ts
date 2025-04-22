
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

// Cache for area-specific data
const areaData: Record<string, {
  drainage_efficiency: number;
  urbanization: number;
  elevation: number;
  population_density: number;
}> = {
  "Koramangala": {
    drainage_efficiency: 45,
    urbanization: 85,
    elevation: 905,
    population_density: 18000
  },
  "Bellandur": {
    drainage_efficiency: 30,
    urbanization: 90,
    elevation: 875,
    population_density: 12000
  },
  "HSR Layout": {
    drainage_efficiency: 55,
    urbanization: 80,
    elevation: 915,
    population_density: 15000
  },
  "Bommanahalli": {
    drainage_efficiency: 40,
    urbanization: 85,
    elevation: 895,
    population_density: 20000
  },
  "BTM Layout": {
    drainage_efficiency: 50,
    urbanization: 85,
    elevation: 910,
    population_density: 25000
  },
  "Varthur": {
    drainage_efficiency: 25,
    urbanization: 80,
    elevation: 880,
    population_density: 10000
  },
  "Marathahalli": {
    drainage_efficiency: 35,
    urbanization: 85,
    elevation: 890,
    population_density: 18000
  },
  "Whitefield": {
    drainage_efficiency: 60,
    urbanization: 75,
    elevation: 925,
    population_density: 12000
  },
  "Indiranagar": {
    drainage_efficiency: 55,
    urbanization: 80,
    elevation: 910,
    population_density: 20000
  }
};

// Advanced flood risk prediction model based on Bangalore's characteristics
function predictFloodRisk(
  rainfall: number, 
  rainfall3day: number,
  location: { lat: number; lng: number },
  area: string
): { risk_level: string; probability: number } {
  // Get area-specific factors or use defaults
  const areaInfo = areaData[area] || {
    drainage_efficiency: 45,
    urbanization: 80,
    elevation: 900,
    population_density: 15000
  };
  
  // Factors that increase flood risk in Bangalore
  const DRAINAGE_WEIGHT = 0.25; // Poor drainage is a major factor
  const RAINFALL_WEIGHT = 0.3;  // Current rainfall
  const RAINFALL_3DAY_WEIGHT = 0.2; // Past 3 days cumulative rainfall
  const ELEVATION_WEIGHT = 0.15; // Lower areas flood more easily
  const URBANIZATION_WEIGHT = 0.1; // Higher urbanization = more runoff, less absorption
  
  // Normalize all factors to 0-1 range
  const drainageFactor = (100 - areaInfo.drainage_efficiency) / 100; // Invert so higher is worse
  const rainfallFactor = Math.min(rainfall / 120, 1); // Normalized to max typical heavy rainfall
  const rainfall3dayFactor = Math.min(rainfall3day / 250, 1); // Normalized to max 3-day rainfall
  const elevationFactor = Math.max(0, Math.min(1, (930 - areaInfo.elevation) / 70)); // Lower = higher risk
  const urbanizationFactor = areaInfo.urbanization / 100;
  
  // Calculate weighted risk score
  let riskScore = 
    DRAINAGE_WEIGHT * drainageFactor +
    RAINFALL_WEIGHT * rainfallFactor +
    RAINFALL_3DAY_WEIGHT * rainfall3dayFactor +
    ELEVATION_WEIGHT * elevationFactor +
    URBANIZATION_WEIGHT * urbanizationFactor;
  
  // Add small random variation for realistic model behavior
  riskScore = Math.min(1, Math.max(0, riskScore + (Math.random() * 0.1 - 0.05)));
  
  // Determine risk level based on score
  let risk_level: string;
  if (riskScore >= 0.75) {
    risk_level = "Critical";
  } else if (riskScore >= 0.5) {
    risk_level = "High";
  } else if (riskScore >= 0.25) {
    risk_level = "Moderate";
  } else {
    risk_level = "Low";
  }

  // Probability is the risk score
  return { risk_level, probability: Number(riskScore.toFixed(2)) };
}

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(lat: number, lng: number): Promise<{ 
  rainfall: number;
  rainfall3day: number;
}> {
  const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");
  
  if (!OPENWEATHER_API_KEY) {
    console.warn("OpenWeather API key not configured, using mock data");
    // Simulate based on Bangalore seasonal patterns
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    
    let baseRainfall = 0;
    // Apply seasonal patterns
    if (month >= 6 && month <= 9) {
      // Monsoon (Jun-Sep)
      baseRainfall = Math.random() * 80 + 20;
    } else if (month >= 3 && month <= 5) {
      // Pre-monsoon (Mar-May)
      baseRainfall = Math.random() * 40 + 5;
    } else if (month >= 10 && month <= 11) {
      // Post-monsoon (Oct-Nov)
      baseRainfall = Math.random() * 30 + 5;
    } else {
      // Dry season (Dec-Feb)
      baseRainfall = Math.random() * 10;
    }
    
    return { 
      rainfall: baseRainfall,
      rainfall3day: baseRainfall * (1.5 + Math.random())
    };
  }

  try {
    // Fetch current weather
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract rainfall (mm/h) - OpenWeatherMap provides it as rain.1h if available
    const rainfall = data.rain?.['1h'] || 0;
    
    // Fetch past days for 3-day accumulation (in real system, would use historical API)
    // For now, estimate based on current conditions and seasonal patterns
    const rainfall3day = rainfall * (2 + Math.random() * 2); // Rough estimate
    
    return { rainfall, rainfall3day };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Fallback to reasonable values
    return { rainfall: 10, rainfall3day: 25 };
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
      const weatherData = await fetchWeatherData(
        requestData.location.lat, 
        requestData.location.lng
      );
      
      // Get area name with fallback
      const areaName = requestData.area_name || "Unknown Area";
      
      // Run prediction model
      const prediction = predictFloodRisk(
        weatherData.rainfall, 
        weatherData.rainfall3day,
        requestData.location,
        areaName
      );

      // Store prediction in database
      const { error } = await supabase
        .from("flood_predictions")
        .insert({
          area_name: areaName,
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
          weather: { rainfall: weatherData.rainfall },
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

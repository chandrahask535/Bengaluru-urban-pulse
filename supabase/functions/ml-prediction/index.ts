import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase config
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Elevation API key (you can use open-elevation or Google Elevation API)
const OPEN_ELEVATION_API = "https://api.open-elevation.com/api/v1/lookup";

// OpenWeatherMap API key
const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY")!;

// Fetch rainfall from OpenWeatherMap
async function fetchWeatherData(lat: number, lng: number): Promise<{ rainfall: number }> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) throw new Error(`Weather API error: ${response.statusText}`);

    const data = await response.json();
    const rainfall = data.rain?.["1h"] ?? (data.main.humidity * 0.5); // fallback calculation
    return { rainfall };
  } catch (error) {
    console.error("Weather error:", error);
    return { rainfall: 45 };
  }
}

// Fetch elevation from open-elevation
async function fetchElevation(lat: number, lng: number): Promise<number> {
  try {
    const response = await fetch(`${OPEN_ELEVATION_API}?locations=${lat},${lng}`);
    const data = await response.json();
    return data.results[0].elevation;
  } catch (err) {
    console.error("Elevation error:", err);
    return 50; // fallback elevation
  }
}

// Real risk prediction using weather + elevation
async function predictFloodRisk(rainfall: number, elevation: number): Promise<{ risk_level: string; probability: number }> {
  const thresholds = { CRITICAL: 100, HIGH: 70, MODERATE: 40 };
  let probability = Math.min(rainfall / thresholds.CRITICAL, 1);
  const elevationFactor = elevation < 30 ? 1.2 : 0.8; // Lower elevation, higher risk
  probability *= elevationFactor;

  let risk_level = "Low";
  if (probability >= 0.8) risk_level = "Critical";
  else if (probability >= 0.6) risk_level = "High";
  else if (probability >= 0.3) risk_level = "Moderate";

  return { risk_level, probability: Number(probability.toFixed(2)) };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders, status: 204 });

  try {
    const { pathname } = new URL(req.url);
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          endpoints: {
            "/flood-prediction": "POST - Predict flood risk",
            "/lake-health": "POST - Assess lake health",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    if (pathname === "/flood-prediction") {
      const { location, area_name } = body;
      if (!location?.lat || !location?.lng) {
        return new Response(JSON.stringify({ error: "Missing coordinates" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const [weather, elevation] = await Promise.all([
        fetchWeatherData(location.lat, location.lng),
        fetchElevation(location.lat, location.lng),
      ]);

      const prediction = await predictFloodRisk(weather.rainfall, elevation);

      const { error } = await supabase.from("flood_predictions").insert({
        area_name: area_name || "Unknown",
        location: `POINT(${location.lng} ${location.lat})`,
        prediction_date: new Date().toISOString().split("T")[0],
        rainfall_forecast: weather.rainfall,
        elevation,
        risk_level: prediction.risk_level,
      });

      if (error) console.error("Insert error:", error);

      return new Response(
        JSON.stringify({ prediction, weather, elevation, timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (pathname === "/lake-health") {
      if (!body.lake_id) {
        return new Response(JSON.stringify({ error: "Lake ID is required" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const { data: lake, error } = await supabase.from("lakes").select("*").eq("id", body.lake_id).single();
      if (error || !lake) {
        return new Response(JSON.stringify({ error: "Lake not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      // Assume pollution_level, encroachment_status are real stored columns
      const assessment = {
        water_quality: lake.pollution_level,
        encroachment_risk: lake.encroachment_status,
        restoration_priority: lake.pollution_level === "High" ? "Urgent" : "Monitor",
        suggested_actions: [
          "Monitor quality",
          "Stop construction near lake",
          "Enforce buffer zones",
        ],
      };

      return new Response(
        JSON.stringify({ lake, health_assessment: assessment, timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

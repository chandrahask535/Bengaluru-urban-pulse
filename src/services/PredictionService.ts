
import { supabase } from "@/integrations/supabase/client";

// Base URL for our Supabase Edge Functions
const EDGE_FUNCTION_URL = "https://myrteuqoeettnpunxoyt.supabase.co/functions/v1/ml-prediction";

// Type definitions for API responses
export interface FloodPrediction {
  risk_level: "Critical" | "High" | "Moderate" | "Low";
  probability: number;
}

export interface WeatherData {
  rainfall: number;
}

export interface FloodPredictionResponse {
  prediction: FloodPrediction;
  weather: WeatherData;
  timestamp: string;
  error?: string;
}

export interface LakeHealthAssessment {
  water_quality: string;
  encroachment_risk: string;
  restoration_priority: string;
  suggested_actions: string[];
}

export interface LakeHealthResponse {
  lake: any; // Lake data from database
  health_assessment: LakeHealthAssessment;
  timestamp: string;
}

export interface UrbanInsightsResponse {
  insights: {
    green_cover_percentage: number;
    drainage_efficiency: string;
    flood_prone_zones: number;
    suggested_improvements: string[];
  };
  timestamp: string;
}

// Service for ML predictions and data analysis
class PredictionService {
  // Get flood prediction for a specific location
  async getFloodPrediction(location: { lat: number; lng: number }, areaName: string): Promise<FloodPredictionResponse> {
    try {
      // Validate input parameters
      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        throw new Error('Invalid location coordinates');
      }
      if (!areaName || typeof areaName !== 'string') {
        throw new Error('Invalid area name');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${EDGE_FUNCTION_URL}/flood-prediction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          location,
          area_name: areaName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get flood prediction");
      }

      const data = await response.json();
      
      // Validate response data structure
      if (!data.prediction || !data.weather || !data.timestamp) {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      console.error("Error fetching flood prediction:", error);
      return {
        prediction: { risk_level: "Low", probability: 0 },
        weather: { rainfall: 0 },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get health assessment for a specific lake
  async getLakeHealth(lakeId: string): Promise<LakeHealthResponse> {
    try {
      const response = await fetch(`${EDGE_FUNCTION_URL}/lake-health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.session()?.access_token || ""}`,
        },
        body: JSON.stringify({
          lake_id: lakeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get lake health assessment");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lake health:", error);
      throw error;
    }
  }

  // Get urban planning insights for a region
  async getUrbanInsights(region: { lat: number; lng: number; radius: number }): Promise<UrbanInsightsResponse> {
    try {
      const response = await fetch(`${EDGE_FUNCTION_URL}/urban-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.session()?.access_token || ""}`,
        },
        body: JSON.stringify({
          region,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get urban insights");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching urban insights:", error);
      throw error;
    }
  }

  // Fetch recent flood predictions from database
  async getRecentFloodPredictions(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from("flood_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching recent flood predictions:", error);
      throw error;
    }
  }

  // Fetch all lakes data from database
  async getAllLakes() {
    try {
      const { data, error } = await supabase
        .from("lakes")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching lakes data:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const predictionService = new PredictionService();

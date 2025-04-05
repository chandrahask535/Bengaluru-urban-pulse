
import { useQuery } from "@tanstack/react-query";
import { predictionService } from "@/services/PredictionService";

// Hook for fetching flood prediction data
export function useFloodPrediction(location: { lat: number; lng: number }, areaName: string) {
  return useQuery({
    queryKey: ["floodPrediction", location, areaName],
    queryFn: () => predictionService.getFloodPrediction(location, areaName),
    enabled: !!location.lat && !!location.lng && !!areaName,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for fetching lake health data
export function useLakeHealth(lakeId: string) {
  return useQuery({
    queryKey: ["lakeHealth", lakeId],
    queryFn: () => predictionService.getLakeHealth(lakeId),
    enabled: !!lakeId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook for fetching urban planning insights
export function useUrbanInsights(region: { lat: number; lng: number; radius: number }) {
  return useQuery({
    queryKey: ["urbanInsights", region],
    queryFn: () => predictionService.getUrbanInsights(region),
    enabled: !!region.lat && !!region.lng && !!region.radius,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

// Hook for fetching recent flood predictions
export function useRecentFloodPredictions(limit: number = 10) {
  return useQuery({
    queryKey: ["recentFloodPredictions", limit],
    queryFn: () => predictionService.getRecentFloodPredictions(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching all lakes
export function useAllLakes() {
  return useQuery({
    queryKey: ["allLakes"],
    queryFn: () => predictionService.getAllLakes(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

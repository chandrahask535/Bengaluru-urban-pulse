
import { useQuery } from "@tanstack/react-query";
import LakeRealTimeService from "@/services/LakeRealTimeService";

export function useLandCoverData(coordinates: [number, number] | null) {
  return useQuery({
    queryKey: ["landCoverData", coordinates],
    queryFn: () => coordinates ? LakeRealTimeService.getLandCoverData(coordinates) : null,
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useLocationDetails(coordinates: [number, number] | null) {
  return useQuery({
    queryKey: ["locationDetails", coordinates],
    queryFn: () => coordinates ? LakeRealTimeService.getLocationDetails(coordinates) : null,
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useElevationData(coordinates: [number, number] | null) {
  return useQuery({
    queryKey: ["elevationData", coordinates],
    queryFn: () => coordinates ? LakeRealTimeService.getElevationData(coordinates) : null,
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (elevation doesn't change often)
  });
}

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List
import numpy as np
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

from ..models import UrbanZone
from ..schemas import Region, UrbanInsightsResponse, UrbanInsights

# Constants for analysis
ZONE_TYPES = {
    "residential": "Residential Area",
    "commercial": "Commercial Zone",
    "industrial": "Industrial Zone",
    "green_space": "Green Space",
    "water_body": "Water Body"
}

# Calculate green cover percentage for a region
def calculate_green_cover(region_geometry: Dict[str, Any], zones: List[UrbanZone]) -> float:
    try:
        region_shape = shape(region_geometry)
        green_zones = [zone for zone in zones if zone.zone_type == "green_space"]
        
        if not green_zones:
            return 0.0
        
        green_area = sum(shape(zone.geometry).area for zone in green_zones)
        total_area = region_shape.area
        
        return (green_area / total_area) * 100 if total_area > 0 else 0.0
    except Exception as e:
        print(f"Error calculating green cover: {str(e)}")
        return 0.0

# Calculate zone distribution
def calculate_zone_distribution(region_geometry: Dict[str, Any], zones: List[UrbanZone]) -> Dict[str, float]:
    try:
        region_shape = shape(region_geometry)
        distribution = {zone_type: 0.0 for zone_type in ZONE_TYPES.keys()}
        
        total_area = region_shape.area
        if total_area <= 0:
            return distribution
        
        for zone in zones:
            zone_area = shape(zone.geometry).area
            zone_percentage = (zone_area / total_area) * 100
            distribution[zone.zone_type] = zone_percentage
        
        return distribution
    except Exception as e:
        print(f"Error calculating zone distribution: {str(e)}")
        return {zone_type: 0.0 for zone_type in ZONE_TYPES.keys()}

# Analyze urban density
def analyze_urban_density(region_geometry: Dict[str, Any], zones: List[UrbanZone]) -> str:
    try:
        built_up_types = ["residential", "commercial", "industrial"]
        region_shape = shape(region_geometry)
        
        built_up_zones = [zone for zone in zones if zone.zone_type in built_up_types]
        if not built_up_zones:
            return "Low"
        
        built_up_area = sum(shape(zone.geometry).area for zone in built_up_zones)
        density_ratio = built_up_area / region_shape.area
        
        if density_ratio > 0.7:
            return "High"
        elif density_ratio > 0.4:
            return "Medium"
        else:
            return "Low"
    except Exception as e:
        print(f"Error analyzing urban density: {str(e)}")
        return "Unknown"

# Generate urban planning insights
async def get_insights(db: Session, region: Region) -> UrbanInsightsResponse:
    try:
        # Get zones within the region
        zones = db.query(UrbanZone).all()
        
        # Calculate metrics
        green_cover = calculate_green_cover(region.geometry, zones)
        zone_distribution = calculate_zone_distribution(region.geometry, zones)
        urban_density = analyze_urban_density(region.geometry, zones)
        
        # Generate recommendations based on analysis
        recommendations = []
        
        # Green cover recommendations
        if green_cover < 15:
            recommendations.extend([
                "Increase green spaces and urban forests",
                "Implement rooftop gardens in new developments",
                "Create pocket parks in dense areas"
            ])
        
        # Density-based recommendations
        if urban_density == "High":
            recommendations.extend([
                "Improve public transportation infrastructure",
                "Create more open spaces and recreational areas",
                "Implement traffic management solutions"
            ])
        
        # Zone balance recommendations
        if zone_distribution["residential"] > 70:
            recommendations.append("Diversify land use with mixed-development zones")
        
        if zone_distribution["industrial"] > 30:
            recommendations.extend([
                "Establish buffer zones between industrial and residential areas",
                "Implement stricter environmental monitoring"
            ])
        
        return UrbanInsightsResponse(
            region=region,
            insights=UrbanInsights(
                green_cover_percentage=round(green_cover, 2),
                zone_distribution={
                    ZONE_TYPES[k]: round(v, 2) for k, v in zone_distribution.items()
                },
                urban_density=urban_density,
                recommendations=recommendations
            ),
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        print(f"Error generating urban insights: {str(e)}")
        raise
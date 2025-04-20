from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List
import numpy as np
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

from app.models import UrbanZone
from app.schemas import Region, UrbanInsightsResponse, UrbanInsights

# Constants for analysis
ZONE_TYPES = {
    "residential": "Residential Area",
    "commercial": "Commercial Zone",
    "industrial": "Industrial Zone",
    "green_space": "Green Space",
    "water_body": "Water Body"
}

# Calculate green cover percentage for a region
def calculate_green_cover(db: Session, region: Region) -> float:
    # Create a circle around the point with given radius
    center = Point(region.lng, region.lat)
    
    # Query green spaces within the region
    green_zones = db.query(UrbanZone).filter(
        UrbanZone.zone_type == "green_space"
    ).all()
    
    # Calculate total area and green area
    total_area = np.pi * (region.radius ** 2)  # km²
    green_area = sum(
        shape(zone.boundary).intersection(center.buffer(region.radius)).area
        for zone in green_zones
    )
    
    return (green_area / total_area) * 100

# Assess drainage efficiency
def assess_drainage(db: Session, region: Region) -> str:
    # In production, this would use actual drainage infrastructure data
    # For now, we'll use a simplified assessment
    
    # Mock parameters (0-100 scale)
    drainage_coverage = np.random.normal(70, 10)  # Normal distribution around 70
    maintenance_score = np.random.normal(65, 15)  # Normal distribution around 65
    flood_history = np.random.normal(75, 10)  # Normal distribution around 75
    
    # Calculate overall score
    efficiency_score = (
        drainage_coverage * 0.4 +
        maintenance_score * 0.3 +
        flood_history * 0.3
    )
    
    # Determine efficiency level
    if efficiency_score >= 80:
        return "High"
    elif efficiency_score >= 60:
        return "Medium"
    else:
        return "Low"

# Identify flood-prone zones
def identify_flood_zones(db: Session, region: Region) -> int:
    # Query zones with high flood risk
    flood_prone_zones = db.query(UrbanZone).filter(
        UrbanZone.flood_risk_score >= 0.7
    ).all()
    
    # Create a circle around the point with given radius
    center = Point(region.lng, region.lat)
    search_area = center.buffer(region.radius)
    
    # Count zones that intersect with the search area
    return sum(
        1 for zone in flood_prone_zones
        if shape(zone.boundary).intersects(search_area)
    )

# Generate improvement suggestions
def generate_improvements(green_cover: float, drainage_efficiency: str, flood_zones: int) -> List[str]:
    suggestions = []
    
    # Green cover suggestions
    if green_cover < 20:
        suggestions.extend([
            "Increase urban forest cover through planned plantation",
            "Develop new parks and green spaces",
            "Implement mandatory green space in new developments"
        ])
    
    # Drainage suggestions
    if drainage_efficiency == "Low":
        suggestions.extend([
            "Upgrade stormwater drainage infrastructure",
            "Implement regular drain maintenance program",
            "Install rain gardens and bioswales"
        ])
    
    # Flood zone suggestions
    if flood_zones > 0:
        suggestions.extend([
            "Develop flood mitigation strategies for identified zones",
            "Restrict development in flood-prone areas",
            "Create water retention areas"
        ])
    
    return suggestions[:5]  # Return top 5 suggestions

# Main insights function
async def get_insights(db: Session, region: Region) -> UrbanInsightsResponse:
    # Calculate metrics
    green_cover = calculate_green_cover(db, region)
    drainage_efficiency = assess_drainage(db, region)
    flood_prone_zones = identify_flood_zones(db, region)
    
    # Generate improvement suggestions
    suggested_improvements = generate_improvements(
        green_cover,
        drainage_efficiency,
        flood_prone_zones
    )
    
    # Prepare response
    return UrbanInsightsResponse(
        insights=UrbanInsights(
            green_cover_percentage=round(green_cover, 2),
            drainage_efficiency=drainage_efficiency,
            flood_prone_zones=flood_prone_zones,
            suggested_improvements=suggested_improvements
        ),
        timestamp=datetime.utcnow().isoformat()
    )
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List
import numpy as np
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import requests
from ..models import Lake
from ..schemas import LakeHealthResponse, LakeHealthAssessment
from .lake_data_scraper import LakeDataScraper
from ..config.api_keys import API_KEYS, API_ENDPOINTS, CONFIG

weather_key = API_KEYS["openweathermap"]
weather_url = API_ENDPOINTS["weather"]
timeout = CONFIG["request_timeout"]

# Constants for analysis
WATER_QUALITY_THRESHOLDS = {
    "excellent": 90,
    "good": 70,
    "fair": 50,
    "poor": 30
}

ENCROACHMENT_THRESHOLDS = {
    "severe": 0.2,  # 20% area reduction
    "moderate": 0.1,  # 10% area reduction
    "minor": 0.05  # 5% area reduction
}

class LakeMonitoringService:
    def __init__(self):
        self.lake_scraper = LakeDataScraper()

    def generate_restoration_suggestions(self, water_quality: str, encroachment_level: str) -> List[str]:
        suggestions = []
        
        # Water quality suggestions
        if water_quality in ["Poor", "Fair"]:
            suggestions.extend([
                "Implement regular water quality monitoring",
                "Install aeration systems",
                "Remove aquatic weeds and debris"
            ])
        
        # Encroachment suggestions
        if encroachment_level in ["Severe", "Moderate"]:
            suggestions.extend([
                "Conduct detailed boundary survey",
                "Install boundary markers and fencing",
                "Increase surveillance and monitoring"
            ])
        
        # General suggestions
        suggestions.extend([
            "Engage local community in lake conservation",
            "Conduct regular clean-up drives"
        ])
        
        return suggestions

    async def analyze_water_quality(self, lake_id: str) -> str:
        try:
            # Get water quality data through web scraping
            water_data = await self.lake_scraper.get_water_quality(lake_id)
            
            # Calculate quality score based on scraped data
            quality_score = (
                (water_data['do'] / 8) * 40 +  # Dissolved oxygen (40% weight)
                (100 - abs(water_data['ph'] - 7) * 10) * 30 +  # pH (30% weight)
                ((10 - water_data['turbidity']) / 10) * 30  # Turbidity (30% weight)
            )
            
            # Determine quality category
            if quality_score >= WATER_QUALITY_THRESHOLDS["excellent"]:
                return "Excellent"
            elif quality_score >= WATER_QUALITY_THRESHOLDS["good"]:
                return "Good"
            elif quality_score >= WATER_QUALITY_THRESHOLDS["fair"]:
                return "Fair"
            else:
                return "Poor"
        except Exception as e:
            print(f"Error analyzing water quality: {str(e)}")
            return "Unknown"

    async def analyze_encroachment(self, lake_id: str) -> Dict[str, Any]:
        try:
            # Get historical and current area data
            historical_area = await self.lake_scraper.get_historical_area(lake_id)
            current_area = await self.lake_scraper.get_current_area(lake_id)
            
            # Calculate area reduction percentage
            area_reduction = (historical_area - current_area) / historical_area
            
            # Determine encroachment severity
            if area_reduction >= ENCROACHMENT_THRESHOLDS["severe"]:
                severity = "Severe"
            elif area_reduction >= ENCROACHMENT_THRESHOLDS["moderate"]:
                severity = "Moderate"
            elif area_reduction >= ENCROACHMENT_THRESHOLDS["minor"]:
                severity = "Minor"
            else:
                severity = "Negligible"
                
            return {
                "severity": severity,
                "area_reduction_percentage": round(area_reduction * 100, 2),
                "historical_area": historical_area,
                "current_area": current_area
            }
        except Exception as e:
            print(f"Error analyzing encroachment: {str(e)}")
            return {
                "severity": "Unknown",
                "area_reduction_percentage": 0,
                "historical_area": 0,
                "current_area": 0
            }

    async def assess_lake_health(self, db: Session, lake_id: str) -> LakeHealthResponse:
        # Fetch lake data from database
        lake = db.query(Lake).filter(Lake.id == lake_id).first()
        if not lake:
            raise ValueError(f"Lake with ID {lake_id} not found")
        
        # Get weather data from OpenWeather API
        try:
            weather_response = requests.get(
                weather_url,
                params={
                    'lat': lake.latitude,
                    'lon': lake.longitude,
                    'appid': weather_key,
                    'units': 'metric'
                },
                timeout=timeout
            )
            weather_data = weather_response.json()
        except Exception as e:
            print(f'Error fetching weather data: {str(e)}')
            weather_data = None
        
        # Analyze water quality
        water_quality = await self.analyze_water_quality(lake_id)
        
        # Analyze encroachment
        encroachment_data = await self.analyze_encroachment(lake_id)
        encroachment_risk = encroachment_data["severity"]
        
        # Determine restoration priority
        if water_quality == "Poor" or encroachment_risk == "Severe":
            restoration_priority = "High"
        elif water_quality == "Fair" or encroachment_risk == "Moderate":
            restoration_priority = "Medium"
        else:
            restoration_priority = "Low"
        
        # Generate restoration suggestions
        suggested_actions = self.generate_restoration_suggestions(water_quality, encroachment_risk)
        
        # Update lake record
        lake.water_quality = water_quality
        lake.encroachment_status = encroachment_risk
        lake.last_monitored = datetime.utcnow()
        db.commit()
        
        # Prepare response
        return LakeHealthResponse(
            lake={
                "id": lake.id,
                "name": lake.name,
                "area": lake.area,
                "last_monitored": lake.last_monitored.isoformat()
            },
            health_assessment=LakeHealthAssessment(
                water_quality=water_quality,
                encroachment_risk=encroachment_risk,
                restoration_priority=restoration_priority,
                suggested_actions=suggested_actions
            ),
            timestamp=datetime.utcnow().isoformat()
        )

    async def get_all_lakes(self) -> List[Dict[str, Any]]:
        try:
            lakes_data = await self.lake_scraper.get_all_lakes_data()
            return [{
                "id": lake["id"],
                "name": lake["name"],
                "location": lake["location"],
                "water_quality": await self.analyze_water_quality(lake["id"]),
                "encroachment": await self.analyze_encroachment(lake["id"])
            } for lake in lakes_data]
        except Exception as e:
            print(f"Error getting all lakes: {str(e)}")
            return []

    async def get_lake_by_id(self, lake_id: str) -> Dict[str, Any]:
        try:
            lake_data = await self.lake_scraper.get_lake_data(lake_id)
            if not lake_data:
                return None

            return {
                "id": lake_data["id"],
                "name": lake_data["name"],
                "location": lake_data["location"],
                "water_quality": await self.analyze_water_quality(lake_id),
                "encroachment": await self.analyze_encroachment(lake_id),
                "last_updated": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error getting lake by ID: {str(e)}")
            return None

    async def get_realtime_data(self) -> Dict[str, Any]:
        try:
            return await self.lake_scraper.get_realtime_data()
        except Exception as e:
            print(f"Error getting realtime data: {str(e)}")
            return {"error": str(e)}

# Standalone functions for backward compatibility
async def assess_lake_health(db: Session, lake_id: str) -> LakeHealthResponse:
    service = LakeMonitoringService()
    return await service.assess_lake_health(db, lake_id)

async def get_all_lakes(db: Session) -> List[Dict[str, Any]]:
    service = LakeMonitoringService()
    return await service.get_all_lakes()
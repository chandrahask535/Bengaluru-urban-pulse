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
from ..config.api_keys import API_KEYS

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

# Initialize data scraper
lake_scraper = LakeDataScraper()

# Analyze water quality based on scraped data
async def analyze_water_quality(lake_id: str) -> str:
    try:
        # Get water quality data through web scraping
        water_data = await lake_scraper.get_water_quality(lake_id)
        
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
        print(f'Error analyzing water quality: {str(e)}')
        return "Unknown"

# Detect encroachment using scraped data
async def detect_encroachment(lake_id: str) -> str:
    try:
        # Get encroachment data through web scraping
        encroachment_data = await lake_scraper.get_encroachment_data(lake_id)
        
        # Calculate encroachment level based on percentage
        encroachment_percentage = encroachment_data['percentage']
        
        # Determine encroachment level
        if encroachment_percentage >= ENCROACHMENT_THRESHOLDS["severe"] * 100:
            return "Severe"
        elif encroachment_percentage >= ENCROACHMENT_THRESHOLDS["moderate"] * 100:
            return "Moderate"
        elif encroachment_percentage >= ENCROACHMENT_THRESHOLDS["minor"] * 100:
            return "Minor"
        else:
            return "None"
    except Exception as e:
        print(f'Error detecting encroachment: {str(e)}')
        return "Unknown"

# Generate restoration suggestions based on assessment
def generate_restoration_suggestions(water_quality: str, encroachment_level: str) -> List[str]:
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

# Main lake health assessment function
async def assess_lake_health(db: Session, lake_id: str) -> LakeHealthResponse:
    # Fetch lake data from database
    lake = db.query(Lake).filter(Lake.id == lake_id).first()
    if not lake:
        raise ValueError(f"Lake with ID {lake_id} not found")
    
    # Get weather data from OpenWeather API
    try:
        weather_response = requests.get(
            'https://api.openweathermap.org/data/2.5/weather',
            params={
                'lat': lake.latitude,
                'lon': lake.longitude,
                'appid': API_KEYS['OPENWEATHER_API_KEY'],
                'units': 'metric'
            }
        )
        weather_data = weather_response.json()
    except Exception as e:
        print(f'Error fetching weather data: {str(e)}')
        weather_data = None
    
    # Get satellite imagery from NASA Earth API
    try:
        nasa_response = requests.get(
            'https://api.nasa.gov/planetary/earth/assets',
            params={
                'lat': lake.latitude,
                'lon': lake.longitude,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'dim': 0.1,
                'api_key': API_KEYS['NASA_EARTH_API_KEY']
            }
        )
        satellite_data = nasa_response.json()
    except Exception as e:
        print(f'Error fetching satellite data: {str(e)}')
        satellite_data = None
    
    # Analyze water quality using web scraping
    water_quality = await analyze_water_quality(lake_id)
    
    # Detect encroachment using web scraping
    encroachment_risk = await detect_encroachment(lake_id)
    
    # Determine restoration priority
    if water_quality == "Poor" or encroachment_risk == "Severe":
        restoration_priority = "High"
    elif water_quality == "Fair" or encroachment_risk == "Moderate":
        restoration_priority = "Medium"
    else:
        restoration_priority = "Low"
    
    # Generate restoration suggestions
    suggested_actions = generate_restoration_suggestions(water_quality, encroachment_risk)
    
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

# Fetch all lakes
async def get_all_lakes(db: Session):
    return db.query(Lake).order_by(Lake.name).all()
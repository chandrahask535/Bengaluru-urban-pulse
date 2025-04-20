from sqlalchemy.orm import Session
from datetime import datetime
import numpy as np
from typing import Dict, Any
import requests
from geopy.geocoders import Nominatim

from app.models import FloodPrediction
from app.schemas import Coordinates, FloodPredictionResponse

# OpenWeatherMap configuration
OWM_API_KEY = "your-api-key"  # Replace with actual API key
OWM_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

# Initialize geocoder
geolocator = Nominatim(user_agent="karnataka_urban_pulse")

# Load and initialize ML model
def load_ml_model():
    """Load the trained ML model for flood prediction.
    In production, this would load a properly trained model from a file.
    For now, we'll use a simple rule-based system."""
    pass

# Fetch weather data from OpenWeatherMap API
async def fetch_weather_data(location: Coordinates) -> Dict[str, Any]:
    weather_service = WeatherService(OWM_API_KEY)
    return await weather_service.get_weather_data(location.lat, location.lng)

# Calculate flood risk based on various parameters
def calculate_flood_risk(weather_data: Dict[str, Any], location: Coordinates) -> Dict[str, Any]:
    # Get elevation and terrain data (mock implementation)
    elevation = 900  # Bangalore's average elevation
    
    # Calculate risk based on multiple factors
    rainfall_risk = min(weather_data["rainfall"] / 50.0, 1.0)  # Normalize rainfall
    humidity_risk = (weather_data["humidity"] - 60) / 40.0  # Normalize humidity
    
    # Combined risk score (0-1)
    risk_score = (0.6 * rainfall_risk + 0.4 * humidity_risk)
    
    # Determine risk level
    if risk_score > 0.7:
        risk_level = "Critical"
        probability = min(risk_score + 0.2, 0.95)
    elif risk_score > 0.5:
        risk_level = "High"
        probability = risk_score
    elif risk_score > 0.3:
        risk_level = "Moderate"
        probability = risk_score
    else:
        risk_level = "Low"
        probability = max(risk_score, 0.05)
    
    return {
        "risk_level": risk_level,
        "probability": probability
    }

# Main prediction function
async def predict_flood_risk(db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
    # Fetch current weather data
    weather_data = await fetch_weather_data(location)
    
    # Calculate flood risk
    risk_assessment = calculate_flood_risk(weather_data, location)
    
    # Create database entry
    db_prediction = FloodPrediction(
        area_name=area_name,
        location=f"POINT({location.lng} {location.lat})",
        rainfall_forecast=weather_data["rainfall"],
        risk_level=risk_assessment["risk_level"],
        probability=risk_assessment["probability"],
        prediction_date=datetime.utcnow()
    )
    
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    # Prepare response
    return FloodPredictionResponse(
        prediction={
            "risk_level": risk_assessment["risk_level"],
            "probability": risk_assessment["probability"]
        },
        weather={"rainfall": weather_data["rainfall"]},
        timestamp=datetime.utcnow().isoformat()
    )

# Fetch recent predictions
async def get_recent_predictions(db: Session, limit: int = 10):
    return db.query(FloodPrediction)\
             .order_by(FloodPrediction.created_at.desc())\
             .limit(limit)\
             .all()
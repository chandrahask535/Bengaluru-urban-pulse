

"""Simplified Flood Prediction Service with mock predictions to ensure endpoints work cleanly without dataset or model dependency."""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from ..schemas import Coordinates, FloodPredictionResponse

# Mock data for area-specific info (simplified)
AREA_DATA = {
    "Koramangala": {"risk_level": "High", "probability": 0.75},
    "Bellandur": {"risk_level": "Moderate", "probability": 0.50},
    "HSR Layout": {"risk_level": "Low", "probability": 0.20},
    "Whitefield": {"risk_level": "Low", "probability": 0.10},
    "Bangalore Central": {"risk_level": "Moderate", "probability": 0.45},
}

import logging
logger = logging.getLogger(__name__)

class FloodPredictionService:
    def __init__(self):
        self.area_data = AREA_DATA

    async def predict_flood(self, area_name: str = "Bangalore Central") -> Dict[str, Any]:
        """Return a mock flood risk prediction based on area_name or default."""
        try:
            # Use mock data with fallback
            area_key = area_name.strip()
            prediction = self.area_data.get(area_key, {"risk_level": "Low", "probability": 0.15})

            return {
                "area_name": area_key,
                "risk_level": prediction["risk_level"],
                "probability": prediction["probability"],
                "prediction_time": datetime.utcnow().isoformat(),
                "message": f"Flood risk prediction for {area_key}: {prediction['risk_level']} risk"
            }
        except Exception as e:
            logger.error(f"Error predicting flood risk: {str(e)}")
            raise

    async def predict_flood_risk(self, db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
        """Return a mock flood risk prediction based on area_name or default."""
        try:
            # Use mock data with fallback
            area_key = area_name.strip()
            prediction = self.area_data.get(area_key, {"risk_level": "Low", "probability": 0.15})

            return FloodPredictionResponse(
                area_name=area_key,
                coordinates=location,
                risk_level=prediction["risk_level"],
                probability=prediction["probability"],
                prediction_time=datetime.utcnow().isoformat(),
                message=f"Flood risk prediction for {area_key}: {prediction['risk_level']} risk"
            )
        except Exception as e:
            logger.error(f"Error predicting flood risk: {str(e)}")
            raise

# Standalone functions for backward compatibility
async def predict_flood_risk(db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
    service = FloodPredictionService()
    return await service.predict_flood_risk(db, location, area_name)

async def get_recent_predictions(db: Session, limit: int = 10) -> Dict[str, Any]:
    # Mock recent predictions
    predictions = [
        {
            "area_name": "Koramangala",
            "risk_level": "High",
            "probability": 0.75,
            "prediction_time": datetime.utcnow().isoformat()
        },
        {
            "area_name": "Bellandur",
            "risk_level": "Moderate",
            "probability": 0.50,
            "prediction_time": datetime.utcnow().isoformat()
        }
    ]
    return {"predictions": predictions[:limit]}

async def retrain_model() -> Dict[str, Any]:
    # Mock retraining response
    return {
        "status": "success",
        "message": "Model retraining completed successfully",
        "metrics": {
            "accuracy": 0.85,
            "precision": 0.82,
            "recall": 0.88
        },
        "timestamp": datetime.utcnow().isoformat()
    }


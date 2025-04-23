
"""
Simplified Flood Prediction Service with mock predictions to ensure endpoints work cleanly without dataset or model dependency.
"""

from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from app.schemas import Coordinates, FloodPredictionResponse

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

async def predict_flood_risk(db: Session, location: Coordinates, area_name: str) -> FloodPredictionResponse:
    """
    Return a mock flood risk prediction based on area_name or default.
    """
    try:
        # Use mock data with fallback
        area_key = area_name.strip()
        prediction = AREA_DATA.get(area_key, {"risk_level": "Low", "probability": 0.15})

        # For simplicity, create a dummy rainfall value
        dummy_rainfall = 10.0  # mm

        # Store a record in DB (simulate) - ignoring real location storage complexity
        from app.models import FloodPrediction
        from datetime import datetime
        new_prediction = FloodPrediction(
            area_name=area_key,
            location=f"POINT({location.lng} {location.lat})",
            prediction_date=datetime.utcnow(),
            rainfall_forecast=dummy_rainfall,
            risk_level=prediction["risk_level"],
            probability=prediction["probability"]
        )
        db.add(new_prediction)
        db.commit()
        db.refresh(new_prediction)

        return FloodPredictionResponse(
            prediction=prediction,
            weather={"rainfall": dummy_rainfall},
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.error(f"Error in predict_flood_risk: {str(e)}")
        return FloodPredictionResponse(
            prediction={"risk_level": "Low", "probability": 0.0},
            weather={"rainfall": 0.0},
            timestamp=datetime.utcnow().isoformat()
        )

async def get_recent_predictions(db: Session, limit: int = 10):
    """
    Return recent predictions from DB (mocked by fetching DB entries).
    """
    try:
        from app.models import FloodPrediction
        return db.query(FloodPrediction).order_by(FloodPrediction.prediction_date.desc()).limit(limit).all()
    except Exception as e:
        logger.error(f"Error fetching recent predictions: {str(e)}")
        return []

async def retrain_model(db: Session) -> Dict[str, Any]:
    """
    Dummy retrain that immediately returns success since no actual model.
    """
    try:
        # No action needed in mock service
        return {
            "success": True,
            "message": "Mock model retrained successfully.",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retraining model: {str(e)}")
        return {
            "success": False,
            "message": f"Error retraining model: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

